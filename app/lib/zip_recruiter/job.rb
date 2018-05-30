require 'hashie/mash'

module ZipRecruiter
  class Job
    extend Forwardable
    def_delegators :@hashie,
                   :category, :city, :country, :has_non_zr_url, :hiring_company,
                   :id, :industry_name, :job_age, :location, :name, :posted_time,
                   :posted_time_friendly, :salary_interval, :salary_max,
                   :salary_max_annual, :salary_min, :salary_min_annual,
                   :salary_source, :snippet, :source, :state, :url

    def initialize(json)
      @json = json
      @hashie = Hashie::Mash.new(json) { raise NoMethodError }
    end

    def to_json
      @json
    end
  end
end
