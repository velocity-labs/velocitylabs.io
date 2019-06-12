VCR.configure do |config|
  config.hook_into :webmock
  config.configure_rspec_metadata!
  config.ignore_hosts 'fonts.googleapis.com'
  config.preserve_exact_body_bytes { true }
  config.cassette_library_dir                    = 'spec/fixtures/cassettes'
  config.debug_logger                            = File.open(Rails.root.join('log/vcr.log'), 'w')
  config.default_cassette_options                = { record: :new_episodes, match_requests_on: [:method, :host, :path], allow_playback_repeats: false }
  config.ignore_localhost                        = true
  config.allow_http_connections_when_no_cassette = false
end
