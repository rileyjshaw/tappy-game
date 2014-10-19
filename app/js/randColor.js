// from Material Design, http://www.google.com/design/spec/style/color.html
var colors = [
  '#03a9f4',
  '#9c27b0',
  '#ff9800',
  '#ff5177'
];
var currentIndex = 0, length = colors.length;

module.exports = function () {
  var index;
  do index = Math.floor(Math.random() * length);
  while (index === currentIndex);
  currentIndex = index;

  return colors[index];
};
