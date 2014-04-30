$ ->
  height = 300

  for item in $('#quote-carousel .item')
    height = Math.max(height, $(item).height() + 50)
    console.log "Item: #{$(item).find('small a').attr('href')} - #{$(item).height() + 50}"

  console.log "Height: #{height}"

  for item in $('#quote-carousel .item')
    $(item).height(height)
