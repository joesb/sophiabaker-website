// window.addEventListener("load", (event) => {

//   let button = document.getElementsByClassName("modal-click");

//   button.addEventListener("click", (event) => {
//     modal.requestFullscreen();
//   });
// });

$(document).ready(function () {
  $('.modal-click').on('click', function(e) {
    e.preventDefault();
    let fig = $(this).prev('figure'); 
    console.log(fig);
    fig.get(0).requestFullscreen();
  });
});