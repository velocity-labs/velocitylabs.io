# This file holds recurring rake tasks run by cron or Heroku Scheduler.
namespace :cron do
  task hourly: [
  ]

  task daily: [
    'cron:daily:sitemap_refresh'
  ]

  task weekly: [
  ]

  namespace :hourly do
  end

  namespace :daily do
    desc 'Refresh the sitemap'
    task sitemap_refresh: :environment do
      Rake::Task["sitemap:create"].invoke
      SitemapGenerator::Sitemap.ping_search_engines("https://#{Rails.application.credentials.domain_name}/sitemap.xml")
    end
  end

  namespace :weekly do
  end
end
