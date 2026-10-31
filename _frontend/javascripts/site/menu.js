import { $ } from '../lib/dom.js';

// On phones the header links fold behind a Menu button (_includes/site/header.html)
export function init() {
  const nav = $('nav.primary');
  const toggle = nav && $('.menu-toggle', nav);
  if (!toggle) return;

  const isOpen = () => nav.classList.contains('open');
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  // close on Escape, on following a link, or on a click anywhere else
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('.nav-links a')) setOpen(false);
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !nav.contains(e.target)) setOpen(false);
  });
}
