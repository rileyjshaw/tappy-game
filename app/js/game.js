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
