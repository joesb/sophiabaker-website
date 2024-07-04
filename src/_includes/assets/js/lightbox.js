// window.addEventListener("load", (event) => {

//   let button = document.getElementsByClassName("modal-click");

//   button.addEventListener("click", (event) => {
//     modal.requestFullscreen();
//   });
// });

$(document).ready(function () {
  $('.modal-click').on('click', function(e) {
    e.preventDefault();
    let fig = $(this).parents('.modal-click-parent');
    if (fig.hasClass('lightbox-active')) {
      fig.removeClass('lightbox-active');
      document.exitFullscreen();
    }
    else {
      fig.addClass('lightbox-active');
      fig.get(0).requestFullscreen();
    }
    // if (fig.get(0).fullscreenElement) {
    //   fig.removeClass('lightbox-active');
    //   fig.get(0).exitFullScreen().catch((err) => console.error(err));
    // }
    // else {
    //   fig.addClass('lightbox-active');
    //   fig.get(0).requestFullscreen();
    // }
  });

  $('.modal-click--info').on('click', function(e) {
    e.preventDefault();
    $(this).parents('.modal-click-parent').toggleClass('modal-hide-caption');
  });

  $(document).on('fullscreenchange', (e) => {
    fsHandler(e);
  });

});

function fsHandler(event) {
  if (event.currentTarget.fullscreenElement == null) {
    $('.modal-click-parent').removeClass('lightbox-active modal-hide-caption');
  }
}

function is_fullscreen(){
  return document.fullscreenElement != null;
}