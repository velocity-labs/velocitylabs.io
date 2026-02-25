document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.navbar-wrapper');
  if (wrapper) wrapper.classList.add('cbp-af-header');

  const deviceXs = document.querySelector('.device-xs');
  const navSmall = document.querySelector('.navbar-small');

  if (deviceXs && getComputedStyle(deviceXs).display !== 'none') return;

  if (navSmall && getComputedStyle(navSmall).display !== 'none') {
    navSmall.classList.add('cbp-af-header-shrink');
  } else {
    // Inline replacement for cbpAnimatedHeader
    const header = document.querySelector('.cbp-af-header');
    if (header) {
      let didScroll = false;
      window.addEventListener('scroll', () => { didScroll = true; });
      setInterval(() => {
        if (didScroll) {
          header.classList.toggle('cbp-af-header-shrink', window.scrollY >= 50);
          didScroll = false;
        }
      }, 100);
    }
  }
});
