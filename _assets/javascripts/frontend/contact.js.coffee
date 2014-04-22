$ ->
  $(".contact-button").on "click", () ->
    $(this).toggleClass "active"
    $("#contact-form-error").html("")
    $("#contact-form-success").html("")
    $(".contact-form").slideToggle 300, () ->
      $("html,body").animate { scrollTop: $("#contact").offset().top - 30 }, 650

  $("#contactForm").validate
    errorElement: "span"
    , errorClass: "help-block"
    , errorPlacement: (error, element) ->
      return

    , highlight: (element) ->
      $(element).closest(".form-group").addClass "has-error"

    , rules:
      first_name: "required"
      , last_name: "required"
      , company: "required"
      , email:
        email: true
        , required: true
      , message: "required"

    , unhighlight: (element) ->
      $(element).closest('.form-group').removeClass 'has-error'

    , submitHandler: (form) =>
      originalButtonText = $(@).find('button[type=submit]').html()
      $(@).find('button[type=submit]').prop('disabled', true).html('Submitting...')

      htmlBody = """
        <div style="font-family:Helvetica;">
          <h2>Contact Information</h2>

          <table style="font-size:11pt;">
            <tbody>
              <tr>
                <td width="25%">First name:</td>
                <td>#{$(@).find('input#first_name').val()}</td>
              </tr>
              <tr>
                <td>Last name:</td>
                <td>#{$(@).find('input#last_name').val()}</td>
              </tr>
              <tr>
                <td>Company:</td>
                <td>#{$(@).find('input#company').val()}</td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>#{$(@).find('input#email').val()}</td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td>#{$(@).find('input#phone').val()}</td>
              </tr>
              <tr>
                <td>Budget:</td>
                <td>#{$(@).find('select#budget').val()}</td>
              </tr>
            </tbody>
          </table>

          <h2>Message</h2>
          <p style="font-size:11pt;">#{$(@).find('textarea#message').val()}</p>
        </div>
      """

      textBody = """
        Contact Information
        ====================

        First name: #{$(@).find('input#first_name').val()}
        Last name:  #{$(@).find('input#last_name').val()}
        Company:    #{$(@).find('input#company').val()}
        Email:      #{$(@).find('input#email').val()}
        Phone:      #{$(@).find('input#phone').val()}
        Budget:     #{$(@).find('select#budget').val()}

        Message
        ====================

        #{$(@).find('textarea#message').val()}
      """

      $.ajax
        type:  "POST"
        , url: "https://mandrillapp.com/api/1.0/messages/send.json"
        , data: {
          key: "xalMwI5ohKF58bhUqvVuGg"
          , message: {
            from_email: $(@).find('input#email').val()
            , to: [{
                email:  "contact@velocitylabs.io"
                , name: "Velocity Labs"
                , type: "to"
              }]
            , autotext: true
            , subject: "A contact form was received"
            , html: htmlBody
            , text: textBody
          }
        }
        , success: (data, status, xhr) ->
          if data[0].status == "rejected" || data[0].status == "invalid"
            $('#contact-form-error').html """
              <div class='alert alert-danger'>
                <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                <strong>Sorry, there was a problem submitting the form.</strong>
                Please check your entries and try again. If the problem persists, please email us directly to <a target="_blank" href='mailto:contact@velocitylabs.io?body=#{encodeURIComponent(textBody)}'>contact@velocitylabs.io</a>.
              </div>
            """
          else
            $('.contact-form').slideToggle 300, () ->
              $('.contact-button').toggleClass 'active'

              $('#contact-form-success').html """
                <div class='alert alert-success'>
                  <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                  <strong>Thanks #{$("input#first_name").val()}, your message has been sent. We'll get back with you shortly.</strong>
                </div>
              """

              $('#contact-form-error').html("")
              $('#contactForm').trigger "reset"

        , error: (xhr, status, error) ->
            $('#contact-form-error').html """
              <div class='alert alert-danger'>
                <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                <strong>Sorry #{$("input#first_name").val()} it seems the mail server is not responding...</strong>
                Could you please email us directly to <a target="_blank" href='mailto:contact@velocitylabs.io?body=#{encodeURIComponent(textBody)}'>contact@velocitylabs.io</a>?
              </div>
            """
        , complete: () ->
          $('#contactForm button[type=submit]').prop('disabled', false).html(originalButtonText)
