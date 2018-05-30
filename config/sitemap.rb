SitemapGenerator::Sitemap.sitemaps_host = "https://vlabs-jobs-#{Rails.env}.s3.amazonaws.com/"

# Set the adapter, so we can upload to S3
SitemapGenerator::Sitemap.adapter = SitemapGenerator::S3Adapter.new(
  aws_access_key_id:     Rails.application.credentials.dig(:aws, :key),
  aws_secret_access_key: Rails.application.credentials.dig(:aws, :secret),
  fog_directory:         "vlabs-jobs-#{Rails.env}",
  fog_provider:          "AWS",
  fog_region:            "us-east-1"
)

Site.find_each do |site|
  SitemapGenerator::Sitemap.default_host = "https://#{site.subdomain}.#{Rails.application.credentials.domain_name}"
  SitemapGenerator::Sitemap.public_path   = "tmp/"
  SitemapGenerator::Sitemap.sitemaps_path = "sitemaps/#{site.subdomain}"
  SitemapGenerator::Sitemap.create do
    CS.states(:us).each do |key, state|
      if key.to_s.in?(Rails.application.credentials.active_states)
        CS.cities(key, :us).each do |city|
          add "/#{state.downcase.parameterize}/#{city.downcase.parameterize}", changefreq: 'hourly'
        end
      end
    end
  end
end
