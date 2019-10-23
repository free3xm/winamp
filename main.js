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
        repeat = document.querySelector(".btnRepeat"),
        shuffle = document.querySelector(".btnShuffle"),
        btnEqualizerSwitch = document.querySelector(".btn_equalizer"),
        btnPressets = document.querySelector(".btn_pressets"),
        pressets = document.querySelector(".pressets"),
        playerState = document.querySelector(".fa"),
        freqSlider = document.querySelectorAll(".freq"),
        canvas = document.querySelector("#canvas"),
        ctx = canvas.getContext("2d"),
        canvasFreq = document.querySelector("#canvas_freq"),
        ctxFreq = canvasFreq.getContext("2d"),
        labelHandler = document.querySelector(".labelDB"),
        context = new (window.AudioContext || window.webkitAudioContext),
        pannerNode = context.createStereoPanner(),
        gainNode = context.createGain(),
        analyserNode = context.createAnalyser(),
        pressetsList = {
          "Classical" : [0, 0, 0, 0, 0,
                         0, -5.3, -5.3, -4.6, -6.6],
          "Club" : [0, 2, 3.4, 3.4, 3.4,
                    2, 0, 0, 0, 0],
          "Dance" : [5.4, 4, 0, 0, 0,
                     0, -4.6, -4.6, -4.6, 0],
          "Flat" : [0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0],
          "Full Bass" : [5.4, 5.4, 5.4, 3.4, 0,
                   -3.3, -6, -8, -6, 0],
          "Large Hall" : [6, 6, 3.4, 3.4, 0,
                          -3.3, -3.3, -3.3, 0, 0],
          "Live" : [-3.3, 0, 2, 2.7, 2.7,
                    2.7, 2, 2, 2, 0],
          "Party" : [4, 4, 0, 0, 0,
                     0, 0, 0, 4, 4],
          "Pop" : [-2, 2.7, 4, 4, 2,
                    0, 0, 0, 0, 0],
          "Reggae" : [0, 0, -4.6, 0, 2.7,
                    3.4, 3.4, 0, 0, 0],
          "Rock" : [3.4, 3.4, -4, -6, -3.3,
                    2, 5.4, 5.4, 5.4, 5.4],
          "Soft" : [2.7, 2, 0, 0, 0,
                    2, 4.7, 5.4, 5.4, 5.4],
          "Techno" : [4, 4, 0, -4, -3.3,
                    0, 4.7, 4.7, 4.7, 4.7],
        },
        state = {
          play: "fa-play",
          pause: "fa-pause",
          stop: "fa-stop"
        },
        arrOfHz =["60HZ", "170HZ", "310HZ", "600HZ", "1KHZ",
                  "3KHZ", "6KHZ", "12KHZ", "14KHZ", "16KHZ"];
let info = document.querySelector(".block-info");

  let playlistMusicList,
      playlistTime = {
        songTime: 0,
        listTime: 0
      },
      current = 0,
      timer,
      animFrame,
      repeatState = false,
      shuffleState = false,
      eqState = true,
      points = [{x:0,y:17.5},{x:20.9,y:17.5},{x:41.8,y:17.5},{x:62.7,y:17.5},{x:83.6,y:17.5},
             {x:104.5,y:17.5},{x:125.4,y:17.5},{x:146.3,y:17.5},{x:167.2,y:17.5},{x:188.1,y:17.5}],
      arrMusicSize = [],
      listOfSource = new WeakMap(),
      listOfSongs  = [];

      analyserNode.connect(gainNode);
      analyserNode.connect(pannerNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(context.destination);
      gainNode.connect(context.destination);
      analyserNode.connect(context.destination);

  timeLine.value = 0;
  playlistAllTime.forEach(e => e.textContent = "00:00");

  // repeat and shuffle fucntions

  repeat.addEventListener("click", () => {
    repeatState = !repeatState;
    repeat.classList.toggle("repeat_on");
  });
  shuffle.addEventListener("click", () => {
    shuffleState = !shuffleState;
    shuffle.classList.toggle("shuffle_on");
  });
  function shuffleMusic(max){
    return Math.floor(Math.random() *(max +1));
  }
  // pressets

  for(let key in pressetsList){
    let li  = document.createElement("li");
        li.textContent = key;
    pressets.appendChild(li);
  }
  document.body.addEventListener("click", event => {
    let item = event.target.textContent;
    if(pressetsList.hasOwnProperty(item)){
      pressetEq(pressetsList[item], true);
    }
    event.target == btnPressets ? false : pressets.classList.add("display_item");
  });
  pressets.addEventListener("click", event => {
    let item = event.target.textContent;
    if(pressetsList.hasOwnProperty(item)){

    }
  });
  btnPressets.addEventListener("click", () => {
    pressets.classList.toggle("display_item");
  });

  // canvas equalizer

  function canvasEq(pts, ctx){
    let gradient = ctx.createLinearGradient(0, 5, 0, 30);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'green');

   for (let i = 1; i < pts.length - 2; i++){
      let xc = (pts[i].x + pts[i + 1].x) / 2,
          yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }

    ctx.quadraticCurveTo(pts[pts.length-2].x, pts[pts.length-2].y, pts[pts.length-1].x,pts[pts.length-1].y);
    ctx.strokeStyle = gradient;
    ctx.stroke();
  }

  function ptsReassign(pts){
    pts.forEach((e, i) => {
      e.y = 17.5 - +freqSlider[i].value * 1.458;
        dynamicColors(freqSlider[i], 12, 6, +765,255);
    });
  }
  ptsReassign(points);
  canvasEq(points, ctx);

  //function frequency

  function createFilter(freq){
    let filter = context.createBiquadFilter();

    filter.type = "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1;
    filter.gain.value = 1;

    return filter;
  }

  function createFilters(){
    let frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
        filters = frequencies.map(createFilter);

    filters.reduce((prev, curr) => {
      prev.connect(curr);
      return curr;
    });

    return filters;
  }

  const filters = createFilters();
  filters[filters.length - 1].connect(gainNode);
  filters[filters.length - 1].connect(pannerNode);

  freqSlider.forEach((e,i) =>{
    e.addEventListener("input", () => {
      filters[i].gain.value = e.value;
      points[i].y = 17.5 -  +e.value * 1.458;
      canvasEq(points,ctx);
      dynamicColors(e, 12, 6, +765,255);
      musicBar.classList.remove("musicBarScroll");
      musicBar.textContent = `EQ: ${arrOfHz[i]} ${ e.value < 0 ? e.value : "+" + e.value } DB`;
    }, false);

    e.addEventListener("mouseup",returnPrevDisplay);
  });

  function pressetEq(db, bool){
    freqSlider.forEach(( e, i ) => {
      if(bool){
        e.value = db[i];
        filters[i].gain.value = db[i];
      } else {
         e.value = db;
         filters[i].gain.value = db;
        }
    });
    ptsReassign(points);
    canvasEq(points, ctx);
  }

  labelHandler.addEventListener("click", event => {
    if(event.target.tagName == "SPAN"){
      pressetEq(event.target.getAttribute("name"));
    }
  });
  btnEqualizerSwitch.addEventListener("click", () => {
    eqState = !eqState;
    btnEqualizerSwitch.classList.toggle("eq_off");
    if(eqState){
      listOfSource.get(listOfSongs[current]).connect(filters[0]);
    } else {
      listOfSource.get(listOfSongs[current]).disconnect(filters[0]);
    }
  });

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
    let firstNumber =  Math.floor(counter / 60),
        secondNumber =  Math.floor(counter % 60);
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

// function for dynamics color of input

function dynamicColors(inp, max, counter=0, colorCnt1 = 0, colorCnt2 =0){
  let num = 255/max*2,
      value = +inp.value + counter;
  if(value > max/2){
    inp.style.background = `rgb(255, ${-value * num +colorCnt1}, 0)`;
  } else{
      inp.style.background = `rgb(${value * num + colorCnt2}, 255, 0)`;
    }
}
function dynColorBalance(inp){
  let value = inp.value < 0 ? -inp.value : inp.value;
  if(inp.value == 0){
    inp.style.background = "green";
  } else {
    inp.style.background = `rgb(255, ${value * -255 +255 }, 0)`;
  }
}

// function music visualization

function musicVis(){
  analyserNode.fftSize = 128;
  let bufferLength = analyserNode.frequencyBinCount,
      dataArr = new Uint8Array(bufferLength),
      gradient = ctxFreq.createLinearGradient(0,34,0,135);
      gradient.addColorStop(0.2, 'red');
      gradient.addColorStop(0.8,'yellow');
      gradient.addColorStop(1, 'green');
      ctxFreq.clearRect(0,0, canvasFreq.width, canvasFreq.heigth);

  function draw(){
    ctxFreq.clearRect(0,0, canvasFreq.width, canvasFreq.height);
    analyserNode.getByteFrequencyData(dataArr);
    let barWidth = (canvasFreq.width / bufferLength ),
        barHeight,
        x = 0;
    for(let i = 0; i < bufferLength; i++){
      barHeight = dataArr[i]/1.1;
      ctxFreq.fillStyle =  gradient;
      ctxFreq.fillRect(x, canvasFreq.height - barHeight/2, barWidth, barHeight/2);
      x += barWidth + 3;
    }
  }
  animFrame = setInterval(draw, 30);
  draw();
}

// functions for music time and display

  function musicPreviousSetup(arr, index){
    arr[index].addEventListener("loadedmetadata", () => {
      musicSetSettings(arr, index, true);
    });
      timeLine.value = 0;
      displayMusicInfo[1].textContent = context.sampleRate/1000;
      returnPrevDisplay();
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

  function returnPrevDisplay(){
    musicBar.classList.add("musicBarScroll");
    if(listOfSongs.length > 0){
      musicSetSettings(listOfSongs, current, false);
    }else {
      musicBar.textContent = "";
    }
  }

  // music volume
  dynamicColors(volume,50,100, 510);
  dynColorBalance(balanceSlider);
  function balanceOutput(panner){
    panner.pan.value = balanceSlider.value;
  }

  function volumeGain(gain){
   gain.gain.value = volume.value/100 ;
  }

  function checkQuality(){
    if(pannerNode.channelCount > 1 ){
      musicQuality[1].classList.add("activeQuality");
    } else {
      musicQuality[0].classList.add("activeQuality");
    }
  }

  balanceSlider.addEventListener("input", () => {
    let side = balanceSlider.value < 0 ? `${-balanceSlider.value *100 }% LEFT`:
               balanceSlider.value > 0 ? `${balanceSlider.value *100 }% RIGHT`: "CENTER";
    musicBar.classList.remove("musicBarScroll");
    musicBar.textContent = `Balance: ${side}`;
    dynColorBalance(balanceSlider);
    balanceOutput(pannerNode);
    }
  );
  balanceSlider.addEventListener("mouseup", returnPrevDisplay);


  volume.addEventListener("input", () => {
    musicBar.classList.remove("musicBarScroll");
    musicBar.textContent = `VOLUME: ${+volume.value * 2 + 200}%`;
    dynamicColors(volume,50,100, 510);
    volumeGain(gainNode);
  });

  volume.addEventListener("mouseup", returnPrevDisplay);

  // functions for buttons of  music control

  function stateHandlerVisual(currentState){
    for(let key in state){
      playerState.classList.remove(state[key]);
    }
    playerState.classList.add(currentState);
  }

  function play(arr, index, list, bool){
    if(arr.length > 0){
      balanceOutput(pannerNode, arr[index]);
      musicPreviousSetup(arr, index);
      showSong(list, index);
      volumeGain(gainNode);
      stateHandlerVisual(state.play);
      filters.forEach((e,i) => e.gain.value = freqSlider[i].value);
      if(eqState){
        listOfSource.get(arr[index]).connect(filters[0]);
      }
      filters[filters.length -1].connect(context.destination);
      listOfSource.get(arr[index]).connect(context.destination);
      listOfSource.get(arr[index]).connect(gainNode);
      listOfSource.get(arr[index]).connect(pannerNode);
      listOfSource.get(arr[index]).connect(analyserNode);

      timer ? clearTimeout(timer) : false;
      animFrame ? clearTimeout(animFrame) : false;

      checkQuality();
      arr[index].play();
      musicVis();
    }
    console.log(current, index)
  }

  function pause(arr,index){
    if(arr.length > 0){
       arr[index].pause();
       stateHandlerVisual(state.pause);
       animFrame ? clearTimeout(animFrame) : false;
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
      animFrame ? clearTimeout(animFrame) : false;
      musicQuality.forEach(e => e.classList.remove("activeQuality"));
      ctxFreq.clearRect(0,0, canvasFreq.width, canvasFreq.height);
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

  function onEnd(arr, i, list, repeat, shuffle){
    if(arr.length != i){
      if(shuffle) i = shuffleMusic(arr.length);
      current = i;
      play(arr, i, list);
      musicSetSettings(arr, i, true);
    } else if(repeat){
      current = 0;
      play(arr, 0, list);
    }else{
      stop(arr, i - 1);
     }
  }

  function clearPlaylist(arr, index, list){
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

        song.addEventListener("ended", () => onEnd(listOfSongs, i+1, playlistMusicList, repeatState, shuffleState), false);
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
