document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach(el => {
    el.addEventListener('click', (e) => {
      if (window.location.pathname.replace(/^\//, '') === el.pathname.replace(/^\//, '') &&
          window.location.hostname === el.hostname) {
        const target = document.querySelector(el.hash) ||
                       document.querySelector('[name=' + el.hash.slice(1) + ']');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
