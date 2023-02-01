source 'https://rubygems.org'

ruby '2.7.7'

# Dependabot vulnerability fix, remove after capybara updates dependencies
gem 'addressable',        '>= 2.8.0'

gem 'coffee-script',      '~> 2.4'
gem 'jekyll',             '~> 3.9.0'
gem 'jekyll-assets',       group: :jekyll_plugins
gem 'jekyll-minify-html'
gem 'jekyll-paginate'
gem 'jekyll-sitemap'
gem 'kramdown',           '>= 2.3.0'
gem 'maruku',             '~> 0.7.3'
gem 'newrelic_rpm',       '~> 6.2'
gem 'nokogiri',           '>= 1.13.9'
gem 'pony',               '~> 1.13'
gem 'puma',               '~> 4.3.11'
gem 'rack',               '~> 2.2.6.2' # for security patch https://github.com/velocity-labs/velocitylabs.io/security/dependabot/16
gem 'rake',               '~> 12.3'
gem 'redcarpet',          '~> 3.5'
gem 'rest-client',        '~> 2.0'
gem 'sass',               '~> 3.7'
gem 'sinatra',            '~> 2.2.3'
gem 'sprockets',          '~> 3.7' # force sprockets to pre 4.0 as per https://github.com/envygeeks/jekyll-assets/issues/622
gem 'stripe',             '~> 3.11.0'
gem 'tzinfo',             '~> 1.2.10' # for security patch https://github.com/velocity-labs/velocitylabs.io/security/dependabot/13
gem 'uglifier',           '~> 2.7'

group :development do
  gem 'byebug'
  gem 'foreman'
end
