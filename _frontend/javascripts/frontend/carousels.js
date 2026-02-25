document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('#quote-carousel .carousel-item');
  let maxHeight = 300;

  items.forEach(item => {
    maxHeight = Math.max(maxHeight, item.offsetHeight + 50);
  });

  items.forEach(item => {
    item.style.height = maxHeight + 'px';
  });
});
