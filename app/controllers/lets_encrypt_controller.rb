class LetsEncryptController < ApplicationController
  def show
    if params[:id] == Rails.application.credentials.lets_encrypt_key
      render plain: Rails.application.credentials.lets_encrypt_response
    else
      head :not_found
    end
  end
end
