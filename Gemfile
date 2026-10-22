source 'https://rubygems.org'

ruby '4.0.7'

# Web server (loaded by main.rb via Bundler.require)
gem 'puma',               '~> 8.0'
gem 'rack',               '~> 3.0'
gem 'rake',               '~> 13.0'
gem 'sinatra',            '~> 4.0'
gem 'sendgrid-ruby',      '~> 6.7'
gem 'rack-attack',        '~> 6.7'

# Site build only (loaded by Jekyll, not the web server)
group :jekyll_plugins do
  gem 'jekyll',             '~> 4.3'
  gem 'jekyll-vite'
  gem 'jekyll-feed',        '~> 0.18'
  gem 'jekyll-paginate',    '~> 1.1'
  gem 'jekyll-seo-tag',     '~> 2.9'
  gem 'jekyll-sitemap',     '~> 1.4'
  gem 'kramdown',           '~> 2.4'
  gem 'kramdown-parser-gfm'
  gem 'nokogiri',           '~> 1.16'
  gem 'reverse_markdown',   '~> 3.0', require: false # used by _plugins/markdown_export.rb
end

group :development do
  gem 'debug'
  gem 'dotenv'
  gem 'foreman'
end
