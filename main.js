document.addEventListener("DOMContentLoaded", () => {
  const addFiles = document.querySelector(".addFiles"),
        btnAddFiles = document.querySelectorAll(".files_select, .playlistAdd"),
        btnsPlay = document.querySelectorAll(".btnPlay, .playlistPlay"),
        btnsPause = document.querySelectorAll(".btnPause, .playlistPause"),
        btnsStop = document.querySelectorAll(".btnStop, .playlistStop"),
        btnsPrev = document.querySelectorAll(".btnPrev, .playlistPrev"),
        btnsNext = document.querySelectorAll(".btnNext, .playlistNext"),
        playlist = document.querySelector(".playlist"),
        timeLine = document.querySelector(".timeline"),
        musicBar = document.querySelector(".header_music_bar span"),
        displayTime = document.querySelectorAll(".display_time, .menu_music_time"),
        playlistAllTime = document.querySelectorAll(".menu_time_song, .menu_time_playlist"),
        displayMusicInfo = document.querySelectorAll(".display_kbps, .display_khz"),
        volume = document.querySelector(".volume"),
        balanceSlider = document.querySelector(".changeSide"),
        musicQuality = document.querySelectorAll(".music_mono, .music_stereo"),
        playerState = document.querySelector(".fa");

  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  let playlistMusicList,
      context = new AudioContext(),
      pannerNode = context.createStereoPanner(),
      gainNode = context.createGain(),
      playlistTime = {
        songTime: 0,
        listTime: 0
      },
      current = 0,
      timer,
      state = {
        play: "fa-play",
        pause: "fa-pause",
        stop: "fa-stop"
      },
      arrMusicSize = [],
      listOfSource = new WeakMap(),
      listOfSongs  = [];

      gainNode.connect(pannerNode);
      pannerNode.connect(context.destination);
      gainNode.connect(context.destination);

  timeLine.value = 0;
  playlistAllTime.forEach(e => e.textContent = "00:00");

  // functions for playlist
  function fillPlaylist(arr){
    playlistTime.listTime = 0;
    playlistTime.songTime = 0;
    let ul = document.createElement("ul");
    ul.classList.add("playlist_list");

    arr.forEach( (e,i) => {
      let li = document.createElement("li"),
          songName = document.createElement("div"),
          songDuration = document.createElement("div");
      li.classList.add("playlist_item");
      songName.classList.add("playlist_songName");
      songDuration.classList.add("playlist_songTime");
      songName.textContent = `${i+1}. ${e.textContent}`;

      e.addEventListener("loadedmetadata", () => {
            playlistTime.listTime += e.duration;
            playlistAllTime[1].textContent = countMusicTime(playlistTime.listTime);
        songDuration.textContent = countMusicTime(e.duration);
      });
      li.appendChild(songName);
      li.appendChild(songDuration);
      ul.appendChild(li);
    });

    playlist.appendChild(ul);
  }

   function countMusicTime(counter){
    let firstNumber =  Math.floor(counter/60),
        secondNumber =  Math.floor(counter%60);
        firstNumber = firstNumber < 10 ? "0" + firstNumber : firstNumber;
        secondNumber = secondNumber < 10 ? "0" + secondNumber : secondNumber;
        return  `${firstNumber}:${secondNumber}`;
  }

  function showSong(list, index){
    list.forEach( e => {
      if(e.classList.contains("current_song")){
        e.classList.remove("current_song");
      }
    });
    list[index].classList.add("current_song");
  }

  function playClickedSong(arr, index, list){
    list.forEach((e,i) => e.addEventListener("click", () => {
      stop(arr, current);
      play(arr, i, list);
      musicSetSettings(arr, i, true);
      current = i;
    }));
  }
// functions for music time
  function musicPreviousSetup(arr, index){
    arr[index].addEventListener("loadedmetadata", () => {
      musicSetSettings(arr, index, true);
    });
      timeLine.value = 0;
      displayMusicInfo[1].textContent = 44;
  }

  function musicSetSettings(arr, index, bool){
    if(bool){
      timeLine.max = arr[index].duration;
      playlistAllTime[0].textContent = countMusicTime(arr[index].duration);
      displayMusicInfo[0].textContent = Math.floor(arrMusicSize[index]*8/arr[index].duration/1000);
    }
    musicBar.textContent = `${index+1}. ${arr[index].textContent} (${countMusicTime(arr[index].duration)})`;
  }

  function timeLineHandler(){
    timeLine.value = this.currentTime;
  }

  function displayTimer(){
    displayTime.forEach(e => {
      e.textContent = countMusicTime(this.currentTime);
    });
  }

  timeLine.addEventListener("input", () => {
    if(listOfSongs.length > 0){
      listOfSongs[current].removeEventListener("timeupdate", timeLineHandler, false);
      musicBar.classList.remove("musicBarScroll");
      musicBar.textContent = `SEEK TO: ${countMusicTime(timeLine.value)}/${countMusicTime(listOfSongs[current].duration)}
      ${Math.round(+timeLine.value/listOfSongs[current].duration * 100)}%`;
    }
  });

  timeLine.addEventListener("change", () => {
    if(listOfSongs.length > 0){
      listOfSongs[current].currentTime = timeLine.value;
      listOfSongs[current].addEventListener("timeupdate", timeLineHandler, false);
      musicSetSettings(listOfSongs, current, false);
    }
  });

  // music volume
  function balanceOutput(panner){
    panner.pan.value = balanceSlider.value;
  }

  function volumeGain(gain){
   gain.gain.value = volume.value/100 ;
  }

  balanceSlider.addEventListener("input", () => {
    let side = balanceSlider.value < 0 ? `${-balanceSlider.value *100 }% LEFT`:
               balanceSlider.value > 0 ? `${balanceSlider.value *100 }% RIGHT`: "CENTER";
    musicBar.classList.remove("musicBarScroll");
    musicBar.textContent = `Balance: ${side}`;
    return balanceOutput(pannerNode);
    }
  );
  balanceSlider.addEventListener("mouseup", () => {
    musicBar.classList.add("musicBarScroll");
    if(listOfSongs.length > 0){
      musicSetSettings(listOfSongs, current, false);
    }else {
      musicBar.textContent = "";
    }
  });

  volume.addEventListener("input", () => {
    musicBar.classList.remove("musicBarScroll");
    musicBar.textContent = `VOLUME: ${+volume.value + 100}%`;
    return volumeGain(gainNode);
  });

  volume.addEventListener("mouseup", () => {
    musicBar.classList.add("musicBarScroll");
    if(listOfSongs.length > 0){
      musicSetSettings(listOfSongs, current, false);
    }else {
      musicBar.textContent = "";
    }
  });

  function checkQuality(){
    if(pannerNode.channelCount > 1 ){
      musicQuality[1].classList.add("activeQuality");
    } else {
      musicQuality[0].classList.add("activeQuality");
    }

  }
  // functions for buttons of  music control
  function stateHandlerVisual(currentState){
    for(let key in state){
      playerState.classList.remove(state[key]);
      console.log(state[key])
    }
    playerState.classList.add(currentState);
    console.log(currentState)
  }

  function play(arr, index, list){
    if(arr.length > 0){
      balanceOutput(pannerNode, arr[index]);
      musicPreviousSetup(arr, index);
      showSong(list, index);
      volumeGain(gainNode);

      listOfSource.get(arr[index]).connect(context.destination);
      listOfSource.get(arr[index]).connect(gainNode);
      listOfSource.get(arr[index]).connect(pannerNode);
      stateHandlerVisual(state.play);
      timer ? clearTimeout(timer) : false;
      checkQuality();
      arr[index].play();
    }
  }

  function pause(arr,index){
    if(arr.length > 0){
       arr[index].pause();
       stateHandlerVisual(state.pause);
       let value = displayTime[0].textContent;
       timer = setInterval(() => {
            displayTime.forEach(e => {
              e.textContent = `  :  `;
            });
        setTimeout(() => {
             displayTime.forEach(e => {
               e.textContent = value;
             });
       } , 1000);
     },2000);
    }
  }

  function stop(arr, index){
    if(arr.length > 0){
      arr[index].pause();
      arr[index].currentTime = 0;
      timeLineHandler(0);
      stateHandlerVisual(state.stop);
      timer ? clearTimeout(timer) : false;
      musicQuality.forEach(e => e.classList.remove("activeQuality"));
    }
  }

  function nextSong(arr, index, list){
    if(arr.length > 0 && index != arr.length - 1){
      stop(arr, index);
      ++index;
      play(arr, index, list);
      showSong(list, index);
    } else if(arr.length - 1 == index){
        stop(arr, index);
        index = 0;
        play(arr, index, list);
        showSong(list, index);
      }
      current = index;
    musicSetSettings(arr, index, true);
  }

  function prevSong(arr, index, list){
    if(arr.length > 0){
      stop(arr, index);
      index == 0 ? current = arr.length - 1 : index--;
      play(arr, index, list);
      showSong(list, index);
    }
    current = index;
    musicSetSettings(arr, index, true);
  }

  function onEnd(arr, i, list){
    if(arr.length != i){
      play(arr, i, list);
      current = i;
      musicSetSettings(arr, i, true);
    } else {
      play(arr, 0, list);
    }
  }
  function clearPlaylist(arr, index, list){
    console.log(arr , index);
    if(arr.length > 0 ){
      arr[index].pause();
      list.childNodes.forEach(e => e.remove());
    }
    listOfSongs = [];
    current = 0;
  }

  // buttons handler
  btnsPlay.forEach( e => e.addEventListener("click", () => play(listOfSongs, current, playlistMusicList)));
  btnsPause.forEach( e => e.addEventListener("click", () => pause(listOfSongs, current, playlistMusicList)));
  btnsStop.forEach( e => e.addEventListener("click", () => stop(listOfSongs, current)));
  btnsPrev.forEach( e => e.addEventListener("click", () => prevSong(listOfSongs, current, playlistMusicList)));
  btnsNext.forEach( e => e.addEventListener("click", () => nextSong(listOfSongs, current, playlistMusicList)));
  btnAddFiles.forEach( e => e.addEventListener("click", () => addFiles.click()));

  addFiles.addEventListener("change", function(e){

    context.resume();
    clearPlaylist(listOfSongs, current, playlist);
    arrMusicSize= [];

    [].forEach.call(this.files, (e,i) => {
      let song = new Audio(this.files[i].name);
        song.preload = "metadata";
        song.textContent = this.files[i].name;
        song.type = this.files[i].type;
        song.src = URL.createObjectURL(this.files[i]);

        song.addEventListener("ended", () => onEnd(listOfSongs, i+1, playlistMusicList), false);
        song.addEventListener("timeupdate", timeLineHandler, false);
        song.addEventListener("timeupdate", displayTimer, false);

        arrMusicSize.push(this.files[i].size);
        listOfSongs.push(song);
        let source = context.createMediaElementSource(song);
        listOfSource.set(song, source);
    });

    fillPlaylist(listOfSongs);
    playlistMusicList = document.querySelectorAll(".playlist_item");
    playClickedSong(listOfSongs, current, playlistMusicList);
    play(listOfSongs, current, playlistMusicList);
  });
});
