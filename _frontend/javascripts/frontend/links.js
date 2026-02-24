$(function() {
  $('.post-body a').each(function() {
    var a = new RegExp(window.location.host + '|mailto:|tel:');
    if (!a.test(this.href)) {
      $(this).attr('rel', $.trim([$(this).attr('rel'), 'external'].join(' ')));

      $(this).click(function(event) {
        window.open(this.href, '_blank');
        return false;
      });
    }
  });
});
