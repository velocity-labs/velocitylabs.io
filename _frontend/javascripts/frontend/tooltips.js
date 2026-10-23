import { Popover } from 'bootstrap';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.popovers').forEach(el => {
    new Popover(el, {
      container: 'body',
      placement: 'auto',
      trigger: 'hover'
    });
  });
});
