require 'rubygems'
require 'bundler'

Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

if settings.development?
  require 'debug'
  require 'dotenv'
  Dotenv.load
end

require 'net/http'
require 'json'
require 'securerandom'
require 'openssl'
require 'yaml'
require 'rack/attack'

## Global Settings ##
set :public_folder, Proc.new { File.join(root, "_site") }
set :protection, except: :frame_options
mime_type :md, 'text/markdown' # Markdown copies of pages (_plugins/markdown_export.rb)

# Redirect http -> https and www -> bare domain in one hop, behind the Heroku
# router. Middleware (not a before filter) because Sinatra serves static
# files before filters run.
class ForceHttps
  def initialize(app)
    @app = app
  end

  def call(env)
    req = Rack::Request.new(env)
    insecure = env['HTTP_X_FORWARDED_PROTO'] == 'http'
    www = req.host.start_with?('www.')
    return @app.call(env) unless insecure || www

    status = req.get? || req.head? ? 301 : 308
    location = "https://#{req.host.delete_prefix('www.')}#{req.fullpath}"
    [status, { 'location' => location, 'content-type' => 'text/html' }, []]
  end
end

# Pages that moved (config/redirects.yml) get one 301 straight to their new
# path: with or without the trailing slash, keeping the query string, and for
# the page's Markdown copy too when the built site (site_dir) has one. It runs
# ahead of ForceHttps, so in production (canonical: true) an old http or www
# link also lands on https and the bare domain in that single hop.
class MovedPages
  def initialize(app, moves, canonical: false, site_dir: nil)
    @app = app
    @canonical = canonical
    @moves = moves.each_with_object({}) do |(from, to), map|
      from = from.chomp('/')
      map[from] = to
      markdown = "#{to.chomp('/')}.md"
      map["#{from}.md"] = markdown if site_dir && File.exist?(File.join(site_dir, markdown))
    end
  end

  def call(env)
    req = Rack::Request.new(env)
    target = @moves[req.path_info.chomp('/')] if req.get? || req.head?
    return @app.call(env) unless target

    target += "?#{req.query_string}" unless req.query_string.empty?
    target = "https://#{req.host.delete_prefix('www.')}#{target}" if @canonical
    [301, { 'location' => target, 'content-type' => 'text/html' }, []]
  end
end

# Security and caching headers for every response, including static files
class SecurityHeaders
  HEADERS = {
    'x-content-type-options' => 'nosniff',
    'referrer-policy'        => 'strict-origin-when-cross-origin',
    'permissions-policy'     => 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  }.freeze
  # Short while https settles in; raise to 31536000 (one year) once stable
  HSTS = 'max-age=86400'.freeze

  def initialize(app, hsts: false)
    @app = app
    @hsts = hsts
  end

  def call(env)
    status, headers, body = @app.call(env)
    HEADERS.each { |name, value| headers[name] ||= value }
    headers['strict-transport-security'] = HSTS if @hsts
    if (cache = cache_control(env['PATH_INFO'])) && status == 200
      headers['cache-control'] = cache
    end
    [status, headers, body]
  end

  private

  def cache_control(path)
    if path.start_with?('/vite/assets/')
      'public, max-age=31536000, immutable' # content-hashed filenames
    elsif path.start_with?('/images/') || %w[/favicon.ico /apple-touch-icon.png].include?(path)
      'public, max-age=604800'
    end
  end
end

use MovedPages, YAML.load_file(File.expand_path('config/redirects.yml', __dir__)),
    canonical: settings.production?, site_dir: settings.public_folder
use ForceHttps if settings.production?
use SecurityHeaders, hsts: settings.production?
use Rack::Attack

# In-memory cache store for Rack::Attack (no ActiveSupport needed)
class MemoryStore
  def initialize
    @data = {}
    @expires = {}
    @mutex = Mutex.new
  end

  def read(key)
    @mutex.synchronize do
      expire(key)
      @data[key]
    end
  end

  def write(key, value, options = {})
    @mutex.synchronize do
      @data[key] = value
      @expires[key] = Time.now + options[:expires_in] if options[:expires_in]
    end
  end

  def increment(key, amount = 1, options = {})
    @mutex.synchronize do
      expire(key)
      if @data.key?(key)
        @data[key] += amount
      else
        @data[key] = amount
        @expires[key] = Time.now + options[:expires_in] if options[:expires_in]
      end
      @data[key]
    end
  end

  def delete(key)
    @mutex.synchronize { @data.delete(key); @expires.delete(key) }
  end

  private

  def expire(key)
    if @expires[key] && @expires[key] < Time.now
      @data.delete(key)
      @expires.delete(key)
    end
  end
end

Rack::Attack.cache.store = MemoryStore.new

Rack::Attack.throttle('contact-form/ip', limit: 5, period: 3600) do |req|
  req.ip if req.path.start_with?('/contact-form') && req.post?
end

Rack::Attack.throttled_responder = lambda do |_env|
  [429, { 'Content-Type' => 'application/json' }, [{ status: :rate_limited }.to_json]]
end

# TODO: re-enable Stripe integration
# require 'stripe'
# Stripe.api_key = ENV['STRIPE_SECRET_KEY']

IP_BLACKLIST = %w()

## Error Handling
not_found do
  last_modified File.mtime("_site/404/index.html")
  File.read("_site/404/index.html")
end

FORM_TOKEN_SECRET = ENV.fetch('SESSION_SECRET') { SecureRandom.hex(64) }

# The contact form's "What do you need?" options, by service id (the form's
# `need` value) => label, from the same list the site builds the form from
SERVICE_NEEDS = YAML.load_file(File.expand_path('_data/services.yml', __dir__))
                    .each_with_object({}) { |service, needs| needs[service['id']] = service['need'] if service['need'] }
                    .freeze

def generate_form_token
  timestamp = Time.now.to_i
  nonce = SecureRandom.hex(16)
  data = "#{timestamp}:#{nonce}"
  signature = OpenSSL::HMAC.hexdigest('SHA256', FORM_TOKEN_SECRET, data)
  "#{data}:#{signature}"
end

def verify_form_token(token)
  parts = token.to_s.split(':')
  return false unless parts.length == 3

  data = "#{parts[0]}:#{parts[1]}"
  expected = OpenSSL::HMAC.hexdigest('SHA256', FORM_TOKEN_SECRET, data)
  return false unless Rack::Utils.secure_compare(expected, parts[2])

  elapsed = Time.now.to_i - parts[0].to_i
  elapsed >= 3 && elapsed <= 3600
end

## GET requests ##
get '/form-token' do
  content_type :json
  { token: generate_form_token }.to_json
end

get '/' do
  if params[:ref]
    match = params[:ref].match(/(.*?)\/(.*)/)
    if match && match[2]
      redirect "/#{match[2]}?ref=#{match[1]}"
    end
  end

  last_modified File.mtime("_site/index.html")
  File.read("_site/index.html")
end

# Catch All
get "/*" do |title|
  if request.user_agent == '<?php system("id"); ?>' or IP_BLACKLIST.include?(request.ip)
    ''
  else
    begin
      last_modified File.mtime("_site/#{title}/index.html")
      File.read("_site/#{title}/index.html")
    rescue
      if params[:ref] =~ /flatterline/i
        last_modified File.mtime("_site/index.html")
        File.read("_site/index.html")

      elsif params[:ref] =~ /burstdev/i
        case title
          when /^contact/
            redirect '/#contact'
          when /^(projects|pages)/
            redirect '/portfolio'
          else
            last_modified File.mtime("_site/index.html")
            File.read("_site/index.html")
        end

      else
        raise Sinatra::NotFound
      end
    end
  end
end

## POST requests ##

# TODO: re-enable Stripe charge route
# post '/charge' do
#   puts params
#   customer = Stripe::Customer.create(
#     email: params[:stripeEmail],
#     card: params[:stripeToken],
#     metadata: {
#       phone: params[:phone],
#       company: params[:company],
#       name: params[:name]
#     }
#   )
#
#   customer.subscriptions.create plan: "maintenance-2"
#
#   redirect '/ruby-on-rails/maintenance/thank-you'
# end
#
# error Stripe::CardError do
#   env['sinatra.error'].message
# end

post '/contact-form/?' do
  content_type :json

  # 1. Honeypot check — bots fill hidden fields
  unless params['hp-input'].to_s.strip.empty?
    puts "Anti-spam: honeypot field filled"
    return { status: :failure }.to_json
  end

  # 2. Email format validation
  unless params[:email].to_s.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
    puts "Anti-spam: invalid email format: #{params[:email]}"
    return { status: :failure }.to_json
  end

  # 3. CSRF + timing check via signed token
  unless verify_form_token(params['_csrf_token'])
    puts "Anti-spam: invalid or expired form token"
    return { status: :failure }.to_json
  end

  # 5. reCAPTCHA verification
  recaptcha_response = Net::HTTP.post_form(
    URI('https://www.google.com/recaptcha/api/siteverify'),
    'secret' => ENV['RECAPTCHA_SECRET_KEY'],
    'response' => params['g-recaptcha-response'],
    'remoteip' => request.ip
  )
  recaptcha = JSON.parse(recaptcha_response.body)

  # reCAPTCHA v3: check both success and score threshold
  unless recaptcha['success'] && recaptcha['score'].to_f >= 0.5
    puts "reCAPTCHA failed: success=#{recaptcha['success']} score=#{recaptcha['score']}"
    return { status: :failure }.to_json
  end

  # 6. Build email and send via Resend
  begin
    # Optional fields: the form has no phone field (older forms did), and an
    # unknown or missing need (say, from a cached page) is simply left out
    need  = SERVICE_NEEDS[params[:need].to_s]
    phone = params[:phone].to_s.strip
    details = [['Name', params[:name].to_s], ['Email', params[:email].to_s]]
    details << ['Phone', phone] unless phone.empty?
    details << ['Need', need] if need

    rows = details.map.with_index do |(label, value), i|
      width = i.zero? ? ' width="25%"' : ''
      "<tr><td#{width}>#{label}:</td><td>#{Rack::Utils.escape_html(value)}</td></tr>"
    end
    message = Rack::Utils.escape_html(params[:message].to_s).gsub(/\r\n?|\n/, "<br>\n") # keep its line breaks

    html_body = <<~HTML
      <div style="font-family:Helvetica;">
        <h2>Contact Information</h2>
        <table style="font-size:11pt;">
          <tbody>
            #{rows.join("\n            ")}
          </tbody>
        </table>
        <h2>Message</h2>
        <p style="font-size:11pt;">#{message}</p>
      </div>
    HTML

    text_body = <<~TEXT
      Contact Information
      ====================
      #{details.map { |label, value| "#{"#{label}:".ljust(6)} #{value}" }.join("\n")}

      Message
      ====================
      #{params[:message]}
    TEXT

    email_request = Net::HTTP::Post.new(
      URI('https://api.resend.com/emails'),
      'Authorization' => "Bearer #{ENV['RESEND_API_KEY']}",
      'Content-Type'  => 'application/json'
    )
    email_request.body = {
      from:     ENV.fetch('CONTACT_FORM_FROM', 'Velocity Labs <contact@velocitylabs.io>'),
      to:       ['contact@velocitylabs.io'],
      reply_to: params[:email].to_s, # validated above
      subject:  "Contact form from #{params[:name].to_s.gsub(/[\r\n]+/, ' ').strip}#{" (#{need})" if need}",
      text:     text_body,
      html:     html_body
    }.to_json

    email_response = Net::HTTP.start('api.resend.com', 443, use_ssl: true, open_timeout: 10, read_timeout: 15) do |http|
      http.request(email_request)
    end

    if email_response.is_a?(Net::HTTPSuccess)
      { status: :success }.to_json
    else
      puts "Resend error: #{email_response.code} #{email_response.body}"
      { status: :failure }.to_json
    end
  rescue => e
    puts "Contact form error: #{e.message}"
    { status: :failure }.to_json
  end
end
