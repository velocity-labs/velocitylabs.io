document.addEventListener('DOMContentLoaded', () => {
  const hostPattern = new RegExp(window.location.host + '|mailto:|tel:');

  document.querySelectorAll('.post-body a').forEach(el => {
    if (!hostPattern.test(el.href)) {
      const rel = [el.getAttribute('rel'), 'external'].filter(Boolean).join(' ').trim();
      el.setAttribute('rel', rel);
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(el.href, '_blank');
      });
    }
  });
});
