module Authenticated
  extend ActiveSupport::Concern

  included do
    before_action :authorize_spina_user
  end
end
