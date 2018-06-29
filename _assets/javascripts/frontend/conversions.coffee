$ ->
  $('[data-form="Maintenance Form"]').on 'submit', ->
    if $(this).valid()
      # Event snippet for Maintenance Contact conversion page
      gtag 'event', 'conversion', {
        'send_to': 'AW-960263497/EFULCKirioUBEMnq8ckD'
      }

  $('[data-form="Upgrade Form"]').on 'submit', ->
    if $(this).valid()
      # Event snippet for Upgrade Contact conversion page
      gtag 'event', 'conversion', {
        'send_to': 'AW-960263497/8nV2CPTngoUBEMnq8ckD'
      }

  $('[data-form="Code Audit Form"]').on 'submit', ->
    if $(this).valid()
      # Event snippet for Code Audit Contact conversion page
      gtag 'event', 'conversion', {
        'send_to': 'AW-960263497/evf8CKS8ioUBEMnq8ckD'
      }

  $('#subscription-form').on 'submit', ->
    if $(this).valid()
      # Event snippet for Maintenance Signup conversion page
      gtag 'event', 'conversion', {
        'send_to': 'AW-960263497/TQnhCJOg9IQBEMnq8ckD',
        'transaction_id': $(this).find('input[name=phone]').val()
      }
