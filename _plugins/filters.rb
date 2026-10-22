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

    # Full-size screenshot for the lightbox (WebP; the lightbox can't offer a
    # fallback, and every current browser supports WebP)
    def full_image_path(title)
      title = project_image_dir(title)
      File.exist?(File.expand_path("./images/projects/#{title}/full.webp")) ? "projects/#{title}/full.webp" : thumb_webp_path(title)
    end

    # Thumbnail JPG, the <picture> fallback for browsers without WebP
    def thumb_image_path(title)
      "projects/#{project_image_dir(title)}/thumb.jpg"
    end

    def thumb_webp_path(title)
      "projects/#{project_image_dir(title)}/thumb.webp"
    end

    def project_image_dir(title)
      title.gsub(/[^0-9a-z\_\s]/i, '').gsub(/\ /, '_')
    end
  end
end

Liquid::Template.register_filter(VelocityLabs::Filters)
