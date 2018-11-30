$ ->
  $('a[href*="#"]:not([href="#"])').click ->

    if window.location.pathname.replace(/^\//, '') == @pathname.replace(/^\//, '') and window.location.hostname == @hostname
      target = $(@hash)
      target = if target.length then target else $('[name=' + @hash.slice(1) + ']')

      if target.length
        $('html, body').animate { scrollTop: target.offset().top }, 1000
        return false

    return