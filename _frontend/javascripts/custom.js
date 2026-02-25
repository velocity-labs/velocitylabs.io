/* -- Full Screen Viewport Container
   ---------------------------- */
window.addEventListener('load', () => {
  onePageScroll();
  scrollAnchor();
});

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initPortfolioFilter();
});

/* --- Lightbox (replaces Magnific Popup) ------------------- */
function initLightbox() {
  const galleries = document.querySelectorAll('.popup-gallery');
  if (galleries.length === 0) return;

  // Build gallery items array
  const items = Array.from(galleries).map(el => ({
    src: el.getAttribute('href'),
    title: el.getAttribute('title') || '',
    el: el
  }));

  // Create dialog element
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox-dialog';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '\u00D7';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lightbox-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.textContent = '\u2039';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lightbox-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.textContent = '\u203A';

  const counter = document.createElement('div');
  counter.className = 'lightbox-counter';

  const img = document.createElement('img');
  img.alt = '';

  dialog.appendChild(closeBtn);
  dialog.appendChild(prevBtn);
  dialog.appendChild(img);
  dialog.appendChild(nextBtn);
  dialog.appendChild(counter);
  document.body.appendChild(dialog);

  let currentIndex = 0;

  function show(index) {
    currentIndex = index;
    img.src = items[index].src;
    img.alt = items[index].title;
    counter.textContent = (index + 1) + ' of ' + items.length;
    prevBtn.style.display = items.length > 1 ? '' : 'none';
    nextBtn.style.display = items.length > 1 ? '' : 'none';
  }

  // Open on click (respect disableOn: 700)
  galleries.forEach((el, i) => {
    el.addEventListener('click', (e) => {
      if (window.innerWidth < 700) return;
      e.preventDefault();
      show(i);
      dialog.showModal();
    });
  });

  closeBtn.addEventListener('click', () => dialog.close());

  prevBtn.addEventListener('click', () => {
    show((currentIndex - 1 + items.length) % items.length);
  });

  nextBtn.addEventListener('click', () => {
    show((currentIndex + 1) % items.length);
  });

  // Close on backdrop click
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Keyboard navigation
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
}

/* --- Portfolio Filter (replaces Isotope) ------------------- */
function initPortfolioFilter() {
  const container = document.getElementById('portfolio');
  const filtersEl = document.getElementById('filters');
  if (!container || !filtersEl) return;

  filtersEl.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;

    const filterValue = e.target.getAttribute('data-filter-value');

    container.querySelectorAll('.portfolio-item').forEach(item => {
      if (filterValue === '*' || item.classList.contains(filterValue.replace('.', ''))) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    filtersEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
  });
}

/* --- Scroll to Anchor ------------------- */
function scrollAnchor() {
  document.querySelectorAll('.scroll').forEach(el => {
    el.addEventListener('click', (e) => {
      if (location.pathname.replace(/^\//, '') === el.pathname.replace(/^\//, '') &&
          location.hostname === el.hostname) {
        const target = document.querySelector(el.hash);
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - 30,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/* --- One Page Scroll (replaces jQuery One Page Nav) ------------------- */
function onePageScroll() {
  if (!document.getElementById('home')) return;

  const navLinks = document.querySelectorAll('.nav a[href^="/#"]');
  const sections = [];

  navLinks.forEach(link => {
    const hash = link.getAttribute('href').replace('/', '');
    const section = document.querySelector(hash);
    if (section) sections.push({ el: section, link: link.closest('li') });
  });

  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav li.current').forEach(li => li.classList.remove('current'));
        const match = sections.find(s => s.el === entry.target);
        if (match && match.link) match.link.classList.add('current');
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => observer.observe(s.el));
}

window.addEventListener('scroll', () => {
  if (window.scrollY <= 500) {
    document.querySelectorAll('.nav li.current').forEach(el => el.classList.remove('current'));
  }
});

/*When clicking on Full hide fail/success boxes */
const nameInput = document.getElementById('name');
const successEl = document.getElementById('success');
if (nameInput && successEl) {
  nameInput.addEventListener('focus', () => { successEl.textContent = ''; });
}
