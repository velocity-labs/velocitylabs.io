resize = () ->
  screenWidth  = $(window).width() + "px"
  screenHeight = $(window).height() + "px"

  $("#intro, #intro .item, #intro-video, #intro-video .item").css
    width: screenWidth
    height: screenHeight

urlParam = (target) ->
  url    = window.location.search.substring(1)
  params = url.split '&'

  for param in params
    values = param.split('=')

    if values[0] == target
      return values[1]

  ''

$ ->
  resize()
  $(window).resize resize

  urlMatch = urlParam('ref')
  if document.referrer.match(/flatterline/i) || urlMatch.match(/flatterline/i)
    $('#intro .hero h2').before "<div class=\"alert alert-success\"><div style=\"text-transform: uppercase;\">Welcome Flatterline visitor!</div>We recently merged with another awesome development company and became Velocity Labs!</div>"
