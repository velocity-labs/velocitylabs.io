FactoryBot.define do
  factory :user do
    sequence(:name)       { |n| "#{Faker::Name.first_name}_#{n}" }
    email                 { Faker::Internet.email(name) }
    timezone              { 'America/Phoenix' }
    password              { 'Password1!' }
    password_confirmation { 'Password1!' }

    trait :confirmed do
      after(:create, &:confirm)
    end
  end
end
