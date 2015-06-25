require "rubygems"
require "bundler"
require 'mandrill'
Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

configure :production do
  require 'newrelic_rpm'
end

configure :production, :development do
  file = File.new("log/#{settings.environment}.log", 'a+')
  file.sync = true
  use Rack::CommonLogger, file
end

before do
  if ENV['RACK_ENV'] == 'production'
    cache_control :public, :must_revalidate, max_age: 60 * 10
  end
end

## Global Settings ##
set :public_folder, Proc.new { File.join(root, "_site") }
set :protection, except: :frame_options
set :static_cache_control, [:public, max_age: 60 * 60 * 24 * 365]

IP_BLACKLIST = %w()

## Error Handling
not_found do
  last_modified File.mtime("_site/404/index.html")
  File.read("_site/404/index.html")
end

# error 500..510 do
#   File.read("_site/500.html")
# end

## GET requests ##
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
post '/contact-form/?' do
  if params['hp-input'].nil? || params['hp-input'].empty?
    m = Mandrill::API.new

    htmlBody = %Q{
      <div style="font-family:Helvetica;">
        <h2>Contact Information</h2>

        <table style="font-size:11pt;">
          <tbody>
            <tr>
              <td width="25%">First name:</td>
              <td>#{params[:first_name]}</td>
            </tr>
            <tr>
              <td>Last name:</td>
              <td>#{params[:last_name]}</td>
            </tr>
            <tr>
              <td>Company:</td>
              <td>#{params[:company]}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>#{params[:email]}</td>
            </tr>
            <tr>
              <td>Phone:</td>
              <td>#{params[:phone]}</td>
            </tr>
            <tr>
              <td>Budget:</td>
              <td>#{params[:budget]}</td>
            </tr>
          </tbody>
        </table>

        <h2>Message</h2>
        <p style="font-size:11pt;">#{params[:message]}</p>
      </div>
    }

    textBody = %Q{
      Contact Information
      ====================

      First name: #{params[:first_name]}
      Last name:  #{params[:last_name]}
      Company:    #{params[:company]}
      Email:      #{params[:email]}
      Phone:      #{params[:phone]}
      Budget:     #{params[:budget]}

      Message
      ====================

      #{params[:message]}
    }

    message = {
      subject:    "A contact form was received",
      from_email: "contact@velocitylabs.io",
      from_name:  "#{params[:first_name]} #{params[:last_name]}",
      headers:    { "Reply-To" => params[:email] },
      text:       textBody,
      to: [{
        email: "contact@velocitylabs.io",
        name:  "Velocity Labs"
      }],
      html: htmlBody
    }

    response = m.messages.send message
  else
    response = [{
      email: "contact@velocitylabs.io",
      status: "sent",
      _id: "1234",
      reject_reason: nil
    }]

    logger.error '*'*100
    logger.error "HONEYPOT CAPTCHA CAUGHT SOME SPAM!"
    logger.error params.to_s
    logger.error '*'*100
  end

  content_type :json
  status 200
  body response.to_json
end
