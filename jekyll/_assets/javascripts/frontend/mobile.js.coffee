$ ->
  if /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    $('.selectpicker').selectpicker 'mobile'
