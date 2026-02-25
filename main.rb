require 'rubygems'
require 'bundler'

Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

if settings.development?
  require 'debug'
  require 'dotenv'
  Dotenv.load
end

require 'sendgrid-ruby'
require 'net/http'
require 'json'
require 'securerandom'
require 'openssl'
require 'rack/attack'

## Global Settings ##
set :public_folder, Proc.new { File.join(root, "_site") }
set :protection, except: :frame_options

enable :sessions
set :session_secret, ENV.fetch('SESSION_SECRET') { SecureRandom.hex(64) }

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

  # 6. Build email and send via SendGrid
  begin
    name    = Rack::Utils.escape_html(params[:name].to_s)
    email   = Rack::Utils.escape_html(params[:email].to_s)
    phone   = Rack::Utils.escape_html(params[:phone].to_s)
    message = Rack::Utils.escape_html(params[:message].to_s)

    html_body = <<~HTML
      <div style="font-family:Helvetica;">
        <h2>Contact Information</h2>
        <table style="font-size:11pt;">
          <tbody>
            <tr><td width="25%">Name:</td><td>#{name}</td></tr>
            <tr><td>Email:</td><td>#{email}</td></tr>
            <tr><td>Phone:</td><td>#{phone}</td></tr>
          </tbody>
        </table>
        <h2>Message</h2>
        <p style="font-size:11pt;">#{message}</p>
      </div>
    HTML

    text_body = <<~TEXT
      Contact Information
      ====================
      Name:  #{params[:name]}
      Email: #{params[:email]}
      Phone: #{params[:phone]}

      Message
      ====================
      #{params[:message]}
    TEXT

    from = SendGrid::Email.new(email: 'contact@velocitylabs.io', name: 'Velocity Labs')
    to = SendGrid::Email.new(email: 'contact@velocitylabs.io', name: 'Velocity Labs')
    subject = "Contact form from #{params[:name]}"

    mail = SendGrid::Mail.new
    mail.from = from
    mail.subject = subject
    mail.reply_to = SendGrid::Email.new(email: params[:email], name: params[:name])

    personalization = SendGrid::Personalization.new
    personalization.add_to(to)
    mail.add_personalization(personalization)
    mail.add_content(SendGrid::Content.new(type: 'text/plain', value: text_body))
    mail.add_content(SendGrid::Content.new(type: 'text/html', value: html_body))

    sg = SendGrid::API.new(api_key: ENV['SENDGRID_API_KEY'])
    sg_response = sg.client.mail._('send').post(request_body: mail.to_json)

    if sg_response.status_code.to_i.between?(200, 299)
      { status: :success }.to_json
    else
      puts "SendGrid error: #{sg_response.status_code} #{sg_response.body}"
      { status: :failure }.to_json
    end
  rescue => e
    puts "Contact form error: #{e.message}"
    { status: :failure }.to_json
  end
end
