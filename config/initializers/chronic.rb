Rails.configuration.after_initialize do
  Chronic.time_class = Time.zone
end
