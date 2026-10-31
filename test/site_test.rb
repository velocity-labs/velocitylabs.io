require_relative 'test_helper'

# Checks across the built pages in _site/
class SiteTest < Minitest::Test
  SITE = File.expand_path('../_site', __dir__)

  # Technology pills link to /portfolio/?tech=<slug>, which should open with a
  # filter for that technology
  def test_every_technology_link_has_a_portfolio_filter
    filters = File.read(File.join(SITE, 'portfolio/index.html')).scan(/data-tech="([^"]+)"/).flatten
    linked = Dir[File.join(SITE, '**/*.html')].flat_map do |path|
      File.read(path).scan(%r{/portfolio/\?tech=([^"&#]+)}).flatten
    end.uniq

    refute_empty linked
    assert_empty linked - filters, 'technologies linked with no portfolio filter'
  end
end
