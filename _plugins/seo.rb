require 'jekyll-seo-tag'

# Bridges our front matter to jekyll-seo-tag and jekyll-feed.
#
# - Posts reference authors by author_id (see _data/people.yml), but both
#   plugins expect an `author`, so resolve it here.
# - Every page shares the share card (company.share_image) as its social
#   image unless it sets its own image path. Older posts have image hashes
#   without a path, which seo-tag would otherwise treat as "no image".
# - Paginated blog pages (/blog/2/ and up) stay out of the sitemap; they
#   only list posts that are already in it.
# - Pages marked noindex stay out of the sitemap too, so Google never sees
#   a submitted URL that asks not to be indexed.
#
# Runs as a pre_render hook (after all generators) so pages added by
# generators like jekyll-paginate are covered too.
module VelocityLabs
  module SeoData
    def self.apply(site)
      people = site.data['people'].to_h { |person| [person['id'], person] }
      share_image = site.config['company']['share_image']

      (site.pages + site.posts.docs).each do |page|
        if (person = people[page.data['author_id']])
          page.data['author'] ||= {
            'name'    => person['name'],
            'twitter' => person.dig('links', 'twitter').to_s.split('/').last
          }.compact
        end

        image = page.data['image']
        unless image.is_a?(String) || (image.is_a?(Hash) && image['path'])
          page.data['image'] = share_image.dup
        end

        page.data['sitemap'] = false if page.respond_to?(:pager) && page.pager && page.pager.page > 1
        page.data['sitemap'] = false if page.data['noindex']
      end
    end
  end

  # seo-tag names the JSON-LD publisher after the page author, so every post
  # would claim its author as the publishing organization. Use the site title.
  module SeoPublisher
    def publisher
      output = super
      output['name'] = page_drop.site_title if output && page_drop.site_title
      output
    end
  end
end

Jekyll::Hooks.register(:site, :pre_render) { |site| VelocityLabs::SeoData.apply(site) }
Jekyll::SeoTag::JSONLDDrop.prepend(VelocityLabs::SeoPublisher)
