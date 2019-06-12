## Use Chrome!
Capybara.register_driver :chrome do |app|
  capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
    chromeOptions: { args: %w[--window-size=1200,1000 --disable-popup-blocking --disable-translate --test-type --ignore-certificate-errors] }
  )

  Capybara::Selenium::Driver.new app,
                                 browser: :chrome,
                                 desired_capabilities: capabilities
end

## Headless!
Capybara.register_driver :headless_chrome do |app|
  capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
    chromeOptions: { args: %w[--headless --disable-gpu --window-size=1600,1000 --disable-popup-blocking --disable-translate --test-type --ignore-certificate-errors] }
  )

  Capybara::Selenium::Driver.new app,
                                 browser: :chrome,
                                 desired_capabilities: capabilities
end

## Easy Selector
Capybara.add_selector :record do
  xpath { |record| XPath.css('#' + ActionView::RecordIdentifier.dom_id(record)) }
  match { |record| record.is_a?(ActiveRecord::Base) }
end

## Capy Configuration Defaults
Capybara.configure do |config|
  config.javascript_driver     = :chrome
  config.default_max_wait_time = 5
  config.asset_host            = 'http://localhost:3000'
end

## Capy Screenshot Help
Capybara::Screenshot.prune_strategy      = { keep: 10 }
Capybara::Screenshot.autosave_on_failure = true
Capybara::Screenshot.register_driver(:chrome) do |driver, path|
  driver.browser.save_screenshot(path)
end
Capybara::Screenshot.register_driver(:headless_chrome) do |driver, path|
  driver.browser.save_screenshot(path)
end

if ENV['CI_RUNNING']
  # don't attempt to generate on Codeship
  Capybara::Screenshot::RSpec.add_link_to_screenshot_for_failed_examples = false
else
  # better looking screenshots (fixes relative paths when desired)
  Capybara.asset_host = 'http://localhost:3000'
end

