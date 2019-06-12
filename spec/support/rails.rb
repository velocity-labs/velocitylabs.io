RSpec.configure do |config|
  config.include ActionView::RecordIdentifier
  config.include ActionView::Helpers::TextHelper
  config.include ActionView::Helpers::NumberHelper
end
