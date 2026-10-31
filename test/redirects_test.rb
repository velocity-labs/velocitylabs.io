require_relative 'test_helper'

# Every move in config/redirects.yml (MovedPages in main.rb): one 301 to the
# new path, from either slash form and from the Markdown copy, keeping the
# query string
class RedirectsTest < AppTest
  MOVES = YAML.load_file(File.expand_path('../config/redirects.yml', __dir__))

  def test_each_moved_page_redirects_once_to_a_working_page
    MOVES.each do |from, to|
      [from, from.chomp('/')].each do |path|
        get path
        assert_equal 301, last_response.status, path
        assert_equal to, last_response.location, path
      end
      get to
      assert_equal 200, last_response.status, "#{to} (moved from #{from})"
    end
  end

  def test_query_strings_are_kept
    from, to = MOVES.first
    get from, ref: 'newsletter', utm_source: 'mail'
    assert_equal "#{to}?ref=newsletter&utm_source=mail", last_response.location
  end

  def test_markdown_copies_redirect_too
    MOVES.each do |from, to|
      get "#{from.chomp('/')}.md"
      assert_equal 301, last_response.status, "#{from.chomp('/')}.md"
      assert_equal "#{to.chomp('/')}.md", last_response.location
      get last_response.location
      assert_equal 200, last_response.status, "#{to.chomp('/')}.md"
    end
  end

  def test_head_requests_redirect_and_posts_pass_through
    from, = MOVES.first
    head from
    assert_equal 301, last_response.status
    post from
    refute_equal 301, last_response.status
  end

  # In production the same hop also moves http and www to the canonical address
  def test_production_redirects_straight_to_https_and_the_bare_domain
    moved_pages = MovedPages.new(->(_env) { [200, {}, ['ok']] }, MOVES, canonical: true)
    from, to = MOVES.first
    status, headers, = moved_pages.call(Rack::MockRequest.env_for("http://www.velocitylabs.io#{from}?ref=x"))
    assert_equal 301, status
    assert_equal "https://velocitylabs.io#{to}?ref=x", headers['location']
  end
end
