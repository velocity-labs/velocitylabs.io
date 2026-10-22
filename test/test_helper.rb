ENV['RACK_ENV'] = 'test'
ENV['SESSION_SECRET'] ||= 'test-secret-' * 12
ENV['RESEND_API_KEY'] ||= 're_test_key'

require 'minitest/autorun'
require 'rack/test'
require_relative '../main'

unless File.exist?(File.expand_path('../_site/index.html', __dir__))
  abort 'Build the site first (bundle exec jekyll build): page tests read _site/'
end

class AppTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def setup
    Rack::Attack.cache.store = MemoryStore.new # fresh rate-limit counters
    @resend_requests = []
  end

  # A form token issued `age` seconds ago, signed like generate_form_token
  def form_token(age: 10)
    data = "#{Time.now.to_i - age}:#{SecureRandom.hex(16)}"
    "#{data}:#{OpenSSL::HMAC.hexdigest('SHA256', FORM_TOKEN_SECRET, data)}"
  end

  def contact_params(overrides = {})
    { 'name' => 'Jane Doe', 'email' => 'jane@example.com', 'phone' => '555-0100',
      'message' => 'Hello', '_csrf_token' => form_token, 'g-recaptcha-response' => 'token' }.merge(overrides)
  end

  # Fakes reCAPTCHA verification (Net::HTTP.post_form) and the Resend API
  # (Net::HTTP.start), recording requests sent to Resend.
  def with_fake_network(recaptcha_score: 0.9, resend_status: 200)
    original_post_form = Net::HTTP.method(:post_form)
    original_start = Net::HTTP.method(:start)
    requests = @resend_requests

    Net::HTTP.define_singleton_method(:post_form) do |_uri, _params|
      Struct.new(:body).new({ success: true, score: recaptcha_score }.to_json)
    end
    Net::HTTP.define_singleton_method(:start) do |host, _port, **_options, &block|
      raise "unexpected HTTP call to #{host}" unless host == 'api.resend.com'

      http = Object.new
      http.define_singleton_method(:request) do |request|
        requests << request
        response = Net::HTTPResponse::CODE_TO_OBJ[resend_status.to_s].new('1.1', resend_status.to_s, '')
        response.instance_variable_set(:@body, '{}')
        response.instance_variable_set(:@read, true)
        response
      end
      block.call(http)
    end
    yield
  ensure
    Net::HTTP.define_singleton_method(:post_form, original_post_form)
    Net::HTTP.define_singleton_method(:start, original_start)
  end

  def json
    JSON.parse(last_response.body)
  end
end
