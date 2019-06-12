account = Spina::Account.first_or_create(name: 'Velocity Labs', theme: 'default')

puts 'CREATED ACCOUNT: ' << account.name
puts

user = Spina::User.find_or_create_by!(email: 'admin@example.com') do |user|
  user.name     = 'Admin'
  user.password = user.password_confirmation = 'password'
end

puts 'CREATED ADMIN USER: ' << user.email
puts
