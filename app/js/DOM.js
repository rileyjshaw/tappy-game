function updateDimensions () {
  // update heights
  DOM.height = window.innerHeight * DOM.canvas.ratio;
  DOM.canvas.height = DOM.height;

  // update widths
  DOM.width = window.innerWidth * DOM.canvas.ratio;
  DOM.canvas.width = DOM.width;

  DOM.maxRadius = Math.sqrt(Math.pow(DOM.width, 2) + Math.pow(DOM.height, 2));
}

var DOM = {
  dots: document.querySelector('.dots'),
  overlay: document.getElementById('overlay'),
  replay: document.querySelector('.replay'),
  songTitle: document.querySelector('.instructions'),
  updateDimensions: updateDimensions
};

DOM.canvas = require('./newHDCanvas.js')(DOM.width, DOM.height, DOM.overlay);
DOM.ctx = DOM.canvas.getContext('2d');
DOM.updateDimensions();

module.exports = DOM;
