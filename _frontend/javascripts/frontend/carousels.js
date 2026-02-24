$(function() {
  var height = 300;
  var items = $('#quote-carousel .item');

  for (var i = 0; i < items.length; i++) {
    height = Math.max(height, $(items[i]).height() + 50);
  }

  for (var j = 0; j < items.length; j++) {
    $(items[j]).height(height);
  }
});
