#
# Anything in the seeds files should be runnable
# multiple times. i.e., it should not create duplicates
#

puts "Seeding #{Rails.env} DB..."

require File.expand_path("db/seeds/#{Rails.env}.rb")

puts
puts 'Done.'
puts
