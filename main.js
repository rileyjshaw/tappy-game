(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DOM = require('./DOM.js');
var ripple = require('./ripple.js');
var timer = require('./game.js');

var spacePressed = false;

function handleMousedown (e) {
  e = e || window.event;
  var coords = DOM.canvas.getCoords(e);
  timer();
  ripple(coords.x, coords.y);
}

function handleKeydown (e) {
  e = e || window.event;
  if (!spacePressed && e.keyCode === 32) {
    timer();
    ripple(DOM.windowWidth / 2, DOM.windowHeight / 2);
    spacePressed = true;
  }
}

function handleKeyup (e) {
  e = e || window.event;
  if (e.keyCode === 32) spacePressed = false;
}

DOM.canvas.addEventListener('mousedown', handleMousedown, false);
document.addEventListener('keydown', handleKeydown, false);
document.addEventListener('keyup', handleKeyup, false);

},{"./DOM.js":2,"./game.js":3,"./ripple.js":7}],2:[function(require,module,exports){
var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var overlay = document.getElementById('overlay');
var canvas = require('./newHDCanvas.js')(windowWidth, windowHeight, overlay);
var ctx = canvas.getContext('2d');

module.exports = {
  canvas: canvas,
  ctx: ctx,
  dots: document.querySelector('ul.dots'),
  overlay: overlay,
  songTitle: document.querySelector('.instructions'),
  windowHeight: windowHeight,
  windowWidth: windowWidth
};

},{"./newHDCanvas.js":5}],3:[function(require,module,exports){
var DOM = require('./DOM.js');
var levels = shuffle(require('./levels.js'));
var randColor = require('./randColor.js');
var ripple = require('./ripple.js');

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
    ripple(DOM.windowWidth / 2, DOM.windowHeight / 2, randColor());
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

  if (error < 0.16) nextLevel('Let\'s get started!');
  reset();
}

function reset () {
  var marked = DOM.dots.children;
  for (var i = 0, _len = marked.length; i < _len; i++) marked[i].className = '';
  next = null;
  clicks = [];
}

function clickHandler () {
  if (answerLength) {
    var currentLength = 0;
    last = next;
    next = new Date().getTime();

    if (last) currentLength = clicks.push(next - last);

    DOM.dots.children[currentLength].className = 'marked';

    if (currentLength === answerLength) check();
  } else nextLevel();
}

reset();
ripple(DOM.windowWidth / 2, DOM.windowHeight / 2, randColor());

module.exports = clickHandler;

},{"./DOM.js":2,"./levels.js":4,"./randColor.js":6,"./ripple.js":7}],4:[function(require,module,exports){
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
    title: 'Happy birthday to you',
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
  }, {
    title: 'Rudolph the red-nosed reindeer',
    song: '--_--_-_-_-'
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

},{}],6:[function(require,module,exports){
var currentIndex = 0;
var colors = [
  '#9c27b0',
  '#03a9f4',
  '#ff9800',
  '#ff5177'
];
var length = colors.length;

module.exports = function () {
  var index;
  do index = Math.floor(Math.random() * length);
  while (index === currentIndex);
  currentIndex = index;

  return colors[index];
};

},{}],7:[function(require,module,exports){
var DOM = require('./DOM.js');

var maxRadius = Math.max(DOM.windowWidth, DOM.windowHeight);
var rippleSpeed = maxRadius / 40;
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
  DOM.ctx.clearRect(0, 0, DOM.windowWidth, DOM.windowHeight);

  batch.forEach(function (circle) {
    DOM.ctx.fillStyle = circle.color || 'rgba(255,255,255,' + (1 - circle.radius / maxRadius) * 0.3 + ')';
    DOM.ctx.beginPath();
    DOM.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    DOM.ctx.closePath();
    DOM.ctx.fill();
  });

  // remove finished animations step:
  batch = batch.filter(function (circle) {
    if (circle.radius < maxRadius) return true;
    if (circle.color) DOM.canvas.style.backgroundColor = circle.color;
    return false;
  });

  if (batch.length) {
    requestAnimationFrame(tick);
  }
}

module.exports = ripple;

},{"./DOM.js":2}]},{},[1]);
