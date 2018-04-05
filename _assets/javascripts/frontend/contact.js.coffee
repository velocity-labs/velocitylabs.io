$ ->

  $("#subscription-form").validate
    errorElement: "span"
    errorClass: "help-block"
    errorPlacement: (error, element) ->
      return

    highlight: (element) ->
      $(element).closest(".form-group").addClass "has-error"

    rules:
      name: "required"
      company: "required"
      phone: "required"

    unhighlight: (element) ->
      $(element).closest('.form-group').removeClass 'has-error'

  $('.stripe-button-el').on 'click', () =>
    if $("#subscription-form").valid()
      $('#contact-form-error').html("")
      return true
    else
      $('#contact-form-error').html("Please fill out form completely")
      return false

  $("#contactForm").validate
    errorElement: "span"
    errorClass: "help-block"
    errorPlacement: (error, element) ->
      return

    highlight: (element) ->
      $(element).closest(".form-group").addClass "has-error"

    rules:
      name: "required"
      email:
        email: true
        required: true
      message: "required"

    unhighlight: (element) ->
      $(element).closest('.form-group').removeClass 'has-error'

    submitHandler: (form) =>
      $submitBtn         = $(form).find('button[type=submit]')
      originalButtonText = $submitBtn.html()

      $submitBtn.prop('disabled', true).html('Submitting...')

      textBody = """
        Contact Information
        ====================

        Name:  #{$(form).find('input#name').val()}
        Email: #{$(form).find('input#email').val()}
        Phone: #{$(form).find('input#phone').val()}

        Message
        ====================

        #{$(form).find('textarea#message').val()}
      """

      $.ajax
        type:  "POST"
        , url: $(form).prop('action')
        , data: $(form).serializeArray()
        , success: (data, status, xhr) ->
          if data.status == "success"
            $('.contact-form').slideToggle 300, () ->
              $('.contact-button').toggleClass 'active'

              $('#contact-form-success').html """
                <div class='alert alert-success'>
                  <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                  <strong>Thanks! Your message has been sent. We'll get back with you shortly.</strong>
                </div>
              """

              $('#contact-form-error').html("")
              $('#contactForm').trigger "reset"
          else
            $('#contact-form-error').html """
              <div class='alert alert-danger'>
                <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                <strong>Sorry, there was a problem submitting the form.</strong>
                Please check your entries and try again. If the problem persists, please email us directly at <a target="_blank" href='mailto:contact@velocitylabs.io?body=#{encodeURIComponent(textBody)}'>contact@velocitylabs.io</a>.
              </div>
            """

        , error: (xhr, status, error) ->
            $('#contact-form-error').html """
              <div class='alert alert-danger'>
                <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                <strong>Sorry, it seems the mail server is not responding...</strong>
                Could you please send an email directly to <a target="_blank" href='mailto:contact@velocitylabs.io?body=#{encodeURIComponent(textBody)}'>contact@velocitylabs.io</a>?
              </div>
            """

        , complete: () ->
          $('#contactForm button[type=submit]').prop('disabled', false).html(originalButtonText)
          ga('send', 'event', $(form).data('form'), 'Submitted');
