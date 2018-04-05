require 'byebug'
module VelocityLabs
  module Filters
    def array_to_string(array)
      array.join(', ')
    end

    def get_categories(projects)
      projects.collect { |p| p['categories'].map(&:downcase) }.flatten.uniq
    end

    def sample(input, num)
      input.sample(num)
    end

    def full_image_path(title)
      title = title.gsub(/[^0-9a-z\_\s]/i, '').gsub(/\ /, '_')
      File.exist?(File.expand_path("./_assets/images/projects/#{title}/full.png")) ? "projects/#{title}/full.png" : thumb_image_path(title)
    end

    def thumb_image_path(title)
      title = title.gsub(/[^0-9a-z\_\s]/i, '').gsub(/\ /, '_')
      "projects/#{title}/thumb.png"
    end
  end
end

Liquid::Template.register_filter(VelocityLabs::Filters)
