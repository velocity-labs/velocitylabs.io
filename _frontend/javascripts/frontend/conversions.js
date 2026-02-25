document.addEventListener('DOMContentLoaded', () => {
  const conversionForms = [
    { selector: '[data-form="Maintenance Form"]', sendTo: 'AW-960263497/EFULCKirioUBEMnq8ckD' },
    { selector: '[data-form="Upgrade Form"]', sendTo: 'AW-960263497/8nV2CPTngoUBEMnq8ckD' },
    { selector: '[data-form="Code Audit Form"]', sendTo: 'AW-960263497/evf8CKS8ioUBEMnq8ckD' },
  ];

  conversionForms.forEach(({ selector, sendTo }) => {
    const form = document.querySelector(selector);
    if (form) {
      form.addEventListener('submit', () => {
        if (form.checkValidity()) {
          gtag('event', 'conversion', { 'send_to': sendTo });
        }
      });
    }
  });

  const subForm = document.getElementById('subscription-form');
  if (subForm) {
    subForm.addEventListener('submit', () => {
      if (subForm.checkValidity()) {
        const phoneInput = subForm.querySelector('input[name="phone"]');
        gtag('event', 'conversion', {
          'send_to': 'AW-960263497/TQnhCJOg9IQBEMnq8ckD',
          'transaction_id': phoneInput ? phoneInput.value : ''
        });
      }
    });
  }
});
