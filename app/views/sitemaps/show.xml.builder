xml.instruct!
xml.sitemapindex(xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9") do
  Site.find_each do |site|
    xml.sitemap do
      xml.loc "https://vlabs-jobs-#{Rails.env}.s3.amazonaws.com/sitemaps/#{site.subdomain}/sitemap.xml.gz"
    end
  end
end
