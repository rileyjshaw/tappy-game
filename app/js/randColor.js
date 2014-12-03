// from Material Design, http://www.google.com/design/spec/style/color.html
var colors = [
  '#ff5177', // pink
  '#03a9f4', // blue
  '#9c27b0', // purple
  '#ff9800'  // orange
];
var currentIndex = 0, length = colors.length;

module.exports = function () {
  var index;
  do index = Math.floor(Math.random() * length);
  while (index === currentIndex);
  currentIndex = index;

  return colors[index];
};
