module.exports = function (width, height, insertAfter) {
  // Creates a scaled-up canvas based on the device's
  // resolution, then displays it properly using styles
  function createHDCanvas (ratio) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // Creates a dummy canvas to test device's pixel ratio
    ratio = (function () {
      var ctx = document.createElement('canvas').getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
      return dpr / bsr;
    })();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    return canvas;
  }

  // Returns mouse coordinates that are
  // relative to the canvas, i.e. useful
  var relativeMouseCoords = function (event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = this;

    do {
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
      currentElement = currentElement.offsetParent;
    } while (currentElement);

    var canvasX = event.pageX - totalOffsetX;
    var canvasY = event.pageY - totalOffsetY;

    return {
      x: canvasX,
      y: canvasY
    };
  };

  var canvas = createHDCanvas();
  canvas.getCoords = relativeMouseCoords;

  if (insertAfter) insertAfter.parentNode.insertBefore(canvas, insertAfter.nextSibling);
  else document.body.appendChild(canvas);

  return canvas;
};
