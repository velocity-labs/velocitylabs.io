RSpec.feature 'User authentication', :devise do
  let(:user) { create :user, :confirmed }

  it_behaves_like 'authenticatable' do
    let(:after_sign_in_path)  { root_path }
    let(:after_sign_out_path) { new_user_session_path }
  end
end
