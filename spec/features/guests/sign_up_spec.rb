RSpec.feature 'Sign Up', :devise do
  context 'as user' do
    let(:role)  { 'business' }
    let(:attrs) { attributes_for :user }

    scenario 'visitor can sign up with valid email address and password' do
      sign_up_with(attrs[:email], attrs[:password], attrs[:password], role)

      expect(page).to have_content(I18n.t('devise.registrations.signed_up_but_unconfirmed'))

      u = User.last
      expect(u).to be_present
      expect(u.email).to eq(attrs[:email])
      expect(u.role).to eq(role.downcase)
    end

    scenario 'visitor cannot sign up with invalid email address' do
      sign_up_with('bad email', attrs[:password], attrs[:password], role)
      expect(page).to have_selector('.user_email.has-error')
    end

    scenario 'visitor cannot sign up without password' do
      sign_up_with(attrs[:email], '', '', role)
      expect(page).to have_selector('.user_password.has-error')
    end

    scenario 'visitor cannot sign up with a short password' do
      sign_up_with(attrs[:email], 'short', 'short', role)
      expect(page).to have_selector('.user_password.has-error')
    end

    scenario 'visitor cannot sign up without password confirmation' do
      sign_up_with(attrs[:email], attrs[:password], '', role)
      expect(page).to have_selector('.user_password_confirmation.has-error')
    end

    scenario 'visitor cannot sign up with mismatched password and confirmation' do
      sign_up_with(attrs[:email], attrs[:password], 'no match', role)
      expect(page).to have_selector('.user_password_confirmation.has-error')
    end
  end
end
