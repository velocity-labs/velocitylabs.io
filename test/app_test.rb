require_relative 'test_helper'

class PagesTest < AppTest
  def test_home_page
    get '/'
    assert_equal 200, last_response.status
    assert_includes last_response.body, 'Velocity Labs'
  end

  def test_missing_page_renders_404
    get '/no-such-page'
    assert_equal 404, last_response.status
    assert_includes last_response.body, "find that content"
  end

  def test_markdown_copies_are_served_as_markdown
    get '/index.md'
    assert_equal 200, last_response.status
    assert_match %r{\Atext/markdown}, last_response.content_type
  end

  def test_legacy_ref_redirects
    get '/', ref: 'foo/blog'
    assert_equal 302, last_response.status
    assert_match %r{/blog\?ref=foo\z}, last_response.location

    get '/contact', ref: 'burstdev'
    assert_match %r{/#contact\z}, last_response.location
  end

  # A service page's form starts with that service chosen, and the Rails
  # upgrade option appears only on its own page
  def test_contact_form_preselects_the_pages_service
    get '/ruby-on-rails/upgrades/'
    assert_includes last_response.body, 'value="ruby-on-rails-upgrades" checked'
    refute_includes last_response.body, 'value="project-rescue" checked'

    get '/'
    refute_includes last_response.body, 'value="ruby-on-rails-upgrades"'
  end
end

class ContactFormTest < AppTest
  def test_form_token_is_signed
    get '/form-token'
    timestamp, nonce, signature = json['token'].split(':')
    assert_in_delta Time.now.to_i, timestamp.to_i, 5
    assert_equal 32, nonce.length
    assert_equal OpenSSL::HMAC.hexdigest('SHA256', FORM_TOKEN_SECRET, "#{timestamp}:#{nonce}"), signature
  end

  def test_valid_submission_sends_email_through_resend
    with_fake_network do
      post '/contact-form', contact_params('message' => '<b>Hi</b> & bye')
    end

    assert_equal 'success', json['status']
    request = @resend_requests.fetch(0)
    email = JSON.parse(request.body)
    assert_equal 'https://api.resend.com/emails', request.uri.to_s
    assert_equal 'Bearer re_test_key', request['Authorization']
    assert_equal 'Velocity Labs <contact@velocitylabs.io>', email['from']
    assert_equal ['contact@velocitylabs.io'], email['to']
    assert_equal 'jane@example.com', email['reply_to']
    assert_equal 'Contact form from Jane Doe', email['subject']
    assert_includes email['html'], '&lt;b&gt;Hi&lt;/b&gt; &amp; bye'
    assert_includes email['text'], '<b>Hi</b> & bye'
  end

  def test_newlines_in_name_cannot_inject_headers
    with_fake_network { post '/contact-form', contact_params('name' => "Jane\r\nBcc: evil@example.com") }
    assert_equal 'Contact form from Jane Bcc: evil@example.com', JSON.parse(@resend_requests.fetch(0).body)['subject']
  end

  def test_chosen_service_is_in_the_subject_and_body
    with_fake_network { post '/contact-form', contact_params('need' => 'code-audit') }

    email = JSON.parse(@resend_requests.fetch(0).body)
    assert_equal 'Contact form from Jane Doe (Code audit)', email['subject']
    assert_includes email['html'], '<td>Need:</td><td>Code audit</td>'
    assert_includes email['text'], 'Need:  Code audit'
  end

  # Cached pages may still send old values, and a blank choice is allowed
  def test_unknown_or_missing_need_still_sends
    ['', 'not-a-service', '<script>'].each do |need|
      with_fake_network { post '/contact-form', contact_params('need' => need) }
      assert_equal 'success', json['status']
    end

    @resend_requests.each do |request|
      email = JSON.parse(request.body)
      assert_equal 'Contact form from Jane Doe', email['subject']
      refute_includes email['text'], 'Need:'
    end
  end

  # The form no longer asks for a phone number; older forms still send one
  def test_phone_appears_only_when_sent
    with_fake_network { post '/contact-form', contact_params('phone' => '') }
    refute_includes JSON.parse(@resend_requests.fetch(0).body)['text'], 'Phone:'

    with_fake_network { post '/contact-form', contact_params }
    assert_includes JSON.parse(@resend_requests.fetch(1).body)['text'], 'Phone: 555-0100'
  end

  def test_resend_failure_reports_failure
    with_fake_network(resend_status: 422) { post '/contact-form', contact_params }
    assert_equal 'failure', json['status']
  end

  def test_rejected_submissions_never_reach_resend
    rejected = {
      'honeypot filled'      => contact_params('hp-input' => 'bot'),
      'invalid email'        => contact_params('email' => 'not-an-email'),
      'forged token'         => contact_params('_csrf_token' => '1:2:3'),
      'submitted too fast'   => contact_params('_csrf_token' => form_token(age: 0)),
      'expired token'        => contact_params('_csrf_token' => form_token(age: 3601))
    }
    rejected.each do |reason, params|
      with_fake_network { post '/contact-form', params }
      assert_equal 'failure', json['status'], reason
    end

    Rack::Attack.cache.store = MemoryStore.new # six posts would hit the rate limit
    with_fake_network(recaptcha_score: 0.2) { post '/contact-form', contact_params }
    assert_equal 'failure', json['status'], 'low reCAPTCHA score'

    assert_empty @resend_requests
  end

  def test_rate_limits_after_five_submissions
    with_fake_network do
      5.times { post '/contact-form', contact_params('email' => 'bad') }
      post '/contact-form', contact_params
    end
    assert_equal 429, last_response.status
    assert_equal 'rate_limited', json['status']
  end
end

class MiddlewareTest < AppTest
  OK = ->(_env) { [200, { 'content-type' => 'text/plain' }, ['ok']] }

  def call(middleware, url, method: 'GET', proto: 'https')
    env = Rack::MockRequest.env_for(url, method: method, 'HTTP_X_FORWARDED_PROTO' => proto)
    middleware.call(env)
  end

  def test_force_https_redirects_http_and_www_in_one_hop
    force = ForceHttps.new(OK)
    assert_equal [301, 'https://velocitylabs.io/blog/?p=2'],
                 call(force, 'http://velocitylabs.io/blog/?p=2', proto: 'http').then { |s, h, _| [s, h['location']] }
    assert_equal [301, 'https://velocitylabs.io/portfolio/'],
                 call(force, 'https://www.velocitylabs.io/portfolio/').then { |s, h, _| [s, h['location']] }
    assert_equal 308, call(force, 'http://velocitylabs.io/contact-form', method: 'POST', proto: 'http')[0]
    assert_equal 200, call(force, 'https://velocitylabs.io/')[0]
  end

  def test_security_headers_on_every_response
    get '/'
    assert_equal 'nosniff', last_response.headers['x-content-type-options']
    assert_equal 'strict-origin-when-cross-origin', last_response.headers['referrer-policy']
    assert_match(/camera=\(\)/, last_response.headers['permissions-policy'])
    assert_nil last_response.headers['strict-transport-security'], 'HSTS is production-only'
    assert_nil last_response.headers['cache-control']
  end

  def test_hsts_and_cache_rules
    headers = SecurityHeaders.new(OK, hsts: true)
    _, h, = call(headers, 'https://velocitylabs.io/vite/assets/application-abc123.css')
    assert_equal SecurityHeaders::HSTS, h['strict-transport-security']
    assert_equal 'public, max-age=31536000, immutable', h['cache-control']

    _, h, = call(headers, 'https://velocitylabs.io/images/projects/x/thumb.webp')
    assert_equal 'public, max-age=604800', h['cache-control']

    _, h, = call(headers, 'https://velocitylabs.io/blog/')
    assert_nil h['cache-control']
  end
end
