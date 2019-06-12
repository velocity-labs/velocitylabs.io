RSpec.describe User, type: :model do
  describe 'associations' do
  end

  context 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:role) }
  end

  context 'attributes' do
    describe 'defaults' do
      it 'role to business' do
        expect(subject.role).to eq('business')
      end
    end

    describe '@role' do
      it 'can be changed to admin' do
        subject.role = 'admin'
        expect(subject).to be_admin
      end

      it 'can be changed to superadmin' do
        subject.role = 'superadmin'
        expect(subject).to be_superadmin
      end
    end
  end
end
