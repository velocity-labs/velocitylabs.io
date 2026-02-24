$(function() {
  $('[class*=" devicon-"], [class^=devicon-]').on('mouseover', function() {
    $(this).addClass('colored');
  }).on('mouseout', function() {
    $(this).removeClass('colored');
  });
});
