var levels = shuffle(require('./levels.js'));
var DOM = require('./DOM.js');

var last, next, checkTimer, clicks, answer;

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
    DOM.songTitle.className = 'hidden';
    setTimeout(function () {
      DOM.songTitle.textContent = level.title;
      DOM.songTitle.className = '';
    }, 300);
    answer = parseSong(level.song);
  } else {
    gameOver();
  }
}

function check () {
  var length = clicks.length;

  if (length === answer.length) {

    // calculate the beat
    var beat = clicks.map(function (click, i) {
      return click / answer[i];
    }).reduce(function (acc, ratio) {
      return acc + ratio;
    }) / length;

    // calculate the standard deviation
    var error = clicks.reduce(function (acc, click, i) {
      // observed and expected values
      var obs = click / beat, exp = answer[i];

      return acc + Math.abs(obs - exp) / exp;
    }, 0) / length;

    if (error < 0.1) nextLevel();
  }

  reset();
}

function reset () {
  next = null;
  clicks = [];
}

function clickHandler () {
  clearTimeout(checkTimer);

  last = next;
  next = new Date().getTime();

  if (last) clicks.push(next - last);

  checkTimer = setTimeout(check, 1500);
}

reset();
nextLevel();

document.addEventListener('mousedown', clickHandler, false);

module.exports = clickHandler;
