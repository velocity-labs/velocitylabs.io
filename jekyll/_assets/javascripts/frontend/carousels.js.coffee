$ ->
  height = 300

  for item in $('#quote-carousel .item')
    height = Math.max(height, $(item).height() + 50)

  for item in $('#quote-carousel .item')
    $(item).height(height)
