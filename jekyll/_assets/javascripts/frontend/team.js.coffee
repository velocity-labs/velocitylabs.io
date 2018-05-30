$ ->
  $('#team .owl-carousel').owlCarousel
    lazyLoad: true
    , items: Math.min($('#team .owl-carousel .item').length, 3)
    , theme: "owl-theme-main"
