var DOM = require('./DOM.js');
var levels = require('./levels.js');
var randColor = require('./randColor.js');

var last, next, checkTimer, clicks, answer, answerLength, gameOver, levelList;

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

function startGame (first) {
  gameOver = false;
  levelList = shuffle(levels);

  if (first) reset();
  else {
    DOM.overlay.className = 'hidden gameOver';
    setTimeout(nextLevel, 300);
  }
}

function endGame () {
  gameOver = true;
  DOM.overlay.className = 'hidden';
  setTimeout(function () {
    DOM.songTitle.textContent = 'You win!';
    DOM.overlay.className = 'gameOver';
  }, 300);
}

function nextLevel () {
  var level = levelList.pop();
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
    endGame();
  }
  return randColor();
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

  reset();
  if (error < 0.16) return nextLevel('Let\'s get started!');
}

function reset () {
  var marked = DOM.dots.children;
  for (var i = 0, _len = marked.length; i < _len; i++) marked[i].className = '';
  next = null;
  clicks = [];
}

function clickHandler (replay) {
  if (gameOver) {
    if (replay) startGame();
    return randColor();
  } else if (answerLength) {
    var currentLength = 0;
    last = next;
    next = new Date().getTime();

    if (last) currentLength = clicks.push(next - last);

    DOM.dots.children[currentLength].className = 'marked';

    if (currentLength === answerLength) return check();
  } else return nextLevel();
}

startGame(true);

module.exports = clickHandler;
