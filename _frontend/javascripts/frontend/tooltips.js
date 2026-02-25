document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.popovers').forEach(el => {
    new bootstrap.Popover(el, {
      container: 'body',
      placement: 'auto',
      trigger: 'hover'
    });
  });
});
