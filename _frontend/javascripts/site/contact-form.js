// The contact form (_includes/blocks/contact-form.html). It adds the signed
// form token and a reCAPTCHA v3 token, posts to /contact-form (main.rb), and
// reports the result in the form's status region. A sent form records the
// page's Google Ads conversion, when it has one.
const EMAIL = 'contact@velocitylabs.io';

export function init(form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const required = Array.from(form.querySelectorAll('[required]'));

  // main.rb checks the token's signature and age (verify_form_token)
  let token = null;
  const fetchToken = () => fetch('/form-token')
    .then((response) => response.json())
    .then((data) => { token = data.token; })
    .catch(() => {});
  fetchToken();

  // reCAPTCHA v3 (~350KB) loads once the form is near the viewport or first used
  const siteKey = form.dataset.recaptchaKey;
  let recaptcha = null;
  const loadRecaptcha = () => {
    if (!siteKey) return null;
    recaptcha ||= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.onload = () => grecaptcha.ready(resolve);
      script.onerror = reject;
      document.head.appendChild(script);
    });
    recaptcha.catch(() => {}); // a failed load surfaces on submit
    return recaptcha;
  };
  if (siteKey) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadRecaptcha();
    }, { rootMargin: '600px 0px' });
    observer.observe(form);
    form.addEventListener('focusin', loadRecaptcha, { once: true });
  }

  // "your name", "a valid email address": how "Please add ..." names a field
  const describe = (field) => {
    if (field.validity.typeMismatch) return 'a valid email address';
    return field.dataset.missing || form.querySelector(`label[for="${field.id}"]`)?.textContent.trim() || field.name;
  };
  const list = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);
  const validate = (field) => {
    const valid = field.validity.valid;
    field.setAttribute('aria-invalid', String(!valid));
    return valid;
  };
  // once a field has been flagged, recheck it as the reader types
  form.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) validate(e.target);
  });

  // Buttons like "Order Standard" (blocks/tiers.html) lead here and start the
  // message for the reader, unless they've already written their own
  const message = form.querySelector('[name="message"]');
  document.querySelectorAll('a[href="#contact"][data-prefill]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!message.value.trim() || message.value === message.dataset.prefilled) {
        message.value = `${link.dataset.prefill}\n\n`;
        message.dataset.prefilled = message.value;
        if (message.hasAttribute('aria-invalid')) validate(message);
      }
      // once the link has scrolled to the form, the cursor waits in the first
      // empty field, or after the message's opening line
      setTimeout(() => {
        const next = required.find((field) => !field.value.trim()) || message;
        next.focus({ preventScroll: true });
        if (next === message) message.setSelectionRange(message.value.length, message.value.length);
      });
    });
  });

  // what they wrote, as an email body, for when sending fails. The need is the
  // option they picked, or on a service page, the page's own service
  const emailBody = (data) => {
    const need = form.querySelector('input[name="need"]:checked')?.nextElementSibling?.textContent
      || form.querySelector('input[name="need"][type="hidden"]')?.dataset.label;
    const lines = [`Name: ${data.get('name') || ''}`, `Email: ${data.get('email') || ''}`];
    if (need) lines.push(`Need: ${need}`);
    lines.push('', data.get('message') || '');
    return lines.join('\n');
  };

  const show = (kind, message, data) => {
    const notice = document.createElement('div');
    notice.className = `notice notice-${kind}`;
    notice.append(message);
    if (data) {
      const link = document.createElement('a');
      link.href = `mailto:${EMAIL}?body=${encodeURIComponent(emailBody(data))}`;
      link.textContent = EMAIL;
      notice.append(link, '.');
    }
    status.replaceChildren(notice);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const missing = required.filter((field) => !validate(field));
    if (missing.length) {
      show('error', `Please add ${list(missing.map(describe))}.`);
      missing[0].focus();
      return;
    }

    const data = new FormData(form);
    if (token) data.append('_csrf_token', token);
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      if (siteKey) {
        try {
          await loadRecaptcha();
          data.append('g-recaptcha-response', await grecaptcha.execute(siteKey, { action: 'contact_form' }));
        } catch {
          show('error', "We couldn't verify the form. Please refresh the page and try again, or email us at ", data);
          return;
        }
      }

      const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(data) });
      if (response.status === 429) {
        show('error', 'Too many messages from here. Please wait a while and try again, or email us at ', data);
        return;
      }
      const result = await response.json();
      if (result.status !== 'success') {
        show('error', 'Sorry, there was a problem sending your message. Please check your entries and try again, or email us at ', data);
        return;
      }

      form.classList.add('sent');
      show('success', "Thanks! Your message has been sent. We'll get back to you shortly.");
      form.reset();
      fetchToken(); // a fresh token in case they write again
      if (form.dataset.conversion && typeof gtag === 'function') {
        gtag('event', 'conversion', { send_to: form.dataset.conversion });
      }
      form.dispatchEvent(new CustomEvent('contact:sent', { bubbles: true }));
    } catch {
      show('error', "Sorry, our mail server isn't responding. Please email us directly at ", data);
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
}
