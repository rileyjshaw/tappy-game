// from Material Design, http://www.google.com/design/spec/style/color.html
var colors = [
  '#ff5177', // pink
  '#03a9f4', // blue
  '#9c27b0', // purple
  '#ff9800'  // orange
];
var length = colors.length;
var cycle = length - 1;
var index = 0;

// loop around the array between 0 and 360 degrees, exclusive
module.exports = function randColor () {
  index = (index + 1 + Math.floor(Math.random() * cycle)) % length;
  return colors[index];
};
