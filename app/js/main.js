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
};

canvas.addEventListener('mousedown', handleMousedown, false);
document.addEventListener('keydown', handleKeydown, false);
document.addEventListener('keyup', function (e) {
  e = e || window.event;
  if (e.keyCode === 32) spacePressed = false;
}, false);
