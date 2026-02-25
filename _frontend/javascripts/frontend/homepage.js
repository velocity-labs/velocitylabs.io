function resize() {
  const w = window.innerWidth + 'px';
  const h = window.innerHeight + 'px';

  document.querySelectorAll('#intro, #intro .item, #intro-video, #intro-video .item').forEach(el => {
    el.style.width = w;
    el.style.height = h;
  });
}

function urlParam(target) {
  const params = new URLSearchParams(window.location.search);
  return params.get(target) || '';
}

document.addEventListener('DOMContentLoaded', () => {
  resize();
  window.addEventListener('resize', resize);

  const urlMatch = urlParam('ref');
  if (document.referrer.match(/flatterline/i) || (urlMatch && urlMatch.match(/flatterline/i))) {
    const h2 = document.querySelector('#intro .hero h2');
    if (h2) {
      h2.insertAdjacentHTML('beforebegin',
        '<div class="alert alert-success">' +
          '<div style="text-transform: uppercase;">Welcome Flatterline visitor!</div>' +
          'We recently merged with another awesome development company and became Velocity Labs!' +
        '</div>'
      );
    }
  }
});
