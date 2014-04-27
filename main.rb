require "rubygems"
require "bundler"
require 'mandrill'
Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

configure :production do
  require 'newrelic_rpm'
end

before do
  if ENV['RACK_ENV'] == 'production'
    cache_control :public, :must_revalidate, max_age: 60 * 60 * 24
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
      raise Sinatra::NotFound
    end
  end
end

## POST requests ##
post '/contact-form/?' do
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
    from_email: params[:email],
    from_name:  "#{params[:first_name]} #{params[:last_name]}",
    text:       textBody,
    to: [{
      email: "contact@velocitylabs.io",
      name:  "Velocity Labs"
    }],
    html: htmlBody
  }

  response = m.messages.send message

  content_type :json
  status 200
  body response.to_json
end
