require 'fileutils'

# Heroku's Ruby buildpack runs this during deploys
task "assets:precompile" do
  sh "jekyll build"

  # The web process only serves _site/, so drop build-only files to keep the
  # slug well under Heroku's 500MB limit. Only on Heroku builds, never locally.
  if ENV["STACK"] || Dir.pwd.start_with?("/tmp/build_")
    FileUtils.rm_rf(%w[node_modules .jekyll-cache])
  end
end
