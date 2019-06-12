SimpleCov.start "rails" do
  add_filter "/spec/"
  add_group "Admin", "app/admin"
  add_group "Services", "app/services"
end
