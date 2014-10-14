var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var maxRadius = Math.max(windowWidth, windowHeight);
var rippleSpeed = maxRadius / 40;
var canvas = createCanvasElement(windowWidth, windowHeight);
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

module.exports = function (e, keyboard) {
  var circle;
  if (keyboard) circle = e;
  else {
    e = e || window.event;
    circle = canvas.getCoords(e);
  }
  circle.radius = 0;
  if (batch.push(circle) === 1) requestAnimationFrame(tick);
};
