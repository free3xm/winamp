document.addEventListener("DOMContentLoaded", () => {
  const winamp = document.querySelector(".winamp"),
        btnEq = document.querySelector(".btn_toggle_eq"),
        btnPl = document.querySelector(".btn_toggle_pl"),
        btnEqClose = document.querySelector("#eqClose"),
        btnPlClose = document.querySelector("#plClose"),
        eq = document.querySelector(".winamp_equalizer"),
        pl = document.querySelector(".winamp_playlist");
        
  winamp.addEventListener("click", event => {
    if(event.target == btnEq){
      eq.classList.toggle("display_item");
      btnEq.classList.toggle("eq_off");
    }
    if(event.target == btnPl){
      pl.classList.toggle("display_item");
      btnPl.classList.toggle("pl_off");
     }
    if(event.target == btnEqClose){
      eq.classList.add("display_item");
      btnEq.classList.add("eq_off");
    }
    if(event.target == btnPlClose){
      pl.classList.add("display_item");
      btnPl.classList.add("pl_off");
    }
  })
});
