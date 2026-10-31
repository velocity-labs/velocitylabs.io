// Cookie consent banner. Consent Mode defaults and the saved-choice check
// live in _includes/_google-analytics.html so they run before gtag loads.
export function init() {
  const banner = document.getElementById('cookie-consent');
  const consent = window.cookieConsent;
  if (!banner || !consent) return;

  const message = banner.querySelector('[data-cookie-message]');
  const acceptButton = banner.querySelector('[data-cookie-consent="granted"]');
  const declineButton = banner.querySelector('[data-cookie-consent="denied"]');
  const firstVisit = { message: message.innerHTML, accept: acceptButton.textContent, decline: declineButton.textContent };

  // Remove analytics and ad cookies already set (e.g. after a change of mind)
  const clearGoogleCookies = () => {
    const host = location.hostname;
    const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
    document.cookie.split(';').map(c => c.split('=')[0].trim())
      .filter(name => /^(_ga|_gid|_gat|_gcl)/.test(name))
      .forEach(name => domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      }));
  };

  // Settings mode: describe the current choice and phrase the buttons as
  // changing or keeping it. Returns the button that changes it.
  const showCurrentChoice = () => {
    const record = consent.record();
    const choice = record ? record.choice : (navigator.globalPrivacyControl ? 'denied' : null);
    if (!choice) return acceptButton;

    const on = choice === 'granted';
    const state = `Analytics and advertising cookies are <strong>${on ? 'on' : 'off'}</strong>.`;
    if (record) {
      const date = new Date(record.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      message.innerHTML = `${state} You ${on ? 'accepted' : 'declined'} them on ${date}.`;
    } else {
      message.innerHTML = `${state} Your browser sends a Global Privacy Control signal, so we turned them off.`;
    }
    acceptButton.textContent = on ? 'Keep them on' : 'Turn them on';
    declineButton.textContent = on ? 'Turn them off' : 'Keep them off';
    banner.setAttribute('aria-label', 'Cookie settings');
    return on ? declineButton : acceptButton;
  };

  const hide = () => {
    banner.hidden = true;
    message.innerHTML = firstVisit.message;
    acceptButton.textContent = firstVisit.accept;
    declineButton.textContent = firstVisit.decline;
    banner.setAttribute('aria-label', 'Cookie consent');
  };

  if (!consent.saved() && !navigator.globalPrivacyControl) banner.hidden = false;

  [acceptButton, declineButton].forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.dataset.cookieConsent;
      try {
        localStorage.setItem(consent.key, JSON.stringify({ choice, at: Date.now() }));
      } catch {
        // Storage blocked: the choice still applies for this page view
      }
      if (typeof gtag === 'function') gtag('consent', 'update', consent.state(choice));
      if (choice === 'denied') clearGoogleCookies();
      hide();
    });
  });

  document.querySelectorAll('[data-cookie-settings]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const changeButton = showCurrentChoice();
      banner.hidden = false;
      changeButton.focus();
    });
  });

  // Escape closes settings without changing anything (the first-visit
  // banner stays until the visitor chooses)
  banner.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && banner.getAttribute('aria-label') === 'Cookie settings') hide();
  });
}
