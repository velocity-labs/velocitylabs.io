document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[class*=" devicon-"], [class^=devicon-]').forEach(el => {
    el.addEventListener('mouseover', () => el.classList.add('colored'));
    el.addEventListener('mouseout', () => el.classList.remove('colored'));
  });
});
