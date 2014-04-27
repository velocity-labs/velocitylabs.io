require 'rack'
require './main'

# gzip everything, except files with extensions below (images)
use Rack::DeflaterWithExclusions, exclude: proc { |env|
  [ ".jpg", ".png", ".ico" ].include? File.extname(env['PATH_INFO'])
}

run Sinatra::Application
