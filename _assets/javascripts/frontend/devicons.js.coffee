$ ->
  $('[class*=" devicon-"], [class^=devicon-]').on 'mouseover', ->
    $(this).addClass 'colored'
  .on 'mouseout', ->
    $(this).removeClass 'colored'
