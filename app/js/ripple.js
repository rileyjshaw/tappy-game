var DOM = require('./DOM.js');

var rippleSpeed = DOM.maxRadius / 40;
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
  DOM.ctx.clearRect(0, 0, DOM.width, DOM.height);

  batch.forEach(function (circle, i) {
    DOM.ctx.fillStyle = circle.color || 'rgba(255,255,255,' + Math.max((1 - circle.radius / DOM.maxRadius), 0.001) * 0.3 + ')';
    DOM.ctx.beginPath();
    DOM.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    DOM.ctx.closePath();
    DOM.ctx.fill();
  });

  // remove finished animations step:
  batch = batch.filter(function (circle) {
    if (circle.radius < DOM.maxRadius) return true;
    if (circle.color) DOM.canvas.style.backgroundColor = circle.color;
    return false;
  });

  if (batch.length) {
    requestAnimationFrame(tick);
  }
}

module.exports = ripple;
