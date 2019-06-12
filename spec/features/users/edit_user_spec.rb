RSpec.feature 'User edit', :devise do
  let(:user)       { create :user, :confirmed }
  let(:user_attrs) { attributes_for :user }

  before do
    login_as(user, scope: :user)
    visit edit_user_registration_path
  end

  scenario 'user changes email address' do
    fill_in 'Email address', with: user_attrs[:email]
    click_button 'Save Changes'

    txts = [I18n.t( 'devise.registrations.updated'), I18n.t( 'devise.registrations.update_needs_confirmation')]
    expect(page).to have_content(/.*#{txts[0]}.*|.*#{txts[1]}.*/)
  end

  scenario 'user updates password' do
    click_link 'Update my password'

    fill_in 'New password',         with: 'password123'
    fill_in 'Confirm new password', with: 'password123'

    expect {
      click_button 'Save Changes'
    }.to change { user.reload.encrypted_password }

    click_link 'Sign out'
    signin(user.email, 'password')
    expect(page).to have_content(I18n.t('devise.failure.invalid', authentication_keys: 'Email'))

    signin(user.email, 'password123')
    expect(page).to have_content('Signed in successfully.')
  end
end
