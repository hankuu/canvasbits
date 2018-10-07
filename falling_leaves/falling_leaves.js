/*
  This is a small exercise in drawing rotating and moving squares with
  HTML5.

  author: Hanna Kumpula
*/


//Related to canvas size
let winH = window.innerHeight;
let winW = window.innerWidth;

//Constant values
const numSquares = 1;
const colorMatrix = [
  [190,30,34,.9],
  [190,83,18,.9],
  [199,186,55,.9],
  [96,103,65,.9]
];

//Universal properties for every square
let dang = 1;
let colorPulse = -1;
let lifeTime = 1000;

var h1_height = d3.select("h1").node().getBoundingClientRect().height;

//Create Canvas
const canvas = d3
  .select("body")
  .append("canvas")
  .attr("width", winW)
  .attr("height", winH - 2*h1_height); //take the twice the height of <h1> element out



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

  var h1_height = d3.select("h1").node().getBoundingClientRect().height;

  canvas.attr("width", winW)
    .attr("height", winH - 2*h1_height); //take the twice the height of <h1> element out

  //Initialize
  init();
}

/*
Rotating Square
  x     : middle point x-coordinate
  y     : middle point y-coordinate
  dx    : velocity in x-direction
  dy    : velocity in y-coordinate
  ang   : rotation angle of the square (degrees)
  side  : side length of the square
  color : color of the square
*/
function RotatingSquare(x, y, dx, dy, ang, side, color) {
  //All squares begin as falling
  this.falling = true;

  //position
  this.x = x;
  this.y = y;
  this.ang = ang;

  //sideLength
  this.side = side;

  //velocity attributes
  this.velocity = {
    x: dx,
    y: dy,
    rotation: dang
  };

  //lifetime when on ground
  //When this is 0, the size will be reduced and finally the square disappears
  //Begin to decrease when the square hits the ground
  this.lifeTime = lifeTime;

  //color changing value
  this.colorPulse = colorPulse;

  //current color
  this.currentColor = {
    r: color.r,
    g: color.g,
    b: color.b,
    a: color.a
  }
} //RotatingSquare

//Draw the square from the center point
RotatingSquare.prototype.draw = function() {
  //rotate
  context.fillStyle = constructColorFromObject(this.currentColor);
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
} //draw()

//Update the rotating square's position
RotatingSquare.prototype.update = function() {

  //Check window bottom. Leaves stay and turn to black
  //NOTE! Does not take into account if corner happens to cross the border
  if (this.y > canvas.node().height - this.side / 2) {
    this.falling = false;
  }

  if(this.falling){
    //Reset angle around full circles
    if (this.ang > 360 && this.velocity.dang > 0) {
      this.ang = 0;
    } else if (this.ang < 0 && this.velocity.dang < 0) {
      this.ang = 360;
    }

    //Check window left&right: bounce from sides
    //NOTE! Does not take into account if corner happens to cross the border
    if (this.x > canvas.node().width - this.side / 2 || this.x < this.side / 2) {
      this.velocity.x = -this.velocity.x;
      this.velocity.rotation = -this.velocity.rotation;
    }

    //Add velocity
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.ang += this.velocity.rotation;

  }else{
    //Square on ground and not falling
    //Color changes gradually to black
    //lifeTime counter begins to decrease
    //When lifeTime hits 0, the square begins to shrink and finally disappears

    // add colorPulse value to gradually change color to black
    if(this.colorPulse < 0 && this.currentColor.r >0){
      this.currentColor.r += this.colorPulse;
    }

    if(this.colorPulse < 0 && this.currentColor.g >0){
      this.currentColor.g += this.colorPulse;
    }

    if(this.colorPulse < 0 && this.currentColor.b >0){
      this.currentColor.b += this.colorPulse;
    }

    //reduce size
    var alive = (this.lifeTime > 0) ? true : false;
    if(alive){
      this.lifeTime--;
    }

    //Only begin to shrink the square when lifeTime counter is 0
    if(this.side>0 && this.lifeTime==0){
      this.side -= 0.25;

      //Keep square where it is respect to size
      //NOTE! This is only visible with low number of squares
      this.y = canvas.node().height - this.side / 2;
    }
    //Keep square where it is respect to size
    //NOTE! This is only visible with low number of squares
//    this.y = canvas.node().height - this.side / 2;
  }

  //Everything set, draw the square  in the new position
  this.draw();
} //update()

//Initialize
let rSquares;
let ticker = 0;
let newSquareRate = 50;
function init() {
  rSquares = [];

  //Create the rotating squares
  for (let i = 0; i < numSquares; i++) {
    //Generate random values for the squares
    var sideLength = randomIntFromInterval(30, 100);
    var xPos = randomIntFromInterval(sideLength, canvas.node().width - sideLength);
    var yPos = randomIntFromInterval(-20, -5);

    var dirX = randomIntFromInterval(-3,3);
    while(dirX==0){
      dirX = randomIntFromInterval(-3,3);
    }

    var dirY = randomIntFromInterval(1,3);

    var startAngle = randomIntFromInterval(0, 359);

    var colorIndex = randomIntFromInterval(0, colorMatrix.length - 1);

    rSquares.push(
      new RotatingSquare(xPos, yPos, dirX, dirY, startAngle, sideLength, constructColorFromIndex(colorIndex))
    );
  }
} //init()

//This function makes things move
function animate(timestamp) {

  //Clear the whole window, not just canvas
  //context.clearRect(0, 0, winW, winH);
  context.fillStyle = "aliceblue"
  context.fillRect(0, 0, winW, winH);

  //Update rotating rSquares
  rSquares.forEach((rSquare, index) => {
    rSquare.update();
    //Remove squares with no side length left
    if(rSquare.side==0){
      rSquares.splice(index,1);

    }
  });

  //increase ticker
  ticker++;

  //when ticker reaches a value divisible by newSquareRate, create new squares
  if(ticker % newSquareRate == 0){
    //Generate random number of squares
    var howManySquares = randomIntFromInterval(1,5);

    for(var i=0; i<howManySquares; i++){
      var sideLength = randomIntFromInterval(30, 100);
      var xPos = randomIntFromInterval(sideLength, canvas.node().width - sideLength);
      var yPos = randomIntFromInterval(-20, -5);

      var dirX = randomIntFromInterval(-3,3);
      while(dirX==0){
        dirX = randomIntFromInterval(-3,3);
      }

      var dirY = randomIntFromInterval(1, 3);

      var startAngle = randomIntFromInterval(0, 359);

      var colorIndex = randomIntFromInterval(0, colorMatrix.length - 1);

      rSquares.push(
        new RotatingSquare(xPos, yPos, dirX, dirY, startAngle, sideLength, constructColorFromIndex(colorIndex))
      );
    }

    //reset the interval for creating new leaves
    newSquareRate = randomIntFromInterval(25,100);
    //reset ticker
    ticker = 0;

  }

  window.requestAnimationFrame(animate);
} //animate()


//Initialize
init();
//make things move
//animate();
window.requestAnimationFrame(animate);
