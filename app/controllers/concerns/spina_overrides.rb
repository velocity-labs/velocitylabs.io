module SpinaOverrides
  extend ActiveSupport::Concern

  included do
  end

  def current_spina_user
    super&.decorate
  end

  def user_signed_in?
    current_spina_user && !current_spina_user.is_a?(::Guest)
  end
end