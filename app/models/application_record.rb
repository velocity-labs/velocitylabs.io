class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  include Rails.application.routes.url_helpers

  protected

  def default_url_options
    Rails.application.config.action_mailer.default_url_options
  end
end
