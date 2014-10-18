var currentIndex = 0;
var colors = [
  '#9c27b0',
  '#03a9f4',
  '#ff9800',
  '#ff5177'
];
var length = colors.length;

module.exports = function () {
  var index;
  do index = Math.floor(Math.random() * length);
  while (index === currentIndex);
  currentIndex = index;

  return colors[index];
};
