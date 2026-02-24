require 'rubygems'
require 'bundler'

Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

require 'debug' if settings.development?

# configure :production do
#   require 'newrelic_rpm'
# end

# TODO: re-enable Pony email integration
# require 'pony'
# configure :production do
#   Pony.options = {
#     via: :smtp,
#     via_options: {
#       address:              'smtp.sendgrid.net',
#       port:                 '587',
#       domain:               'velocitylabs.io',
#       user_name:            ENV['SENDGRID_USERNAME'],
#       password:             ENV['SENDGRID_PASSWORD'],
#       authentication:       :plain,
#       enable_starttls_auto: true
#     }
#   }
# end

## Global Settings ##
set :public_folder, Proc.new { File.join(root, "_site") }
set :protection, except: :frame_options

# TODO: re-enable Stripe integration
# require 'stripe'
# Stripe.api_key = ENV['STRIPE_SECRET_KEY']

IP_BLACKLIST = %w()

## Error Handling
not_found do
  last_modified File.mtime("_site/404/index.html")
  File.read("_site/404/index.html")
end

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

# TODO: re-enable contact form route
# post '/contact-form/?' do
#   recaptcha_raw_response = RestClient.post 'https://www.google.com/recaptcha/api/siteverify', secret: ENV['RECAPTCHA_SECRET_KEY'], response: params['g-recaptcha-response'], remoteip: request.ip
#   recaptcha = JSON.parse recaptcha_raw_response
#
#   if recaptcha["success"] == true
#     htmlBody = %Q{
#       <div style="font-family:Helvetica;">
#         <h2>Contact Information</h2>
#         <table style="font-size:11pt;">
#           <tbody>
#             <tr><td width="25%">Name:</td><td>#{params[:name]}</td></tr>
#             <tr><td>Email:</td><td>#{params[:email]}</td></tr>
#             <tr><td>Phone:</td><td>#{params[:phone]}</td></tr>
#           </tbody>
#         </table>
#         <h2>Message</h2>
#         <p style="font-size:11pt;">#{params[:message]}</p>
#       </div>
#     }
#
#     textBody = %Q{
#       Contact Information
#       ====================
#       Name:  #{params[:name]}
#       Email: #{params[:email]}
#       Phone: #{params[:phone]}
#
#       Message
#       ====================
#       #{params[:message]}
#     }
#
#     begin
#       res = Pony.mail(
#         to:        "Velocity Labs <contact@velocitylabs.io>",
#         from:      "contact@velocitylabs.io",
#         reply_to:  "#{params[:name]} <#{params[:email]}>",
#         subject:   "Project contact form from #{params[:name]}",
#         body:      textBody,
#         html_body: htmlBody
#       )
#       response = res ? { status: :success } : { status: :failure }
#     rescue
#       response = { status: :failure }
#     end
#   else
#     response = { status: :failure }
#   end
#
#   content_type :json
#   status 200
#   body response.to_json
# end
