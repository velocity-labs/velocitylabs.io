require 'rubygems'
require 'sinatra'

require File.expand_path '../main.rb', __FILE__

use Rack::Deflater
run Sinatra::Application
