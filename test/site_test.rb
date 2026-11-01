require_relative 'test_helper'
require 'nokogiri'
require 'yaml'

# Checks across the built pages in _site/: what every listed page needs, the
# lists that come from one data file, and links that have to resolve
class SiteTest < AppTest
  ROOT = File.expand_path('..', __dir__)
  SITE = File.join(ROOT, '_site')
  LIVE = %r{\Ahttps?://(www\.)?velocitylabs\.io}

  def built(path)
    Nokogiri::HTML(File.read(File.join(SITE, path, 'index.html')))
  end

  def listed_paths
    File.read(File.join(SITE, 'sitemap.xml')).scan(%r{<loc>([^<]+)</loc>}).flatten
        .map { |url| url.sub(LIVE, '') }.reject { |path| path.end_with?('.pdf') }
  end

  def test_every_listed_page_has_one_h1_a_title_a_description_and_a_share_image
    titles = {}
    problems = listed_paths.filter_map do |path|
      doc = built(path)
      titles[path] = doc.at_css('title')&.text.to_s.strip
      issues = []
      issues << "#{doc.css('h1').size} h1s" unless doc.css('h1').size == 1
      issues << 'no title' if titles[path].empty?
      issues << 'no description' if doc.at_css('meta[name="description"]')&.[]('content').to_s.strip.empty?
      issues << 'noindex' if doc.at_css('meta[name="robots"][content*="noindex"]')
      image = doc.at_css('meta[property="og:image"]')&.[]('content').to_s.sub(LIVE, '')
      issues << "share image #{image.inspect} not found" unless image.start_with?('/') && File.file?(File.join(SITE, image))
      "#{path}: #{issues.join(', ')}" if issues.any?
    end

    assert_empty problems
    assert_empty titles.group_by { |_, title| title }.select { |_, pages| pages.size > 1 }.keys, 'titles used twice'
  end

  # Other sites link to these sections of the home page
  def test_home_page_keeps_its_linked_sections
    home = built('/')
    %w[about projects team contact].each { |id| assert home.at_css("##{id}"), "the home page lost ##{id}" }
  end

  # _data/services.yml drives the home page's list, the footer and the
  # contact form's options
  def test_service_lists_follow_services_yml
    services = YAML.load_file(File.join(ROOT, '_data/services.yml'))
    home = built('/')

    assert_equal services.select { |s| s['home'] }.map { |s| s['url'] }, home.css('.svc-list > li > a').map { |a| a['href'] }
    assert_equal services.select { |s| s['footer'] }.map { |s| [s['footer'], s['url']] },
                 home.xpath('//footer//h2[.="Services"]/following-sibling::ul[1]//a').map { |a| [a.text, a['href']] }
    assert_equal services.select { |s| s['need'] && !s['own_page'] }.map { |s| s['id'] },
                 home.css('input[name="need"][type="radio"]').map { |input| input['value'] }

    # a service page's form sends its service instead of asking
    services.select { |s| s['need'] }.each do |service|
      sent = built(service['url']).css('input[name="need"]').map { |input| [input['type'], input['value']] }
      assert_equal [['hidden', service['id']]], sent, "#{service['url']} should send #{service['id']} without asking"
    end
  end

  # The home page's structured data comes from the same settings as the footer
  def test_business_details_match_the_config
    company = YAML.load_file(File.join(ROOT, '_config.yml'), aliases: true)['company']
    business = built('/').css('script[type="application/ld+json"]').map { |script| JSON.parse(script.text) }
                         .find { |data| data['@type'] == 'Organization' }

    assert_equal company['name'], business['name']
    assert_equal "1#{company['phone'].delete('^0-9')}", business['telephone'].delete('^0-9')
    assert_equal company['email'], business['email']
    assert_equal company['founded'].to_s, business['foundingDate']
    assert_equal [company['address']['street'], company['address']['city'], company['address']['state'], company['address']['zip'].to_s],
                 business['address'].values_at('streetAddress', 'addressLocality', 'addressRegion', 'postalCode')
  end

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

  # Every link and image on every built page (posts left out of the sitemap
  # included) reaches a page that loads, after at most one redirect, and every
  # #anchor exists there. Links to other sites are bin/check-links' job.
  def test_internal_links_and_anchors_resolve
    broken = []
    absolute = []

    Dir[File.join(SITE, '**/*.html')].each do |file|
      from = file.delete_prefix(SITE).delete_suffix('index.html')
      doc = Nokogiri::HTML(File.read(file))
      doc.css('body a[href], body img[src]').each do |node|
        link = node['href'] || node['src']
        next if link.match?(/\A(mailto|tel|javascript):/)
        next absolute << "#{from}: #{link}" if link.match?(LIVE)
        next if link.match?(%r{\A(https?:)?//})

        target = URI.join("http://example.org#{from}", link)
        status, body = resolve([target.path, target.query].compact.join('?'))
        next broken << "#{from}: #{link} (#{status})" unless status == 200
        next if target.fragment.to_s.empty?

        page = target.path == URI.join("http://example.org#{from}", '').path ? doc : Nokogiri::HTML(body)
        broken << "#{from}: #{link} (no ##{target.fragment} there)" unless page.at_css("[id='#{target.fragment}']")
      end
    end

    assert_empty broken.uniq, 'internal links that go nowhere'
    assert_empty absolute.uniq, 'links to this site should be relative, so they work on any host'
  end

  # Markdown copies for AI tools (_plugins/markdown_export.rb), and llms.txt
  def test_markdown_copies_and_llms_txt
    copies = Dir[File.join(SITE, '**/*.md')]
    refute_empty copies
    copies.each do |file|
      text = File.read(file)
      assert_match(/\A# \S/, text, "#{file} starts without its heading")
      assert_includes text, '- URL: https://velocitylabs.io/', "#{file} doesn't say where it came from"
    end

    llms = File.read(File.join(SITE, 'llms.txt'))
    YAML.load_file(File.join(ROOT, '_data/services.yml')).each do |service|
      assert_includes llms, "https://velocitylabs.io#{service['url'].chomp('/')}.md", "llms.txt leaves out #{service['name']}"
    end
    refute_match %r{/ruby-on-rails/(code-audits|maintenance)}, llms
  end

  private

  # => [status, body] for a path on this site, following one same-site redirect
  def resolve(target)
    @resolved ||= {}
    @resolved[target] ||= begin
      get target
      if last_response.redirect?
        location = URI(last_response.location)
        get [location.path, location.query].compact.join('?') if [nil, 'example.org'].include?(location.host)
      end
      [last_response.status, last_response.body]
    end
  end
end
