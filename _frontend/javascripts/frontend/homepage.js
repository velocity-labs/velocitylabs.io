function urlParam(target) {
  const params = new URLSearchParams(window.location.search);
  return params.get(target) || '';
}

document.addEventListener('DOMContentLoaded', () => {
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
