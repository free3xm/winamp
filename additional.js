document.addEventListener("DOMContentLoaded", () => {
  const winamp = document.querySelector(".winamp"),
        btnEq = document.querySelector(".btn_toggle_eq"),
        btnPl = document.querySelector(".btn_toggle_pl"),
        btnEqClose = document.querySelector("#eqClose"),
        btnPlClose = document.querySelector("#plClose"),
        eq = document.querySelector(".winamp_equalizer"),
        pl = document.querySelector(".winamp_playlist"),
        playerHeader = document.querySelector("#player_title"),
        eqHeader = document.querySelector("#equalizer_title"),
        plHeader = document.querySelector("#playlist_title"),
        player = document.querySelector(".winamp_player"),
        equalizer = document.querySelector(".winamp_equalizer"),
        playlist = document.querySelector(".winamp_playlist"),
        winampLabel = document.querySelector(".icon_label");


  // select label
    document.addEventListener("click", event => {
      if(event.target.closest(".winamp_label")) winampLabel.classList.add("label_selected");
      else winampLabel.classList.remove("label_selected");
    });

    // open player
    document.addEventListener("dblclick", event => {
      if(event.target.closest(".winamp_label")){
        winamp.classList.remove("display_none");
        document.querySelector(".winamp_label").classList.add("display_none");
      }
    });

  winamp.addEventListener("click", event => {
    if(event.target == btnEq){
      eq.classList.toggle("display_none");
      btnEq.classList.toggle("eq_off");
    }
    if(event.target == btnPl){
      pl.classList.toggle("display_none");
      btnPl.classList.toggle("pl_off");
     }
    if(event.target == btnEqClose){
      eq.classList.add("display_none");
      btnEq.classList.add("eq_off");
    }
    if(event.target == btnPlClose){
      pl.classList.add("display_none");
      btnPl.classList.add("pl_off");
    }
  });

  document.addEventListener("mousedown",  moveElement, false);

  function moveElement(event){
    let elem = event.target.closest(".drag"),
        elemTitle = event.target.closest(".title_wrapper"),
        shiftX,
        shiftY;
      if(!elemTitle) return false;
      shiftX = event.clientX - elem.getBoundingClientRect().left;
      shiftY = event.clientY - elem.getBoundingClientRect().top;
      elem.style.position = "absolute";
      elem.style.zIndex = "3";
      moveAt(event);
    if(checkDest()) {
      document.addEventListener("mousemove", moveAtAll , false);
      document.addEventListener("mouseup", removeEvent.bind(null, moveAtAll));
    }
    else {
      document.addEventListener("mousemove", moveAt , false);
      document.addEventListener("mouseup", removeEvent.bind(null, moveAt));
    }


    function moveAt(event){
      elem.style.left = event.pageX - shiftX + "px";
      elem.style.top = event.pageY - shiftY + "px";
    }

    function moveAtAll(event){
      moveAt(event);
      moveOther(equalizer, 200,0);
      moveOther(playlist, 0, 475);
    }

    function removeEvent(fn){
      document.removeEventListener("mousemove", fn);

    }

    function checkDest(){
      const elemPlayer = player.getBoundingClientRect(),
            elemEq = equalizer.getBoundingClientRect(),
            elemPlaylist= playlist.getBoundingClientRect();
      if(elem == player && checkElem()) return true

      function checkElem(){
        if(elemEq.top + 10 > elemPlayer.bottom && elemPlayer.right < 10 + elemPlaylist.left &&
           elemEq.top  < elemPlayer.bottom + 10 && 10 + elemPlayer.right > elemPlaylist.left){
          return true;
        }
      }
    }
    function moveOther(e, t1, l1){
      e.style.top = parseInt(player.style.top) + t1 +"px";
      e.style.left = parseInt(player.style.left) + l1 + "px";
    }
  }
});
