/*
  This is a small exercise in drawing rotating and moving squares with
  HTML5.

  author: Hanna Kumpula
*/

//Related to canvas size
let winH = window.innerHeight;
let winW = window.innerWidth;

//Constant values
const numSquares = 200;
const colorMatrix = [
  [190,30,34,.9],
  [190,83,18,.9],
  [199,186,55,.9],
  [96,103,65,.9]
];

//Universal properties for every square
let dx = 2;
let dy = 2;
let dang = 1;

//Create Canvas
const canvas = d3
  .select("body")
  .append("canvas")
  .attr("width", winW)
  .attr("height", winH - 100); //-100 is just for the <h1>


//Get context
const context = canvas.node().getContext("2d");

//React to window resizing
d3.select(window).on("resize", resize);

//Utilities
//Random integer between two values
//min and max included
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//Contruct color string from matrix
function constructColorFromIndex(index) {
  return  {r: colorMatrix[index][0],
    g: colorMatrix[index][1],
    b: colorMatrix[index][2],
    a: colorMatrix[index][3]};
}

function constructColorFromObject(colorObject) {
  return "rgba("+colorObject.r+","+colorObject.g+","+colorObject.b+","+colorObject.a+")";
}

//React to resized window
function resize() {
  winH = window.innerHeight;
  winW = window.innerWidth;

  canvas.attr("width", winW).attr("height", winH - 100); //-100 is just for the <h1>

  init();
}

/*
Rotating Square
  x     : middle point x-coordinate
  y     : middle point y-coordinate
  ang   : rotation angle of the square (degrees)
  side  : side length of the square
  color : color of the square
*/
function RotatingSquare(x, y, ang, side, color) {
  this.x = x;
  this.y = y;
  this.ang = ang;
  this.side = side;
  this.color = color;
  this.velocity = {
    x: dx,
    y: dy,
    rotation: dang
  };
  this.color = {
    r: color.r,
    g: color.g,
    b: color.b,
    a: color.a
  }
}

//Draw the square from the center point
RotatingSquare.prototype.draw = function() {
  //rotate
  //context.fillStyle = this.color;
  context.fillStyle = constructColorFromObject(this.color);
  //move origin
  context.translate(this.x, this.y);
  //rotate
  context.rotate((this.ang * Math.PI) / 180);
  //draw rect in the middle
  context.fillRect(-this.side / 2, -this.side / 2, this.side, this.side);
  //rotate back
  context.rotate((-this.ang * Math.PI) / 180);
  //move origin back
  context.translate(-this.x, -this.y);
};

//Update the rotating square's position
RotatingSquare.prototype.update = function() {

  //Reset angle around full circles
  if (this.ang > 360 && this.velocity.dang > 0) {
    this.ang = 0;
  } else if (this.ang < 0 && this.velocity.dang < 0) {
    this.ang = 360;
  }

  //Check window left&right
  //NOTE! Does not take into account if corner happens to cross the border
  if (this.x > canvas.node().width - this.side / 2 || this.x < this.side / 2) {
    this.velocity.x = -this.velocity.x;
    this.velocity.rotation = -this.velocity.rotation;
  }

  //Check window top&bottom
  //NOTE! Does not take into account if corner happens to cross the border
  if (this.y > canvas.node().height - this.side / 2 || this.y < this.side / 2) {
    this.velocity.y = -this.velocity.y;
    this.velocity.rotation = -this.velocity.rotation;
  }

  //Add velocity
  this.x += this.velocity.x;
  this.y += this.velocity.y;
  this.ang += this.velocity.rotation;


  //Everything set, draw the square  in the new position
  this.draw();
};

//Initialize
let rSquares;
function init() {
  rSquares = [];

  //Create the rotating squares
  for (let i = 0; i < numSquares; i++) {
    //Generate random values for the squares
    var sideLength = randomIntFromInterval(30, 100);
    var xPos = randomIntFromInterval(sideLength, canvas.node().width - sideLength);
    var yPos = randomIntFromInterval(sideLength, canvas.node().height - sideLength);
    var startAngle = randomIntFromInterval(0, 359);

    var colorIndex = randomIntFromInterval(0, colorMatrix.length - 1);

    rSquares.push(
      new RotatingSquare(xPos, yPos, startAngle, sideLength, constructColorFromIndex(colorIndex))
    );
  }
}


//This function makes things move
function animate() {
  window.requestAnimationFrame(animate);
  //Clear the whole window, not just canvas
  //context.clearRect(0, 0, winW, winH);
  context.fillStyle = "aliceblue"
  context.fillRect(0, 0, winW, winH);

  //Update rotating rSquares
  rSquares.forEach(rSquare => {
    rSquare.update();
  });

}


//Initialize
init();
//make things move
animate();
