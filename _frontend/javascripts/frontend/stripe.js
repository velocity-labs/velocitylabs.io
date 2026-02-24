// TODO: re-enable Stripe Checkout integration
// Requires STRIPE_PUBLISHABLE_KEY to be injected at build time
//
// $(function() {
//   if (typeof StripeCheckout !== 'undefined') {
//     var handler = StripeCheckout.configure({
//       key: 'STRIPE_PUBLISHABLE_KEY_PLACEHOLDER',
//       locale: 'auto',
//       name: "Velocity Labs",
//       description: "Monthly App Maintenance",
//       'panel-label': "Subscribe",
//       token: function(token) {
//         $('#subscription-form').append($('<input>', {type: 'hidden', value: token.id, name: 'stripeToken'}));
//         $('#subscription-form').append($('<input>', {type: 'hidden', value: token.email, name: 'stripeEmail'}));
//         $('#subscription-form').submit();
//       }
//     });
//
//     $('#purchase').on('click', function(e) {
//       if ($('#subscription-form').valid()) {
//         handler.open({
//           name: 'Velocity Labs',
//           description: 'Monthly App Maintenance'
//         });
//       } else {
//         alert("Please fill out form completely");
//       }
//       e.preventDefault();
//     });
//   }
// });
