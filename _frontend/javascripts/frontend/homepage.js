function resize() {
  var screenWidth = $(window).width() + "px";
  var screenHeight = $(window).height() + "px";

  $("#intro, #intro .item, #intro-video, #intro-video .item").css({
    width: screenWidth,
    height: screenHeight
  });
}

function urlParam(target) {
  var url = window.location.search.substring(1);
  var params = url.split('&');

  for (var i = 0; i < params.length; i++) {
    var values = params[i].split('=');
    if (values[0] == target) {
      return values[1];
    }
  }

  return '';
}

$(function() {
  resize();
  $(window).resize(resize);

  var urlMatch = urlParam('ref');
  if (document.referrer.match(/flatterline/i) || urlMatch.match(/flatterline/i)) {
    $('#intro .hero h2').before('<div class="alert alert-success"><div style="text-transform: uppercase;">Welcome Flatterline visitor!</div>We recently merged with another awesome development company and became Velocity Labs!</div>');
  }
});
