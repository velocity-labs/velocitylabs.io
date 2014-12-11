resize = () ->
  screenWidth  = $(window).width() + "px"
  screenHeight = $(window).height() + "px"

  $("#intro, #intro .item, #intro-video, #intro-video .item").css
    width: screenWidth
    height: screenHeight

$ ->
  resize()
  $(window).resize resize

  if document.referrer.match /flatterline/i
    $('#intro .hero h2').before "<div class=\"alert alert-success\"><div style=\"text-transform: uppercase;\">Welcome Flatterline visitor!</div>We recently merged with another awesome development company and became Velocity Labs!</div>"
