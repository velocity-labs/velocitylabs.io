RSpec.shared_examples "authenticatable" do
  scenario 'user cannot sign in if not registered' do
    signin('test@example.com', 'please123')
    expect(page).to have_content I18n.t 'devise.failure.not_found_in_database', authentication_keys: 'Email'
  end

  scenario 'user cannot sign in with wrong email' do
    signin('invalid@email.com', user.password)
    expect(page).to have_content I18n.t 'devise.failure.not_found_in_database', authentication_keys: 'Email'
  end

  scenario 'user cannot sign in with wrong password' do
    signin(user.email, 'invalidpass')
    expect(page).to have_content I18n.t 'devise.failure.invalid', authentication_keys: 'Email'
  end

  scenario 'user can sign in with valid credentials' do
    signin(user.email, user.password)
    expect(page).to have_link 'Sign out'
    expect(current_path).to eq(after_sign_in_path)
  end

  scenario 'user can sign out successfully' do
    signin(user.email, user.password)
    click_link 'Sign out'

    expect(page).to have_link 'Sign in'
    expect(current_path).to eq(after_sign_out_path)
  end
end
