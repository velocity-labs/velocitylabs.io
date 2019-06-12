module Features
  module SessionHelpers
    def sign_up_with(email, password, confirmation, role)
      visit new_user_registration_path
      within 'form#new_user' do
        fill_in 'Email address', with: email
        fill_in 'Password', with: password
        fill_in 'Confirm password', with: confirmation
        click_button 'Sign Up'
      end
    end

    def signin(email, password)
      visit new_user_session_path
      fill_in 'Email address', with: email
      fill_in 'Password', with: password
      click_button 'Sign In'
    end
  end

  module PathHelpers
    def path_with_query(url)
      uri = URI.parse(url)
      [ uri.path.sub(/\A\/+/, '/'), uri.query ].compact.join('?')
    end
  end
end

module Controllers
  module SessionHelpers
    def signin(role, *args)
      @user = create role, *args
      @request.env["devise.mapping"] = Devise.mappings[role.to_sym]
      sign_in @user
    end
  end
end
