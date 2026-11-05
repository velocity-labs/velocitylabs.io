// Google Analytics key events. Mark these as key events in GA (Admin > Data
// display > Events): book_call, contact_email, contact_phone, and
// generate_lead (sent by contact-form.js). GA adds the page and the visit's
// source to each one, so they answer "where did this lead come from?".
// gtag and analyticsLive come from _includes/_google-analytics.html; off the
// live site events go to the console instead.

const BOOKING_HOSTS = ['calendar.app.google', 'calendar.google.com'];

export function track(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  if (window.analyticsLive) window.gtag('event', name, params);
  else console.debug('[analytics]', name, params);
}

// Where on the page a link sits: header, footer, post, or the section it's in
// (hero, page-hero, cta-band, contact, ...)
export function placement(link) {
  if (link.closest('header.top')) return 'header';
  if (link.closest('footer.site')) return 'footer';
  if (link.closest('.post-body')) return 'post';
  const section = link.closest('section');
  return (section && (section.id || section.classList[0])) || 'page';
}

function eventFor(link) {
  if (link.protocol === 'mailto:') return 'contact_email';
  if (link.protocol === 'tel:') return 'contact_phone';
  if (BOOKING_HOSTS.includes(link.hostname)) return 'book_call';
  return null;
}

export function init() {
  // capture phase, so it runs even if another handler stops the click
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href]');
    const name = link && eventFor(link);
    if (name) track(name, { placement: placement(link) });
  }, true);
}
