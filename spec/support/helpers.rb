RSpec.configure do |config|
  config.include Features::JavaScriptHelpers, type: :feature
  config.include Features::PathHelpers,       type: :feature
  config.include Features::SessionHelpers,    type: :feature

  config.include Controllers::SessionHelpers, type: :controller
end
