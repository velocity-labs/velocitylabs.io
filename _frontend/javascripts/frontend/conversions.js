$(function() {
  $('[data-form="Maintenance Form"]').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/EFULCKirioUBEMnq8ckD'
      });
    }
  });

  $('[data-form="Upgrade Form"]').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/8nV2CPTngoUBEMnq8ckD'
      });
    }
  });

  $('[data-form="Code Audit Form"]').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/evf8CKS8ioUBEMnq8ckD'
      });
    }
  });

  $('#subscription-form').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/TQnhCJOg9IQBEMnq8ckD',
        'transaction_id': $(this).find('input[name=phone]').val()
      });
    }
  });
});
