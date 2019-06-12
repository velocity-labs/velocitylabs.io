class ApplicationController < ActionController::Base
  include SpinaOverrides
  protect_from_forgery with: :exception
  add_flash_types :success, :info, :warning, :danger, :error
end
