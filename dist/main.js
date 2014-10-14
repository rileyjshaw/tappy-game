(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var timer = require('./game.js');
var DOM = require('./DOM.js');

var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var canvas = require('./newHDCanvas.js')(windowWidth, windowHeight, DOM.overlay);

var maxRadius = Math.max(windowWidth, windowHeight);
var rippleSpeed = maxRadius / 40;
var ctx = canvas.getContext('2d');
var spacePressed = false;

var batch = [];

function tick () {
  // increment radius step:
  batch.forEach(function (circle) { circle.radius += rippleSpeed; });

  // drawing step:
  ctx.fillStyle = '#00baff';
  ctx.fillRect(0, 0, windowWidth, windowHeight);

  batch.forEach(function (circle) {
    ctx.fillStyle = 'rgba(255,255,255,' + (1 - circle.radius / maxRadius) * 0.8 + ')';
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  });

  // remove finished animations step:
  batch = batch.filter(function (circle) {
    return circle.radius < maxRadius;
  });

  if (batch.length) {
    requestAnimationFrame(tick);
  }
}

function handleMousedown (e) {
  timer();
  ripple(e);
}

function handleKeydown (e) {
  if (!spacePressed && e.keyCode === 32) {
    timer();
    ripple({
      x: windowWidth / 2,
      y: windowHeight / 2
    }, true);
    spacePressed = true;
  }
}

function ripple (e, keyboard) {
  var circle;
  if (keyboard) circle = e;
  else {
    e = e || window.event;
    circle = canvas.getCoords(e);
  }
  circle.radius = 0;
  if (batch.push(circle) === 1) requestAnimationFrame(tick);
}

canvas.addEventListener('mousedown', handleMousedown, false);
document.addEventListener('keydown', handleKeydown, false);
document.addEventListener('keyup', function (e) {
  e = e || window.event;
  if (e.keyCode === 32) spacePressed = false;
}, false);

},{"./DOM.js":2,"./game.js":3,"./newHDCanvas.js":5}],2:[function(require,module,exports){
module.exports = {
  overlay: document.getElementById('overlay'),
  dots: document.querySelector('.dots'),
  songTitle: document.querySelector('.instructions')
};

},{}],3:[function(require,module,exports){
var levels = shuffle(require('./levels.js'));
var DOM = require('./DOM.js');

var last, next, checkTimer, clicks, answer, answerLength;

function shuffle (array) {
  var counter = array.length, temp, index;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

function parseSong (song) {
  var i, answer = [];

  if (song.charAt(0) !== '-' || song.charAt(song.length - 1) !== '-') {
    throw song + ' is not a valid song! It needs to start and end with a dash.';
  }

  while (song.length) {
    i = song.indexOf('-') + 1;
    song = song.slice(i);
    answer.push(i);
  }

  return answer.slice(1);
}

function gameOver () {
  alert('You win!');
}

function nextLevel () {
  var level = levels.pop();
  if (level) {
    DOM.overlay.className = 'hidden';
    answer = parseSong(level.song);
    answerLength = answer.length;

    setTimeout(function () {
      var dots = DOM.dots;
      var currentLength = dots.children.length - 1;

      DOM.songTitle.textContent = level.title;

      while (currentLength++ < answerLength) dots.appendChild(document.createElement('li'));
      while (--currentLength > answerLength) dots.removeChild(dots.lastChild);

      DOM.overlay.className = '';
    }, 300);

  } else {
    gameOver();
  }
}

function check () {
  // calculate the beat
  var beat = clicks.map(function (click, i) {
    return click / answer[i];
  }).reduce(function (acc, ratio) {
    return acc + ratio;
  }) / answerLength;

  // calculate the standard deviation
  var error = clicks.reduce(function (acc, click, i) {
    // observed and expected values
    var obs = click / beat, exp = answer[i];

    return acc + Math.abs(obs - exp) / exp;
  }, 0) / answerLength;

  if (error < 0.1) nextLevel();
  reset();
}

function reset () {
  var marked = DOM.dots.children;
  for (var i = 0, _len = marked.length; i < _len; i++) marked[i].className = '';
  next = null;
  clicks = [];
}

function clickHandler () {
  var currentLength = 0;
  last = next;
  next = new Date().getTime();

  if (last) currentLength = clicks.push(next - last);

  DOM.dots.children[currentLength].className = 'marked';

  if (currentLength === answerLength) check();
}

reset();
nextLevel();

module.exports = clickHandler;

},{"./DOM.js":2,"./levels.js":4}],4:[function(require,module,exports){
module.exports = [
  {
    title: 'Shave and a haircut, two bits!',
    song: '-_---_-___-_-'
  }, {
    title: 'Oh, Canada!',
    song: '-___-__--'
  }, {
    title: 'Op, op, op, op, oppa Gagnam style',
    song: '-__-_-_-__-----'
  }, {
    title: '(Intro for kung-fu Fighting)',
    song: '-----_-_-_-_-'
  }, {
    title: 'Happy birthday',
    song: '-_--__-__-__-'
  }, {
    title: '...L, M, N, O, P! Q, R, S...',
    song: '-----___-_-_-'
  }, {
    title: 'Bye, bye, Mrs. American Pie',
    song: '-___-_------'
  }, {
    title: 'Hey pretty thing let me light your candle \'cause...',
    song: '-_---_---_----'
  }, {
    title: 'Oh, won\'t you take me home tonight',
    song: '-___________-_-_-_-_-_--'
  }, {
    title: 'When I was a young warthog',
    song: '-_-_---_-_-'
  }, {
    title: 'Every little thing she does is magic',
    song: '-----_--_-_-_-'
  }, {
    title: 'YYZ',
    song: '-_--_-_-_--_-_-_-_--'
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
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
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
      x: canvasX,
      y: canvasY
    };
  };

  var canvas = createHDCanvas();
  canvas.getCoords = relativeMouseCoords;

  if (insertAfter) insertAfter.parentNode.insertBefore(canvas, insertAfter.nextSibling);
  else document.body.appendChild(canvas);

  return canvas;
};

},{}]},{},[1]);
