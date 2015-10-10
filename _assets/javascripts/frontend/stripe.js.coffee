$ ->

  handler = StripeCheckout.configure
    key: 'pk_test_SMf650UInyCThOELNsNrb37z',
    locale: 'auto',
    name: "Velocity Labs",
    description: "Monthly App Maintenance",
    'panel-label': "Subscribe",
    token: (token) ->
      $('#subscription-form').append($('<input>', {type: 'hidden', value: token.id, name: 'stripeToken'}))
      $('#subscription-form').append($('<input>', {type: 'hidden', value: token.email, name: 'stripeEmail'}))
      $('#subscription-form').submit()


  $('#purchase').on 'click', (e) ->
    if $('#subscription-form').valid()
      # Open Checkout with further options
      handler.open({
        name: 'Velocity Labs',
        description: 'Monthly App Maintenance'
      })
    else
      alert("Please fill out form completely")

    e.preventDefault()
