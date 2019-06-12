account = Spina::Account.first_or_create(name: 'Velocity Labs', theme: 'default')

puts 'CREATED ACCOUNT: ' << account.name
puts

user = Spina::User.find_or_create_by!(email: 'curtis@velocitylabs.io') do |user|
  user.name     = 'Curtis Miller'
  user.password = user.password_confirmation = 'password'
end

puts 'CREATED ADMIN USER: ' << user.email
puts

user = Spina::User.find_or_create_by!(email: 'irish@velocitylabs.io') do |user|
  user.name     = 'Christopher Irish'
  user.password = user.password_confirmation = 'password'
end

puts 'CREATED ADMIN USER: ' << user.email
puts
