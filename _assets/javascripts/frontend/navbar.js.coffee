$ ->
  $('.navbar-wrapper').addClass 'cbp-af-header'

  unless $('.device-xs').is(':visible')
    if $('.navbar-small').is(':visible')
      $('.navbar-small').addClass 'cbp-af-header-shrink'
    else
      cbpAnimatedHeader()
