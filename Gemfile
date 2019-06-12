source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.6.3'

gem 'rails',      '~> 5.2'
gem 'pg',         '~> 1.0'
gem 'puma',       '~> 3.11'
gem 'spina',      '~> 1.0'
gem 'spina-blog', '~> 0.3'

gem 'bootsnap',         '~> 1.3'
gem 'browser',          '~> 2.5'
gem 'cancancan',        '~> 3.0'
gem 'chronic',          '~> 0.10'
gem 'coffee-rails',     '~> 5.0'
gem 'draper',           '~> 3.1'
gem 'draper-cancancan', '~> 1.1'
gem 'sass-rails',       '~> 5.0'
gem 'turbolinks',       '~> 5.1'
gem 'tzinfo-data',      '~> 1.2', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
gem 'uglifier',         '~> 4.1'

group :development do
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'bundler-audit'
  gem 'foreman'
  gem 'html2haml'
  gem 'letter_opener_web'
  gem 'listen'
end

group :development, :test do
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'factory_bot'
  gem 'faker'
  gem 'pry-byebug'
  gem 'pry-rails'
  # gem 'pry-rescue'
  gem 'rb-fchange', require: false
  gem 'rb-fsevent', require: false
  gem 'rb-inotify', require: false
  gem 'rspec-rails'
  gem 'spring'
  gem 'spring-commands-rspec'
  gem 'spring-watcher-listen'
end

group :test do
  gem 'capybara'
  gem 'capybara-screenshot'
  gem 'database_cleaner'
  gem 'email_spec'
  gem 'launchy'
  gem 'rspec-instafail', require: false
  gem 'rspec-retry'
  gem 'selenium-webdriver'
  gem 'shoulda-matchers'
  gem 'simplecov'
  gem 'vcr'
  gem 'webmock'
end
