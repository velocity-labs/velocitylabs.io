class ApplicationDecorator < Draper::Decorator
  include Rails.application.routes.url_helpers
  include ApplicationHelper

protected

  def default_url_options
    Rails.application.config.action_mailer.default_url_options
  end
end
