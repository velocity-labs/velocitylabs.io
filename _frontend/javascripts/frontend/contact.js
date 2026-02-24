$(function() {
  $("#subscription-form").validate({
    errorElement: "span",
    errorClass: "help-block",
    errorPlacement: function(error, element) {
      return;
    },
    highlight: function(element) {
      $(element).closest(".form-group").addClass("has-error");
    },
    rules: {
      name: "required",
      company: "required",
      phone: "required"
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    }
  });

  $('.stripe-button-el').on('click', function() {
    if ($("#subscription-form").valid()) {
      $('#contact-form-error').html("");
      return true;
    } else {
      $('#contact-form-error').html("Please fill out form completely");
      return false;
    }
  });

  $("#contactForm").validate({
    errorElement: "span",
    errorClass: "help-block",
    errorPlacement: function(error, element) {
      return;
    },
    highlight: function(element) {
      $(element).closest(".form-group").addClass("has-error");
    },
    rules: {
      name: "required",
      email: {
        email: true,
        required: true
      },
      message: "required"
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler: function(form) {
      var $submitBtn = $(form).find('button[type=submit]');
      var originalButtonText = $submitBtn.html();

      $submitBtn.prop('disabled', true).html('Submitting...');

      var textBody = "Contact Information\n" +
        "====================\n\n" +
        "Name:  " + $(form).find('input#name').val() + "\n" +
        "Email: " + $(form).find('input#email').val() + "\n" +
        "Phone: " + $(form).find('input#phone').val() + "\n\n" +
        "Message\n" +
        "====================\n\n" +
        $(form).find('textarea#message').val();

      $.ajax({
        type: "POST",
        url: $(form).prop('action'),
        data: $(form).serializeArray(),
        success: function(data, status, xhr) {
          if (data.status == "success") {
            $('.contact-form').slideToggle(300, function() {
              $('.contact-button').toggleClass('active');

              $('#contact-form-success').html(
                "<div class='alert alert-success'>" +
                  "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
                  "<strong>Thanks! Your message has been sent. We'll get back with you shortly.</strong>" +
                "</div>"
              );

              $('#contact-form-error').html("");
              $('#contactForm').trigger("reset");
              ga('send', 'event', $(form).data('form'), 'Submitted');
            });
          } else {
            $('#contact-form-error').html(
              "<div class='alert alert-danger'>" +
                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
                "<strong>Sorry, there was a problem submitting the form.</strong> " +
                "Please check your entries and try again. If the problem persists, please email us directly at " +
                "<a target='_blank' href='mailto:contact@velocitylabs.io?body=" + encodeURIComponent(textBody) + "'>contact@velocitylabs.io</a>." +
              "</div>"
            );
          }
        },
        error: function(xhr, status, error) {
          $('#contact-form-error').html(
            "<div class='alert alert-danger'>" +
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
              "<strong>Sorry, it seems the mail server is not responding...</strong> " +
              "Could you please send an email directly to " +
              "<a target='_blank' href='mailto:contact@velocitylabs.io?body=" + encodeURIComponent(textBody) + "'>contact@velocitylabs.io</a>?" +
            "</div>"
          );
        },
        complete: function() {
          $('#contactForm button[type=submit]').prop('disabled', false).html(originalButtonText);
        }
      });
    }
  });
});
