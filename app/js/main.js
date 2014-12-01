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
    else if (keyCode === 8 || keyCode === 27 || keyCode === 46)
      handleAction(DOM.width / 2, DOM.height / 2, 'reset');
  }

  e.preventDefault();
  return false;
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

ripple(DOM.width / 2, DOM.height / 2, '#03a9f4');
