module Features
  module JavaScriptHelpers
    def toggle_switchery_switches(klass = '.switchery')
      page.execute_script("$('#{klass}').click()")
    end

    def toggle_onoff_switches(klass = '.onoffswitch-label')
      page.execute_script("$('#{klass}').click()")
    end

    def close_calendar(which = :first)
      if which == :first
        page.first('.glyphicon.glyphicon-remove')&.click
      else
        page.all('.glyphicon.glyphicon-remove')&.last&.click
      end
    end

    def open_dropdown
      page.find('.dropdown-toggle').click
    end

    def close_toastr
      find('.toast-close-button')&.click
    end

    def wait_for_ajax
      wait_for_javascript 'window.jQuery ? jQuery.active == 0 : true'
    end

    def wait_for_javascript(expression)
      wait_for { page.evaluate_script(expression) }
    # rescue Capybara::NotSupportedByDriverError
    end
  end
end
