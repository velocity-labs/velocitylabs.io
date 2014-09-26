resize = () ->
  screenWidth  = $(window).width() + "px"
  screenHeight = $(window).height() + "px"

  $("#intro, #intro .item, #intro-video, #intro-video .item").css
    width: screenWidth
    height: screenHeight

$ ->
  resize()
  $(window).resize resize
