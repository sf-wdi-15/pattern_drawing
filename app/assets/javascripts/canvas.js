
var curColor = {
      r: 25,
      g: 25,
      b: 25
    }
var paintBucketApp = (function () {

  "use strict";

  var context,
    canvasWidth = 800,
    canvasHeight = 516,

    
    outlineImage = new Image(),
    swatchImage = new Image(),
    backgroundImage = new Image(),
    swatchStartX = 50,
    swatchStartY = 19,
    swatchImageWidth = 93,
    swatchImageHeight = 46,
    drawingAreaX = 0,
    drawingAreaY = 0,
    drawingAreaWidth = 800,
    drawingAreaHeight = 515,
    colorLayerData,
    outlineLayerData,
    totalLoadResources = 3,
    curLoadResNum = 0,

    // Clears the canvas.
    // clearCanvas = function () 

  
    drawColorSwatch = function (color, x, y) {

      context.beginPath();
      context.arc(x + 46, y + 23, 18, 0, Math.PI * 2, true);
      context.closePath();
      context.fillStyle = "white";
      context.fill();

      if (curColor === color) {
        context.drawImage(swatchImage, 0, 0, 59, swatchImageHeight, x, y, 59, swatchImageHeight);
      } else {
        context.drawImage(swatchImage, x, y, swatchImageWidth, swatchImageHeight);
      }
    },

   
    redraw = function () {

      var locX,
        locY;

      
      if (curLoadResNum < totalLoadResources) {
        return;
      }
      context.putImageData(colorLayerData, 0, 0);

      //background
      context.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
      context.drawImage(outlineImage, drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
    },

    matchOutlineColor = function (r, g, b, a) {
      return (r + g + b < 100 && a === 255);
    },

    matchStartColor = function (pixelPos, startR, startG, startB) {
      var r = outlineLayerData.data[pixelPos],
          g = outlineLayerData.data[pixelPos + 1],
          b = outlineLayerData.data[pixelPos + 2],
          a = outlineLayerData.data[pixelPos + 3];
        if (matchOutlineColor(r, g, b, a)) {
          return false;
        }

        r = colorLayerData.data[pixelPos];
        g = colorLayerData.data[pixelPos + 1];
        b = colorLayerData.data[pixelPos + 2];

      
        if (r === startR && g === startG && b === startB) {
          return true;
        }

    
        if (r === curColor.r && g === curColor.g && b === curColor.b) {
          return false;
        }

        return true;
      },

    colorPixel = function (pixelPos, r, g, b, a) {

      colorLayerData.data[pixelPos] = r;
      colorLayerData.data[pixelPos + 1] = g;
      colorLayerData.data[pixelPos + 2] = b;
      colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;
    },

    floodFill = function (startX, startY, startR, startG, startB) {

      var newPos,
        x,
        y,
        pixelPos,
        reachLeft,
        reachRight,
        drawingBoundLeft = drawingAreaX,
        drawingBoundTop = drawingAreaY,
        drawingBoundRight = drawingAreaX + drawingAreaWidth - 1,
        drawingBoundBottom = drawingAreaY + drawingAreaHeight - 1,
        pixelStack = [[startX, startY]];

      while (pixelStack.length) {

        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        //pixel position
        pixelPos = (y * canvasWidth + x) * 4;

        // go up as long as in canveas
        while (y >= drawingBoundTop && matchStartColor(pixelPos, startR, startG, startB)) {
          y -= 1;
          pixelPos -= canvasWidth * 4;
        }

        pixelPos += canvasWidth * 4;
        y += 1;
        reachLeft = false;
        reachRight = false;

        // Go down as long as in canvas
        while (y <= drawingBoundBottom && matchStartColor(pixelPos, startR, startG, startB)) {
          y += 1;

          colorPixel(pixelPos, curColor.r, curColor.g, curColor.b);

          if (x > drawingBoundLeft) {
            if (matchStartColor(pixelPos - 4, startR, startG, startB)) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y]);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }

          if (x < drawingBoundRight) {
            if (matchStartColor(pixelPos + 4, startR, startG, startB)) {
              if (!reachRight) {
                pixelStack.push([x + 1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }
          pixelPos += canvasWidth * 4;
        }
      }
    },

    
    paintAt = function (startX, startY) {

      var pixelPos = (startY * canvasWidth + startX) * 4,
        r = colorLayerData.data[pixelPos],
        g = colorLayerData.data[pixelPos + 1],
        b = colorLayerData.data[pixelPos + 2],
        a = colorLayerData.data[pixelPos + 3];

      if (r === curColor.r && g === curColor.g && b === curColor.b) {
        return;
      }

      if (matchOutlineColor(r, g, b, a)) {
        return;
      }

      floodFill(startX, startY, r, g, b);

      redraw();
    },

  

    // Add mouse event to the canvas
    createMouseEvents = function () {

      $('#canvas').mousedown(function (e) {
        // Mouse down location
        var mouseX = e.pageX - this.offsetLeft,
          mouseY = e.pageY - this.offsetTop;

        if (mouseX < drawingAreaX) { // Left of the drawing area
          if (mouseX > swatchStartX) {
            if (mouseY > swatchStartY && mouseY < swatchStartY + swatchImageHeight) {
              curColor = colorPurple;
              redraw();
            }
          }
        } else if ((mouseY > drawingAreaY && mouseY < drawingAreaY + drawingAreaHeight) && (mouseX <= drawingAreaX + drawingAreaWidth)) {
          // Mouse click location on drawing area
          paintAt(mouseX, mouseY);
        }
      });
    },

    resourceLoaded = function () {

      curLoadResNum += 1;
      if (curLoadResNum === totalLoadResources) {
        createMouseEvents();
        redraw();
      }
    },

    // Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
    init = function () {
      console.log("working");
      
     
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', canvasWidth);
      canvas.setAttribute('height', canvasHeight);
      canvas.setAttribute('id', 'canvas');
      document.getElementById('canvasDiv').appendChild(canvas);

      if (typeof G_vmlCanvasManager !== "undefined") {
        canvas = G_vmlCanvasManager.initElement(canvas);
      }
      context = canvas.getContext("2d"); // Grab the 2d canvas context
      console.log("Context:", context);
     
      backgroundImage.onload = resourceLoaded;
      backgroundImage.src = "/assets/background02.png";

      swatchImage.onload = resourceLoaded;
      swatchImage.src = "/assets/paint-outline.png";

      outlineImage.onload = function () {
        context.drawImage(outlineImage, drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);

        
        try {
          outlineLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        } catch (ex) {
          window.alert("Application cannot be run locally. Please run on a server.");
          return;
        }
        
        colorLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        resourceLoaded();
      };
      outlineImage.src = "/assets/lattice11_border.png";
    };

  return {
    init: init
  };
}());

  setColor= function (value) {
    var color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    curColor.r = parseInt(color[1], 16);
    curColor.g = parseInt(color[2], 16);
    curColor.b = parseInt(color[3], 16);
    
    };


    $(document).ready(function () {
       paintBucketApp.init();

       $('#save').on('click', function(){
          var canvas = document.getElementById("canvas");
          var dataURL = canvas.toDataURL();
          console.log(dataURL);
          $.ajax({
          url: "/drawings.json",
          data: {
            drawing: dataURL
          },
          type: "POST",
          success: function(){
            window.location = '/drawings'
          }
        });
      });

    });


    