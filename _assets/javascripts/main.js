//= require_tree ./vendor
//= require_tree ./frontend
//= require custom
//= require_self

$(document).ready(function(){
  isotope();

  $('select').selectpicker();

  $('select.budget.selectpicker').on('change', function() {
    if($(this).val() != '') {
      $('.budget.bootstrap-select .filter-option').css({ color: '#555' });
    } else {
      $('.budget.bootstrap-select .filter-option').css({ color: '#999' });
    }
  });

  setTimeout(function() { $('.preloader').fadeOut(1000); }, 1000);
});
