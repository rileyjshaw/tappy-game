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
