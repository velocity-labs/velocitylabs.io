CanCan::ControllerResource.class_eval do
protected

  def load_collection
    resource_base.accessible_by(current_ability, authorization_action).decorate
  end

  def load_resource_instance
    if !parent? && new_actions.include?(@params[:action].to_sym)
      build_resource.decorate
    elsif id_param || @options[:singleton]
      find_resource.decorate
    end
  end
end
