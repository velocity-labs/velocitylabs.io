require_relative 'test_helper'

# Every URL the site has served must keep working through a restructure: it
# returns 200, or a single 301 on the same host to a page that returns 200.
# Before a restructure, save the live sitemap to test/fixtures/sitemaps/ as a
# new snapshot rather than editing an old one.
class LegacyUrlsTest < AppTest
  SITEMAPS = Dir[File.expand_path('fixtures/sitemaps/*.xml', __dir__)]

  # Served but kept out of the sitemap (sitemap: false, noindex, pagination, plugins)
  EXTRA_PATHS = %w[
    /ruby-on-rails/maintenance/terms/
    /ruby-on-rails/maintenance/thank-you/
    /blog/2/ /blog/3/ /blog/4/ /blog/5/
    /feed.xml /llms.txt /robots.txt
  ].freeze

  # Paths removed on purpose, each with the reason
  GONE = {}.freeze

  def test_every_legacy_url_still_works
    failures = legacy_paths.filter_map { |path| problem_with(path) }
    assert_empty failures, "Legacy URLs that stopped working:\n#{failures.join("\n")}"
  end

  private

  def legacy_paths
    from_sitemaps = SITEMAPS.flat_map do |file|
      File.read(file).scan(%r{<loc>\s*([^<\s]+)\s*</loc>}).map { |(url)| URI(url).path }
    end
    (from_sitemaps + EXTRA_PATHS).uniq - GONE.keys
  end

  def problem_with(path)
    get path
    case last_response.status
    when 200 then nil
    when 301
      target = URI(last_response.location)
      return "#{path}: 301 to another host (#{target})" unless target.host.nil? || target.host == last_request.host

      get target.request_uri
      "#{path}: 301 to #{target.request_uri}, which returned #{last_response.status}" unless last_response.status == 200
    else
      "#{path}: #{last_response.status}"
    end
  end
end
