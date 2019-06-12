class ApplicationMailer < ActionMailer::Base
  default from: "no-reply@#{Rails.application.credentials.domain_name}"
  layout 'mailer'
end
