var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var overlay = document.getElementById('overlay');
var canvas = require('./newHDCanvas.js')(windowWidth, windowHeight, overlay);
var ctx = canvas.getContext('2d');

module.exports = {
  canvas: canvas,
  ctx: ctx,
  dots: document.querySelector('ul.dots'),
  overlay: overlay,
  songTitle: document.querySelector('.instructions'),
  windowHeight: windowHeight,
  windowWidth: windowWidth
};
