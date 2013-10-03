/************************************
 * Round timer for eudomonia game store
 * written by Cooper Quintin <cooperq@gmail.com>
 * see LICENSE for license details
 ************************************/
$(function(){
  var $el = $('.slideshowContainer');
  var slidesUrl = "/slides/json";
  var slides = '';
  var slidesJSON = $.getJSON(slidesUrl, function(data){
    slides = data;
    displayRandomSlide();
  });

  var displayRandomSlide = function(){
    var slide = _.sample(slides);
    $el.html("<img class='slide' src='" + slide.url + "'>");
    window.setTimeout(displayRandomSlide, slide.time_length * 1000);
  };

  //refresh the slides every 5 seconds
  window.setInterval(function(){
    $.getJSON(slidesUrl, function(data){
      slides = data;
    });
  }, 5000);
});
