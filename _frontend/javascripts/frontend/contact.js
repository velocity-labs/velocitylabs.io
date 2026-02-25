document.addEventListener('DOMContentLoaded', () => {
  // Subscription form validation (Stripe button gate)
  const subForm = document.getElementById('subscription-form');
  if (subForm) {
    subForm.querySelector('[name="name"]')?.setAttribute('required', '');
    subForm.querySelector('[name="company"]')?.setAttribute('required', '');
    subForm.querySelector('[name="phone"]')?.setAttribute('required', '');

    const stripeBtn = document.querySelector('.stripe-button-el');
    if (stripeBtn) {
      stripeBtn.addEventListener('click', (e) => {
        highlightErrors(subForm);
        const errEl = document.getElementById('contact-form-error');
        if (!subForm.checkValidity()) {
          if (errEl) errEl.textContent = 'Please fill out form completely';
          e.preventDefault();
        } else {
          if (errEl) errEl.textContent = '';
        }
      });
    }
  }

  // Contact form validation + submission
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // Set validation constraints
  const nameInput = contactForm.querySelector('[name="name"]');
  const emailInput = contactForm.querySelector('[name="email"]');
  const messageTextarea = contactForm.querySelector('textarea[name="message"]');

  if (nameInput) nameInput.required = true;
  if (emailInput) { emailInput.required = true; emailInput.type = 'email'; }
  if (messageTextarea) messageTextarea.required = true;

  // Live error styling on input
  contactForm.addEventListener('input', (e) => {
    const fg = e.target.closest('.form-group');
    if (fg) {
      fg.classList.toggle('has-error', !e.target.validity.valid);
    }
    // Clear validation message once all required fields are valid
    if (contactForm.checkValidity()) {
      const errEl = document.getElementById('contact-form-error');
      if (errEl) errEl.textContent = '';
    }
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorEl = document.getElementById('contact-form-error');

    if (!validateAndHighlight(contactForm)) {
      showValidationMessage(errorEl, contactForm);
      return;
    }

    // Clear validation message on successful submit
    if (errorEl) errorEl.textContent = '';

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData(contactForm);
    const textBody = buildTextBody(formData);
    const successEl = document.getElementById('contact-form-success');

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new URLSearchParams(formData)
      });
      const data = await response.json();

      if (data.status === 'success') {
        const wrapper = contactForm.closest('.contact-form');
        if (wrapper) wrapper.style.display = 'none';

        const contactBtn = document.querySelector('.contact-button');
        if (contactBtn) contactBtn.classList.toggle('active');

        if (successEl) {
          successEl.textContent = '';
          const alertDiv = createAlert('alert-success',
            'Thanks! Your message has been sent. We\'ll get back with you shortly.');
          successEl.appendChild(alertDiv);
        }

        if (errorEl) errorEl.textContent = '';
        contactForm.reset();

        if (typeof ga === 'function') {
          ga('send', 'event', contactForm.dataset.form, 'Submitted');
        }
      } else {
        showErrorAlert(errorEl, textBody,
          'Sorry, there was a problem submitting the form. ' +
          'Please check your entries and try again. If the problem persists, please email us directly at ');
      }
    } catch {
      showErrorAlert(errorEl, textBody,
        'Sorry, it seems the mail server is not responding... ' +
        'Could you please send an email directly to ');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});

function highlightErrors(form) {
  form.querySelectorAll('.form-group').forEach(fg => {
    const input = fg.querySelector('input, textarea');
    if (input) {
      fg.classList.toggle('has-error', !input.validity.valid);
    }
  });
}

function validateAndHighlight(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    const fg = input.closest('.form-group');
    if (!input.validity.valid) {
      if (fg) fg.classList.add('has-error');
      valid = false;
    } else {
      if (fg) fg.classList.remove('has-error');
    }
  });
  return valid;
}

function buildTextBody(formData) {
  return "Contact Information\n" +
    "====================\n\n" +
    "Name:  " + (formData.get('name') || '') + "\n" +
    "Email: " + (formData.get('email') || '') + "\n" +
    "Phone: " + (formData.get('phone') || '') + "\n\n" +
    "Message\n" +
    "====================\n\n" +
    (formData.get('message') || '');
}

function createAlert(className, text) {
  const div = document.createElement('div');
  div.className = 'alert alert-dismissible ' + className;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn-close';
  closeBtn.setAttribute('data-bs-dismiss', 'alert');
  closeBtn.setAttribute('aria-label', 'Close');

  const strong = document.createElement('strong');
  strong.textContent = text;

  div.appendChild(closeBtn);
  div.appendChild(strong);
  return div;
}

function showErrorAlert(el, textBody, message) {
  if (!el) return;
  el.textContent = '';

  const div = document.createElement('div');
  div.className = 'alert alert-dismissible alert-danger';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn-close';
  closeBtn.setAttribute('data-bs-dismiss', 'alert');
  closeBtn.setAttribute('aria-label', 'Close');

  const strong = document.createElement('strong');
  strong.textContent = message;

  const link = document.createElement('a');
  link.target = '_blank';
  link.href = 'mailto:contact@velocitylabs.io?body=' + encodeURIComponent(textBody);
  link.textContent = 'contact@velocitylabs.io';

  div.appendChild(closeBtn);
  div.appendChild(strong);
  div.appendChild(link);
  div.appendChild(document.createTextNode('.'));

  el.appendChild(div);
}

function showValidationMessage(el, form) {
  if (!el) return;
  const missing = [];
  form.querySelectorAll('[required]').forEach(input => {
    if (!input.validity.valid) {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) missing.push(placeholder);
    }
  });
  el.textContent = '';
  const div = document.createElement('div');
  div.className = 'alert alert-warning';
  div.textContent = missing.length
    ? 'Please fill in: ' + missing.join(', ')
    : 'Please fill out all required fields.';
  el.appendChild(div);
}
