var DOM = require('./DOM.js');
var ripple = require('./ripple.js');
var timer = require('./game.js');

var spacePressed = false;
var resizer = null;

function handleAction (x, y, replay, skip) {
  var color = timer(replay, skip);
  ripple(x, y, color);
}

function handleSkip () {
  handleAction(DOM.width / 2, DOM.height / 2, false, true);
}

function handleReplay () {
  handleAction(DOM.width / 2, DOM.height / 2, true);
}

function handleMousedown (e) {
  e = e || window.event;
  var coords = DOM.canvas.getCoords(e);
  handleAction(coords.x, coords.y);
}

function handleKeydown (e) {
  e = e || window.event;
  if (!spacePressed && e.keyCode === 32) {
    handleAction(DOM.width / 2, DOM.height / 2);
    spacePressed = true;
  }
}

function handleKeyup (e) {
  e = e || window.event;
  if (e.keyCode === 32) spacePressed = false;
}

function handleResize () {
  clearTimeout(resizer);
  resizer = setTimeout(DOM.updateDimensions, 300);
}

DOM.skip.addEventListener('click', handleSkip, false);
DOM.replay.addEventListener('click', handleReplay, false);
DOM.canvas.addEventListener('mousedown', handleMousedown, false);
document.addEventListener('keydown', handleKeydown, false);
document.addEventListener('keyup', handleKeyup, false);
window.addEventListener('resize', handleResize, false);

ripple(DOM.width / 2, DOM.height / 2, '#03a9f4');
