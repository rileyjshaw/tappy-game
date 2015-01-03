(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isMobile = require('ismobilejs').any;
var DOM = require('./DOM');
var ripple = require('./ripple');
var game = require('./game');

var keysPressed = {};
var spacePressed = false;
var resetPressed = false;
var resizer = null;

function handleAction (x, y, variant) {
  var color = game(variant);
  if (!isMobile || color) ripple(x, y, color);
}

function handleSkip () {
  handleAction(DOM.width / 2, DOM.height / 2, 'skip');
}

function handleReplay () {
  handleAction(DOM.width / 2, DOM.height / 2, 'replay');
}

function handleMousedown (e) {
  e = e || window.event;
  var coords = DOM.canvas.getCoords(e);
  handleAction(coords.x, coords.y);
}

function handleKeydown (e) {
  var keyCode;
  e = e || window.event;
  keyCode = e.keyCode;

  if (!keysPressed[keyCode]) {
    keysPressed[keyCode] = true;
    if (keyCode === 32) handleAction(DOM.width / 2, DOM.height / 2);
    else if (keyCode === 27 || keyCode === 46)
      handleAction(DOM.width / 2, DOM.height / 2, 'reset');
    else if (keyCode === 8) {
      // block backspace from leaving page
      handleAction(DOM.width / 2, DOM.height / 2, 'reset');
      e.preventDefault();
    }
  }
}

function handleKeyup (e) {
  var keyCode;
  e = e || window.event;
  keyCode = e.keyCode;

  if (keysPressed[keyCode]) keysPressed[keyCode] = false;
}

function handleResize () {
  clearTimeout(resizer);
  resizer = setTimeout(DOM.updateDimensions, 300);
}

DOM.skip.addEventListener('click', handleSkip, false);
DOM.replay.addEventListener('click', handleReplay, false);
DOM.canvas.addEventListener(isMobile ? 'touchstart' : 'mousedown', handleMousedown, false);
document.addEventListener('keydown', handleKeydown, false);
document.addEventListener('keyup', handleKeyup, false);
window.addEventListener('resize', handleResize, false);

ripple(DOM.width / 2, DOM.height / 2, '#ff5177');

},{"./DOM":2,"./game":3,"./ripple":7,"ismobilejs":10}],2:[function(require,module,exports){
function updateDimensions () {
  // update heights
  DOM.height = window.innerHeight * DOM.canvas.ratio;
  DOM.canvas.height = DOM.height;

  // update widths
  DOM.width = window.innerWidth * DOM.canvas.ratio;
  DOM.canvas.width = DOM.width;

  DOM.maxRadius = Math.sqrt(Math.pow(DOM.width, 2) + Math.pow(DOM.height, 2));
}

var DOM = {
  dots: document.querySelector('.dots'),
  overlay: document.getElementById('overlay'),
  replay: document.querySelector('.replay'),
  skip: document.getElementById('skip'),
  songTitle: document.querySelector('.instructions'),
  updateDimensions: updateDimensions
};

DOM.canvas = require('./newHDCanvas.js')(DOM.width, DOM.height, DOM.overlay);
DOM.ctx = DOM.canvas.getContext('2d');
DOM.updateDimensions();

module.exports = DOM;

},{"./newHDCanvas.js":5}],3:[function(require,module,exports){
var tappy = require('tappy');
var DOM = require('./DOM');
var levels = require('./levels');
var randColor = require('./randColor');
var sounds = require('./sounds');

// number of failures until Skip? appears
var skipThreshold = 1;
var rhythm, answer, answerLength, gameOver, levelList, fails, newGame;

// Fisher-Yates shuffle, adapted from lodash
function shuffle (array) {
  var index = -1, length = array.length, result = Array(length);

  array.forEach(function (value) {
    var rand = Math.floor(Math.random() * (++index + 1));
    result[index] = result[rand];
    result[rand] = value;
  });
  return result;
}

function parseSong (song, note, tempo) {
  var i, intervals = [];

  // default character
  if (typeof note !== 'string' || note.length !== 1) note = 'x';

  while ((i = song.indexOf(note) + 1)) {
    song = song.slice(i);
    intervals.push(i * (tempo ? tempo : 1));
  }

  return new tappy.Rhythm(intervals.slice(1));
}

function startGame (first) {
  gameOver = false;
  newGame = true;
  levelList = shuffle(levels);

  if (first) reset();
  else {
    DOM.overlay.className = 'hidden gameOver';
    setTimeout(nextLevel, 300);
  }
}

function endGame () {
  sounds.bell.play();
  gameOver = true;
  DOM.overlay.className = 'hidden';
  setTimeout(function () {
    DOM.songTitle.textContent = 'You win!';
    DOM.overlay.className = 'gameOver';
  }, 300);
}

function nextLevel () {
  var level = levelList.pop();

  reset();
  fails = 0;
  DOM.skip.className = 'hidden';

  if (level) {
    if (newGame) {
      sounds.bass.play();
      newGame = false;
    } else sounds.flutter.play();
    DOM.overlay.className = 'hidden';
    answer = parseSong(level.song);
    answerLength = answer.length;

    setTimeout(function () {
      var dots = DOM.dots;
      var currentLength = dots.children.length - 1;

      // using innnerHTML instead of textContent to preserve &nbsp;s
      DOM.songTitle.innerHTML = level.title;

      while (++currentLength < answerLength) dots.appendChild(document.createElement('li'));
      while (currentLength-- > answerLength) dots.removeChild(dots.lastChild);

      DOM.overlay.className = '';
    }, 300);
  } else {
    endGame();
  }

  return randColor();
}

function reset () {
  var marked = DOM.dots.children;
  for (var i = 0, _len = marked.length; i < _len; i++) marked[i].className = '';
  rhythm = new tappy.Rhythm();
}

function clickHandler (variant) {
  if (gameOver) {
    if (variant === 'replay') startGame();
    return randColor();
  } else if (!answerLength || variant === 'skip') {
    return nextLevel();
  } else if (variant === 'reset') {
    reset();
  } else {
    var currentLength = rhythm.tap().length;

    DOM.dots.children[currentLength - 1].className = 'marked';

    if (currentLength === answerLength) {
      if (tappy.compare(rhythm.done(), answer) > 0.80) {
        return nextLevel();
      } else {
        sounds.bitty.play();
        if (++fails === skipThreshold) {
          DOM.skip.className = '';
        }
        reset();
      }
    } else sounds.snap.play();
  }
}

startGame(true);

module.exports = clickHandler;

},{"./DOM":2,"./levels":4,"./randColor":6,"./sounds":8,"tappy":11}],4:[function(require,module,exports){
module.exports = [
  {
    title: 'Shave and a haircut, two&nbsp;bits!',
    song: 'x.xxx.x...x.x'
  }, {
    title: 'Oh,&nbsp;Canada!',
    song: 'x...x..xx'
  }, {
    title: 'Op, op, op, op, oppa&nbsp;Gagnam&nbsp;style',
    song: 'x..x.x.x..xxxxx'
  }, {
    title: '(Intro for kung-fu&nbsp;Fighting)',
    song: 'xxxxx.x.x.x.x'
  }, {
    title: 'Happy birthday to&nbsp;you',
    song: 'x.xx..x..x..x'
  }, {
    title: '...L, M, N, O, P! Q,&nbsp;R,&nbsp;S...',
    song: 'xxxxx...x.x.x'
  }, {
    title: 'Bye, bye, Miss American&nbsp;Pie',
    song: 'x...x.xxxxxx'
  }, {
    title: 'Hey pretty thing let me light your candle&nbsp;&rsquo;cause...',
    song: 'x.xxx.xxx.xxxx'
  }, {
    title: 'Oh, won&rsquo;t you take me home&nbsp;tonight',
    song: 'x...........x.x.x.x.x.xx'
  }, {
    title: 'When I was a young&nbsp;warthog',
    song: 'x.x.xxx.x.x'
  }, {
    title: 'Every little thing she does is&nbsp;magic',
    song: 'xxxxx.xx.x.x.x'
  }, {
    title: 'YYZ (instrumental, morse&nbsp;code)',
    song: 'x.xx.x.x.xx.x.x.x.xx'
  }, {
    title: 'Rudolph the red-nosed&nbsp;reindeer',
    song: 'xx.xx.x.x.x'
  }, {
    title: 'Sittin&rsquo; on the dock of the bay, wasting&nbsp;time',
    song: 'xxxxxxxx....x.xx'
  }, {
    title: 'What&rsquo;s love got to do, got to do with&nbsp;it?',
    song: 'x...x...x.xx....x.xx.xx'
  }, {
    title: 'Born and raised in South&nbsp;Detrooooooit',
    song: 'xxxxx.xx.x'
  }, {
    title: 'Dōmo arigatō, Mr.&nbsp;Roboto',
    song: 'xxxxx.xx.x.xx.x'
  }, {
    title: 'Anyway you want it, that&rsquo;s the way you need&nbsp;it',
    song: 'x.xxxx.xx.xxxx.x'
  }, {
    title: 'He&rsquo;s just a poor boy from a poor family, spare him his life from this&nbsp;monstrosity',
    song: 'x.xxx.x.xxx.xxx.x.xxx.xxx.xxx'
  }, {
    title: 'Sippin&rsquo; on gin and juice, laid&nbsp;back',
    song: 'xxx.x.x.x.....x...x'
  }, {
    title: 'Sign, sign, everywhere a&nbsp;sign',
    song: 'x...x...xxxxx'
  }, {
    title: 'It was all a dream, I used to read Word&nbsp;Up&nbsp;Magazine',
    song: 'xxx.xx...xxxx.xx.xxx'
  }, {
    title: 'Call on me, call on&nbsp;me',
    song: 'xxx........x.xx'
  }, {
    title: 'You actin&rsquo; kinda shady, ain&rsquo;t calling me&nbsp;baby',
    song: 'xxxxxx.x.xxxxx.x'
  }, {
    title: '&rsquo;Cause my body too bootylicious for ya&nbsp;babe',
    song: 'x.x.x.xx.x.xx.x.x.xx'
  }
];

},{}],5:[function(require,module,exports){
module.exports = function (width, height, insertAfter) {
  // Creates a scaled-up canvas based on the device's
  // resolution, then displays it properly using styles
  function createHDCanvas (ratio) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // Creates a dummy canvas to test device's pixel ratio
    ratio = (function () {
      var ctx = document.createElement('canvas').getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
      return dpr / bsr;
    })();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.ratio = ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    return canvas;
  }

  // Returns mouse coordinates that are
  // relative to the canvas, i.e. useful
  var relativeMouseCoords = function (event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = this;

    do {
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
      currentElement = currentElement.offsetParent;
    } while (currentElement);

    var canvasX = event.pageX - totalOffsetX;
    var canvasY = event.pageY - totalOffsetY;

    return {
      x: canvasX * this.ratio,
      y: canvasY * this.ratio
    };
  };

  var canvas = createHDCanvas();
  canvas.getCoords = relativeMouseCoords;

  if (insertAfter) insertAfter.parentNode.insertBefore(canvas, insertAfter.nextSibling);
  else document.body.appendChild(canvas);

  return canvas;
};

},{}],6:[function(require,module,exports){
// from Material Design, http://www.google.com/design/spec/style/color.html
var colors = [
  '#ff5177', // pink
  '#03a9f4', // blue
  '#9c27b0', // purple
  '#ff9800'  // orange
];
var currentIndex = 0, length = colors.length;

module.exports = function () {
  var index;
  do index = Math.floor(Math.random() * length);
  while (index === currentIndex);
  currentIndex = index;

  return colors[index];
};

},{}],7:[function(require,module,exports){
var DOM = require('./DOM');

var rippleSpeed = DOM.maxRadius / 40;
var batch = [];

function ripple (x, y, color) {
  var circle = {
    x: x,
    y: y,
    color: color,
    radius: 0
  };

  if (batch.push(circle) === 1) requestAnimationFrame(tick);
}

function tick () {
  // increment radius step:
  batch.forEach(function (circle) { circle.radius += rippleSpeed; });

  // drawing step:
  DOM.ctx.clearRect(0, 0, DOM.width, DOM.height);

  batch.forEach(function (circle, i) {
    DOM.ctx.fillStyle = circle.color || 'rgba(255,255,255,' + Math.max((1 - circle.radius / DOM.maxRadius), 0.001) * 0.3 + ')';
    DOM.ctx.beginPath();
    DOM.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    DOM.ctx.closePath();
    DOM.ctx.fill();
  });

  // remove finished animations step:
  batch = batch.filter(function (circle) {
    if (circle.radius < DOM.maxRadius) return true;
    if (circle.color) DOM.canvas.style.backgroundColor = circle.color;
    return false;
  });

  if (batch.length) {
    requestAnimationFrame(tick);
  }
}

module.exports = ripple;

},{"./DOM":2}],8:[function(require,module,exports){
var Howl = require('../../bower_components/howler/howler.min').Howl;
var names = ['bell', 'bass', 'snap', 'flutter', 'bitty'];
var extensions = ['mp3', 'ogg', 'wav'];
var sounds = {};

names.forEach(function (name) {
	var urls = extensions.map(function (ext) {
		return name + '.' + ext;
	});

	sounds[name] = new Howl({
		urls: urls
	});
});

module.exports = sounds;

},{"../../bower_components/howler/howler.min":9}],9:[function(require,module,exports){
/*!
 *  howler.js v1.1.25
 *  howlerjs.com
 *
 *  (c) 2013-2014, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
!function(){var e={},t=null,n=!0,r=!1;try{"undefined"!=typeof AudioContext?t=new AudioContext:"undefined"!=typeof webkitAudioContext?t=new webkitAudioContext:n=!1}catch(i){n=!1}if(!n)if("undefined"!=typeof Audio)try{new Audio}catch(i){r=!0}else r=!0;if(n){var s=void 0===t.createGain?t.createGainNode():t.createGain();s.gain.value=1,s.connect(t.destination)}var o=function(e){this._volume=1,this._muted=!1,this.usingWebAudio=n,this.ctx=t,this.noAudio=r,this._howls=[],this._codecs=e,this.iOSAutoEnable=!0};o.prototype={volume:function(e){var t=this;if(e=parseFloat(e),e>=0&&1>=e){t._volume=e,n&&(s.gain.value=e);for(var r in t._howls)if(t._howls.hasOwnProperty(r)&&t._howls[r]._webAudio===!1)for(var i=0;i<t._howls[r]._audioNode.length;i++)t._howls[r]._audioNode[i].volume=t._howls[r]._volume*t._volume;return t}return n?s.gain.value:t._volume},mute:function(){return this._setMuted(!0),this},unmute:function(){return this._setMuted(!1),this},_setMuted:function(e){var t=this;t._muted=e,n&&(s.gain.value=e?0:t._volume);for(var r in t._howls)if(t._howls.hasOwnProperty(r)&&t._howls[r]._webAudio===!1)for(var i=0;i<t._howls[r]._audioNode.length;i++)t._howls[r]._audioNode[i].muted=e},codecs:function(e){return this._codecs[e]},_enableiOSAudio:function(){var e=this;if(!t||!e._iOSEnabled&&/iPhone|iPad|iPod/i.test(navigator.userAgent)){e._iOSEnabled=!1;var n=function(){var r=t.createBuffer(1,1,22050),i=t.createBufferSource();i.buffer=r,i.connect(t.destination),void 0===i.start?i.noteOn(0):i.start(0),setTimeout(function(){(i.playbackState===i.PLAYING_STATE||i.playbackState===i.FINISHED_STATE)&&(e._iOSEnabled=!0,e.iOSAutoEnable=!1,window.removeEventListener("touchstart",n,!1))},0)};return window.addEventListener("touchstart",n,!1),e}}};var u=null,a={};r||(u=new Audio,a={mp3:!!u.canPlayType("audio/mpeg;").replace(/^no$/,""),opus:!!u.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),ogg:!!u.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),wav:!!u.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),aac:!!u.canPlayType("audio/aac;").replace(/^no$/,""),m4a:!!(u.canPlayType("audio/x-m4a;")||u.canPlayType("audio/m4a;")||u.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(u.canPlayType("audio/x-mp4;")||u.canPlayType("audio/mp4;")||u.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!u.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")});var f=new o(a),l=function(e){var r=this;r._autoplay=e.autoplay||!1,r._buffer=e.buffer||!1,r._duration=e.duration||0,r._format=e.format||null,r._loop=e.loop||!1,r._loaded=!1,r._sprite=e.sprite||{},r._src=e.src||"",r._pos3d=e.pos3d||[0,0,-.5],r._volume=void 0!==e.volume?e.volume:1,r._urls=e.urls||[],r._rate=e.rate||1,r._model=e.model||null,r._onload=[e.onload||function(){}],r._onloaderror=[e.onloaderror||function(){}],r._onend=[e.onend||function(){}],r._onpause=[e.onpause||function(){}],r._onplay=[e.onplay||function(){}],r._onendTimer=[],r._webAudio=n&&!r._buffer,r._audioNode=[],r._webAudio&&r._setupAudioNode(),void 0!==t&&t&&f.iOSAutoEnable&&f._enableiOSAudio(),f._howls.push(r),r.load()};if(l.prototype={load:function(){var e=this,t=null;if(r)return void e.on("loaderror");for(var n=0;n<e._urls.length;n++){var i,s;if(e._format)i=e._format;else{if(s=e._urls[n],i=/^data:audio\/([^;,]+);/i.exec(s),i||(i=/\.([^.]+)$/.exec(s.split("?",1)[0])),!i)return void e.on("loaderror");i=i[1].toLowerCase()}if(a[i]){t=e._urls[n];break}}if(!t)return void e.on("loaderror");if(e._src=t,e._webAudio)c(e,t);else{var u=new Audio;u.addEventListener("error",function(){u.error&&4===u.error.code&&(o.noAudio=!0),e.on("loaderror",{type:u.error?u.error.code:0})},!1),e._audioNode.push(u),u.src=t,u._pos=0,u.preload="auto",u.volume=f._muted?0:e._volume*f.volume();var l=function(){e._duration=Math.ceil(10*u.duration)/10,0===Object.getOwnPropertyNames(e._sprite).length&&(e._sprite={_default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e.on("load")),e._autoplay&&e.play(),u.removeEventListener("canplaythrough",l,!1)};u.addEventListener("canplaythrough",l,!1),u.load()}return e},urls:function(e){var t=this;return e?(t.stop(),t._urls="string"==typeof e?[e]:e,t._loaded=!1,t.load(),t):t._urls},play:function(e,n){var r=this;return"function"==typeof e&&(n=e),e&&"function"!=typeof e||(e="_default"),r._loaded?r._sprite[e]?(r._inactiveNode(function(i){i._sprite=e;var s=i._pos>0?i._pos:r._sprite[e][0]/1e3,o=0;r._webAudio?(o=r._sprite[e][1]/1e3-i._pos,i._pos>0&&(s=r._sprite[e][0]/1e3+s)):o=r._sprite[e][1]/1e3-(s-r._sprite[e][0]/1e3);var u,a=!(!r._loop&&!r._sprite[e][2]),l="string"==typeof n?n:Math.round(Date.now()*Math.random())+"";if(function(){var t={id:l,sprite:e,loop:a};u=setTimeout(function(){!r._webAudio&&a&&r.stop(t.id).play(e,t.id),r._webAudio&&!a&&(r._nodeById(t.id).paused=!0,r._nodeById(t.id)._pos=0,r._clearEndTimer(t.id)),r._webAudio||a||r.stop(t.id),r.on("end",l)},1e3*o),r._onendTimer.push({timer:u,id:t.id})}(),r._webAudio){var c=r._sprite[e][0]/1e3,h=r._sprite[e][1]/1e3;i.id=l,i.paused=!1,d(r,[a,c,h],l),r._playStart=t.currentTime,i.gain.value=r._volume,void 0===i.bufferSource.start?i.bufferSource.noteGrainOn(0,s,o):i.bufferSource.start(0,s,o)}else{if(4!==i.readyState&&(i.readyState||!navigator.isCocoonJS))return r._clearEndTimer(l),function(){var t=r,s=e,o=n,u=i,a=function(){t.play(s,o),u.removeEventListener("canplaythrough",a,!1)};u.addEventListener("canplaythrough",a,!1)}(),r;i.readyState=4,i.id=l,i.currentTime=s,i.muted=f._muted||i.muted,i.volume=r._volume*f.volume(),setTimeout(function(){i.play()},0)}return r.on("play"),"function"==typeof n&&n(l),r}),r):("function"==typeof n&&n(),r):(r.on("load",function(){r.play(e,n)}),r)},pause:function(e){var t=this;if(!t._loaded)return t.on("play",function(){t.pause(e)}),t;t._clearEndTimer(e);var n=e?t._nodeById(e):t._activeNode();if(n)if(n._pos=t.pos(null,e),t._webAudio){if(!n.bufferSource||n.paused)return t;n.paused=!0,void 0===n.bufferSource.stop?n.bufferSource.noteOff(0):n.bufferSource.stop(0)}else n.pause();return t.on("pause"),t},stop:function(e){var t=this;if(!t._loaded)return t.on("play",function(){t.stop(e)}),t;t._clearEndTimer(e);var n=e?t._nodeById(e):t._activeNode();if(n)if(n._pos=0,t._webAudio){if(!n.bufferSource||n.paused)return t;n.paused=!0,void 0===n.bufferSource.stop?n.bufferSource.noteOff(0):n.bufferSource.stop(0)}else isNaN(n.duration)||(n.pause(),n.currentTime=0);return t},mute:function(e){var t=this;if(!t._loaded)return t.on("play",function(){t.mute(e)}),t;var n=e?t._nodeById(e):t._activeNode();return n&&(t._webAudio?n.gain.value=0:n.muted=!0),t},unmute:function(e){var t=this;if(!t._loaded)return t.on("play",function(){t.unmute(e)}),t;var n=e?t._nodeById(e):t._activeNode();return n&&(t._webAudio?n.gain.value=t._volume:n.muted=!1),t},volume:function(e,t){var n=this;if(e=parseFloat(e),e>=0&&1>=e){if(n._volume=e,!n._loaded)return n.on("play",function(){n.volume(e,t)}),n;var r=t?n._nodeById(t):n._activeNode();return r&&(n._webAudio?r.gain.value=e:r.volume=e*f.volume()),n}return n._volume},loop:function(e){var t=this;return"boolean"==typeof e?(t._loop=e,t):t._loop},sprite:function(e){var t=this;return"object"==typeof e?(t._sprite=e,t):t._sprite},pos:function(e,n){var r=this;if(!r._loaded)return r.on("load",function(){r.pos(e)}),"number"==typeof e?r:r._pos||0;e=parseFloat(e);var i=n?r._nodeById(n):r._activeNode();if(i)return e>=0?(r.pause(n),i._pos=e,r.play(i._sprite,n),r):r._webAudio?i._pos+(t.currentTime-r._playStart):i.currentTime;if(e>=0)return r;for(var s=0;s<r._audioNode.length;s++)if(r._audioNode[s].paused&&4===r._audioNode[s].readyState)return r._webAudio?r._audioNode[s]._pos:r._audioNode[s].currentTime},pos3d:function(e,t,n,r){var i=this;if(t=void 0!==t&&t?t:0,n=void 0!==n&&n?n:-.5,!i._loaded)return i.on("play",function(){i.pos3d(e,t,n,r)}),i;if(!(e>=0||0>e))return i._pos3d;if(i._webAudio){var s=r?i._nodeById(r):i._activeNode();s&&(i._pos3d=[e,t,n],s.panner.setPosition(e,t,n),s.panner.panningModel=i._model||"HRTF")}return i},fade:function(e,t,n,r,i){var s=this,o=Math.abs(e-t),u=e>t?"down":"up",a=o/.01,f=n/a;if(!s._loaded)return s.on("load",function(){s.fade(e,t,n,r,i)}),s;s.volume(e,i);for(var l=1;a>=l;l++)!function(){var e=s._volume+("up"===u?.01:-.01)*l,n=Math.round(1e3*e)/1e3,o=t;setTimeout(function(){s.volume(n,i),n===o&&r&&r()},f*l)}()},fadeIn:function(e,t,n){return this.volume(0).play().fade(0,e,t,n)},fadeOut:function(e,t,n,r){var i=this;return i.fade(i._volume,e,t,function(){n&&n(),i.pause(r),i.on("end")},r)},_nodeById:function(e){for(var t=this,n=t._audioNode[0],r=0;r<t._audioNode.length;r++)if(t._audioNode[r].id===e){n=t._audioNode[r];break}return n},_activeNode:function(){for(var e=this,t=null,n=0;n<e._audioNode.length;n++)if(!e._audioNode[n].paused){t=e._audioNode[n];break}return e._drainPool(),t},_inactiveNode:function(e){for(var t=this,n=null,r=0;r<t._audioNode.length;r++)if(t._audioNode[r].paused&&4===t._audioNode[r].readyState){e(t._audioNode[r]),n=!0;break}if(t._drainPool(),!n){var i;if(t._webAudio)i=t._setupAudioNode(),e(i);else{t.load(),i=t._audioNode[t._audioNode.length-1];var s=navigator.isCocoonJS?"canplaythrough":"loadedmetadata",o=function(){i.removeEventListener(s,o,!1),e(i)};i.addEventListener(s,o,!1)}}},_drainPool:function(){var e,t=this,n=0;for(e=0;e<t._audioNode.length;e++)t._audioNode[e].paused&&n++;for(e=t._audioNode.length-1;e>=0&&!(5>=n);e--)t._audioNode[e].paused&&(t._webAudio&&t._audioNode[e].disconnect(0),n--,t._audioNode.splice(e,1))},_clearEndTimer:function(e){for(var t=this,n=0,r=0;r<t._onendTimer.length;r++)if(t._onendTimer[r].id===e){n=r;break}var i=t._onendTimer[n];i&&(clearTimeout(i.timer),t._onendTimer.splice(n,1))},_setupAudioNode:function(){var e=this,n=e._audioNode,r=e._audioNode.length;return n[r]=void 0===t.createGain?t.createGainNode():t.createGain(),n[r].gain.value=e._volume,n[r].paused=!0,n[r]._pos=0,n[r].readyState=4,n[r].connect(s),n[r].panner=t.createPanner(),n[r].panner.panningModel=e._model||"equalpower",n[r].panner.setPosition(e._pos3d[0],e._pos3d[1],e._pos3d[2]),n[r].panner.connect(n[r]),n[r]},on:function(e,t){var n=this,r=n["_on"+e];if("function"==typeof t)r.push(t);else for(var i=0;i<r.length;i++)t?r[i].call(n,t):r[i].call(n);return n},off:function(e,t){var n=this,r=n["_on"+e],i=t?""+t:null;if(i){for(var s=0;s<r.length;s++)if(i===""+r[s]){r.splice(s,1);break}}else n["_on"+e]=[];return n},unload:function(){for(var t=this,n=t._audioNode,r=0;r<t._audioNode.length;r++)n[r].paused||(t.stop(n[r].id),t.on("end",n[r].id)),t._webAudio?n[r].disconnect(0):n[r].src="";for(r=0;r<t._onendTimer.length;r++)clearTimeout(t._onendTimer[r].timer);var i=f._howls.indexOf(t);null!==i&&i>=0&&f._howls.splice(i,1),delete e[t._src],t=null}},n)var c=function(t,n){if(n in e)return t._duration=e[n].duration,void p(t);if(/^data:[^;]+;base64,/.test(n)){for(var r=atob(n.split(",")[1]),i=new Uint8Array(r.length),s=0;s<r.length;++s)i[s]=r.charCodeAt(s);h(i.buffer,t,n)}else{var o=new XMLHttpRequest;o.open("GET",n,!0),o.responseType="arraybuffer",o.onload=function(){h(o.response,t,n)},o.onerror=function(){t._webAudio&&(t._buffer=!0,t._webAudio=!1,t._audioNode=[],delete t._gainNode,delete e[n],t.load())};try{o.send()}catch(u){o.onerror()}}},h=function(n,r,i){t.decodeAudioData(n,function(t){t&&(e[i]=t,p(r,t))},function(){r.on("loaderror")})},p=function(e,t){e._duration=t?t.duration:e._duration,0===Object.getOwnPropertyNames(e._sprite).length&&(e._sprite={_default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e.on("load")),e._autoplay&&e.play()},d=function(n,r,i){var s=n._nodeById(i);s.bufferSource=t.createBufferSource(),s.bufferSource.buffer=e[n._src],s.bufferSource.connect(s.panner),s.bufferSource.loop=r[0],r[0]&&(s.bufferSource.loopStart=r[1],s.bufferSource.loopEnd=r[1]+r[2]),s.bufferSource.playbackRate.value=n._rate};"function"==typeof define&&define.amd&&define(function(){return{Howler:f,Howl:l}}),"undefined"!=typeof exports&&(exports.Howler=f,exports.Howl=l),"undefined"!=typeof window&&(window.Howler=f,window.Howl=l)}();
},{}],10:[function(require,module,exports){
/**
 * isMobile.js v0.3.5
 *
 * A simple library to detect Apple phones and tablets,
 * Android phones and tablets, other mobile devices (like blackberry, mini-opera and windows phone),
 * and any kind of seven inch device, via user agent sniffing.
 *
 * @author: Kai Mallea (kmallea@gmail.com)
 *
 * @license: http://creativecommons.org/publicdomain/zero/1.0/
 */
(function (global) {

    var apple_phone         = /iPhone/i,
        apple_ipod          = /iPod/i,
        apple_tablet        = /iPad/i,
        android_phone       = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
        android_tablet      = /Android/i,
        windows_phone       = /IEMobile/i,
        windows_tablet      = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
        other_blackberry    = /BlackBerry/i,
        other_blackberry_10 = /BB10/i,
        other_opera         = /Opera Mini/i,
        other_firefox       = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
        seven_inch = new RegExp(
            '(?:' +         // Non-capturing group

            'Nexus 7' +     // Nexus 7

            '|' +           // OR

            'BNTV250' +     // B&N Nook Tablet 7 inch

            '|' +           // OR

            'Kindle Fire' + // Kindle Fire

            '|' +           // OR

            'Silk' +        // Kindle Fire, Silk Accelerated

            '|' +           // OR

            'GT-P1000' +    // Galaxy Tab 7 inch

            ')',            // End non-capturing group

            'i');           // Case-insensitive matching

    var match = function(regex, userAgent) {
        return regex.test(userAgent);
    };

    var IsMobileClass = function(userAgent) {
        var ua = userAgent || navigator.userAgent;

        this.apple = {
            phone:  match(apple_phone, ua),
            ipod:   match(apple_ipod, ua),
            tablet: match(apple_tablet, ua),
            device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
        };
        this.android = {
            phone:  match(android_phone, ua),
            tablet: !match(android_phone, ua) && match(android_tablet, ua),
            device: match(android_phone, ua) || match(android_tablet, ua)
        };
        this.windows = {
            phone:  match(windows_phone, ua),
            tablet: match(windows_tablet, ua),
            device: match(windows_phone, ua) || match(windows_tablet, ua)
        };
        this.other = {
            blackberry:   match(other_blackberry, ua),
            blackberry10: match(other_blackberry_10, ua),
            opera:        match(other_opera, ua),
            firefox:      match(other_firefox, ua),
            device:       match(other_blackberry, ua) || match(other_blackberry_10, ua) || match(other_opera, ua) || match(other_firefox, ua)
        };
        this.seven_inch = match(seven_inch, ua);
        this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;
        // excludes 'other' devices and ipods, targeting touchscreen phones
        this.phone = this.apple.phone || this.android.phone || this.windows.phone;
        // excludes 7 inch devices, classifying as phone or tablet is left to the user
        this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

        if (typeof window === 'undefined') {
            return this;
        }
    };

    var instantiate = function() {
        var IM = new IsMobileClass();
        IM.Class = IsMobileClass;
        return IM;
    };

    if (typeof module != 'undefined' && module.exports && typeof window === 'undefined') {
        //node
        module.exports = IsMobileClass;
    } else if (typeof module != 'undefined' && module.exports && typeof window !== 'undefined') {
        //browserify
        module.exports = instantiate();
    } else if (typeof define === 'function' && define.amd) {
        //AMD
        define(global.isMobile = instantiate());
    } else {
        global.isMobile = instantiate();
    }

})(this);

},{}],11:[function(require,module,exports){
(function (global){
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.tappy=e()}}(function(){return function e(t,n,r){function o(u,a){if(!n[u]){if(!t[u]){var f="function"==typeof require&&require;if(!a&&f)return f(u,!0);if(i)return i(u,!0);var h=new Error("Cannot find module '"+u+"'");throw h.code="MODULE_NOT_FOUND",h}var s=n[u]={exports:{}};t[u][0].call(s.exports,function(e){var n=t[u][1][e];return o(n?n:e)},s,s.exports,e,t,n,r)}return n[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(e,t){function n(e,t){return e+t}function r(e,t,n){var r,o,i,u,a,f;if("number"==typeof e._tap||"number"==typeof t._tap)throw new Error("Can't compare Rhythms before calling done()");return o=e.length,o!==t.length?!1:(o--,e=e._taps,t=t._taps,n?(a=e,f=t):(i=e.reduce(function(e,t){return e+t}),u=t.reduce(function(e,t){return e+t}),i>u?(a=e,f=t):(a=t,f=e),r=a.map(function(e,t){var n=f[t];return n/e}).reduce(function(e,t){return e+t})/o,a=a.map(function(e){return e*r})),1-a.reduce(function(e,t,n){var r=f[n],o=Math.max(t,r),i=Math.min(t,r);return e+(o-i)/o},0)/o)}function o(){var e,t,r,o,u,a=Array.prototype.slice.call(arguments);if(a.some(function(e){return"number"==typeof e._tap}))throw new Error("Can't combine Rhythms before calling done()");if(u=a.reduce(function(e,t){return e+t._weight},0),e=a.shift(),r=e.length,a.some(function(e){return e.length!==r}))throw new Error("Can't combine Rhythms of different lengths");return t=e._weight,o=e._taps.map(function(e,n){return(e*t+a.reduce(function(e,t){return e+t._taps[n]*t._weight},0))/u}),Object.freeze(new i({length:r,duration:o.reduce(n),_taps:o,_weight:u}))}function i(e){if(null==e)this.length=0,this.duration=0,this._prevTap=0,this._curTap=0,this._taps=[],this._weight=1;else if(e.constructor===Array){if(!e.length)throw new Error("Rhythm array cannot be empty");if(e.some(function(e){return"number"!=typeof e||!e}))throw new Error("Rhythm array must only contain non-zero numbers");this.length=e.length+1,this.duration=e.reduce(n),this._taps=e,this._weight=1,Object.freeze(this)}else{if(!(e.hasOwnProperty("length")&&e.hasOwnProperty("_taps")&&e.hasOwnProperty("_weight")&&e.hasOwnProperty("duration")))throw new Error("Object passed to Rhythm is poorly formatted");this.length=e.length,this.duration=e.duration,this._taps=e._taps,this._weight=e._weight,Object.freeze(this)}}var u=e("right-now");i.prototype.tap=function(){var e,t,n=this._curTap;if("undefined"==typeof n)throw new Error("Can't call tap() after calling done()");return t=this._prevTap=n,n=this._curTap=u(),t&&(e=n-t||1,this._taps.push(e),this.duration+=e),this.length++,this},i.prototype.done=function(){if(this.length<2)throw new Error("Can't call done() with less than 2 taps");return delete this._curTap,delete this._prevTap,delete this._nextTap,Object.freeze(this),this},i.prototype.playback=function(e,t,n){function r(){var n,i=a.pop();e(o++),i?(n=u()-f-h,setTimeout(r,i-n),h+=i):"function"==typeof t&&t()}var o,i,a,f,h;if("number"==typeof this._curTap)throw new Error("Can't call playback() before calling done()");return o=h=0,i=this.length,a=this._taps.slice().reverse(),n&&(a=a.map(function(e){return e*n})),f=u(),r(),this},t.exports={compare:r,average:o,Rhythm:i}},{"right-now":2}],2:[function(e,t){(function(e){t.exports=e.performance&&e.performance.now?function(){return performance.now()}:Date.now||function(){return+new Date}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
