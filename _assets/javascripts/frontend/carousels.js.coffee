$ ->
  height = 0
  for item in $('#quote-carousel .item')
    height = Math.max(height, $(item).height())

  $('#quote-carousel .item').height(height)
