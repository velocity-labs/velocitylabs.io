$ ->
  # Open external links in a new tab/window
  $('.post-body a').each ->
    a = new RegExp(window.location.host + '|mailto:|tel:')
    if !a.test(this.href)
      $(this).attr 'rel', $.trim([$(this).attr('rel'), 'external'].join(' '))

      $(this).click (event) ->
        window.open this.href, '_blank'
        false
