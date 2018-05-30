module ZipRecruiter
  class ZipSearch
    attr_accessor :params, :total_jobs

    @@base_uri = 'https://api.ziprecruiter.com'
    @@version  = 'v1'

    def initialize(params={})
      @params = params
    end

    # HTTPS  Request Parameters
    #
    # Field            | Type    | Description
    # --------------------------------------------------------------------------------
    # api_key          | string  | assigned API key
    # search           | string  | search terms, e.g. “Inside Sales”
    # location         | string  | location, e.g., “Santa Monica, CA” or “London, UK”
    # radius_miles     | integer | distance of the job relative to the location
    # page             | integer | current page ranging from 1-N
    # jobs_per_page    | integer | number of job results to show per page
    # days_ago         | integer | only show jobs posted within this number of days
    # refine_by_salary | integer | only show jobs with salary greater than this number
    #
    # Note on pagination: A maximum of 500 results are returned through pagination
    def jobs
      resource_uri = [@@base_uri, 'jobs', @@version].join('/')
      uri = [resource_uri, param_builder(@params)].join('?')

      response = HTTParty.get(uri)
      @total_jobs = response.parsed_response['num_paginable_jobs'].to_f
      response.parsed_response['jobs'].map { |json| ZipRecruiter::Job.new json }
    end

  private

    def param_builder(params)
      params.merge(api_key: Rails.application.credentials.zip_recruiter_api_key).to_param
    end
  end
end
