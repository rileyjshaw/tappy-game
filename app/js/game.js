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
