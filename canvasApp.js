$(document).ready(function() {  
  //Check for canvas support
  function canvasSupport() {
    return Modernizr.canvas;
  }
  
  canvasApp();
  
  function canvasApp() {
    //Check for canvas support
    if (!canvasSupport()) {
      return;
    } else {
      var theCanvas = document.getElementById('canvasOne');
      var context = theCanvas.getContext("2d"); 
    }
    
    // Variables
    var numBalls=200;
    var maxSize=7;
    var minSize=3;
    var minSpeed=1;
    var maxSpeed=8;
    var balls=[];
    var tempBall;
    var tempX;
    var tempY;
    var tempSpeed;
    var tempAngle;
    var tempRadius;
    var tempRadians;
    var tempVelocityX;
    var tempVelocityY;
    var tempColour;
    
    // Find spots to place each ball so none start on top of each other
    for (var i = 0; i < numBalls; i += 1) {
      tempRadius = getRandomInt(minSize, maxSize);
      var placeOK = false;
      while (!placeOK) {
        tempX = tempRadius * 3 + (Math.floor(Math.random() * theCanvas.width) - tempRadius * 3);
        tempY = tempRadius * 3 + (Math.floor(Math.random() * theCanvas.height) - tempRadius * 3);
        tempSpeed = getRandomInt(minSpeed, maxSpeed);
        tempAngle = Math.floor(Math.random() * 360);
        tempRadians = tempAngle * Math.PI/180;
        tempVelocityX = Math.cos(tempRadians) * tempSpeed;
        tempVelocityY = Math.sin(tempRadians) * tempSpeed;
        tempColour=get_random_colour();
        
        tempBall = {
          x: tempX, 
          y: tempY, 
          nextX: tempX, 
          nextY: tempY, 
          radius: tempRadius, 
          speed: tempSpeed,
          angle: tempAngle,
          velocityX: tempVelocityX,
          velocityY: tempVelocityY,
          mass: tempRadius,
          colour: tempColour
        };
        placeOK = canStartHere(tempBall);
      }
      balls.push(tempBall);
    }
    
    // Drawing interval
    setInterval(drawScreen, 33);
    
    // Functions
    // Returns true if a ball can start at given location, otherwise returns false
    function canStartHere(ball) {
      var retVal = true;
      for (var i = 0; i < balls.length; i += 1) {
        if (hitTestCircle(ball, balls[i])) {
          retVal = false;
        }
      }
      return retVal;
    }
    
    // Circle collision test to see if two balls are touching
    // Uses nextX and nextY to test for collision before it occurs
    function hitTestCircle(ball1, ball2) {
      var retVal = false;
      var dx = ball1.nextX - ball2.nextX;
      var dy = ball1.nextY - ball2.nextY;
      var distance = (dx * dx + dy * dy);
      if (distance <= (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius) ) {
        retVal = true;
      }
      return retVal;
    }
    
    // Loops through all the balls in the balls array and updates the nextX and nextY properties
    // with current x and y velocities for each ball
    function update() {
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        ball.nextX = (ball.x += ball.velocityX);
        ball.nextY = (ball.y += ball.velocityY);
      }
    }
    
    // We track balls by their center, so we test for all collision by adding or subtracting
    // each ball's radius before testing for wall collision
    function testWalls() {
      var ball;
      var testBall;
      
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        
        if (ball.nextX + ball.radius > theCanvas.width) { // right wall
          ball.velocityX = ball.velocityX * (-1);
          ball.nextX = theCanvas.width - ball.radius;
          
        } else if (ball.nextX - ball.radius < 0) { // top wall
          ball.velocityX = ball.velocityX * (-1);
          ball.nextX = ball.radius;
          
        } else if (ball.nextY + ball.radius > theCanvas.height) { // bottom wall
          ball.velocityY = ball.velocityY * (-1);
          ball.nextY = theCanvas.height - ball.radius;
          
        } else if (ball.nextY - ball.radius < 0) { // left wall
          ball.velocityY = ball.velocityY * (-1);
          ball.nextY = ball.radius;
        }
      }
    }
    
    // Tests whether any balls have hit each other. 
    // Uses two next loops to iterate through the balls array and test each ball against every other ball.
    function collide() {
      var ball;
      var testBall;
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        for (var j = i + 1; j < balls.length; j += 1) {
          testBall = balls[j];
          if (hitTestCircle(ball, testBall)) {
            collideBalls(ball, testBall);
          }
        }
      }
    }
    
    // Updates properties of colliding balls so they appear to bounce off each other.
    // Uses nextX and nextY properties because we don't want to change where they are at the moment.
    function collideBalls(ball1, ball2) {
      var dx = ball1.nextX - ball2.nextX;
      var dy = ball1.nextY - ball2.nextY;
      var collisionAngle = Math.atan2(dy, dx);
      
      // Get velocities of each ball before collision
      var speed1 = Math.sqrt(ball1.velocityX * ball1.velocityX + ball1.velocityY * ball1.velocityY);
      var speed2 = Math.sqrt(ball2.velocityX * ball2.velocityX + ball2.velocityY * ball2.velocityY);
      
      // Get angles (in radians) for each ball, given current velocities
      var direction1 = Math.atan2(ball1.velocityY, ball1.velocityX);
      var direction2 = Math.atan2(ball2.velocityY, ball2.velocityX);
      
      // Rotate velocity vectors so we can plug into equation for conservation of momentum
      var rotatedVelocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
      var rotatedVelocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
      var rotatedVelocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
      var rotatedVelocityY2 = speed2 * Math.sin(direction2 - collisionAngle);
      
      // Update actual velocities using conservation of momentum
      /* Uses the following formulas:
           velocity1 = ((mass1 - mass2) * velocity1 + 2*mass2 * velocity2) / (mass1 + mass2)
           velocity2 = ((mass2 - mass1) * velocity2 + 2*mass1 * velocity1) / (mass1 + mass2)
      */
      var finalVelocityX1 = ((ball1.mass - ball2.mass) * rotatedVelocityX1 + (ball2.mass + ball2.mass) * rotatedVelocityX2) / (ball1.mass + ball2.mass);
      var finalVelocityX2 = ((ball1.mass + ball1.mass) * rotatedVelocityX1 + (ball2.mass - ball1.mass) * rotatedVelocityX2) / (ball1.mass + ball2.mass);
      
      // Y velocities remain constant
      var finalVelocityY1 = rotatedVelocityY1;
      var finalVelocityY2 = rotatedVelocityY2;
      
      // Rotate angles back again so the collision angle is preserved
      ball1.velocityX = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI/2) * finalVelocityY1;
      ball1.velocityY = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI/2) * finalVelocityY1;
      ball2.velocityX = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI/2) * finalVelocityY2;
      ball2.velocityY = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI/2) * finalVelocityY2;
      
      // Update nextX and nextY for both balls so we can use them in render() or another collision
      ball1.nextX += ball1.velocityX;
      ball1.nextY += ball1.velocityY;
      ball2.nextX += ball2.velocityX;
      ball2.nextY += ball2.velocityY;
    }
    
    // Draws and updates each ball
    function render() {
      var ball;
      
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        context.fillStyle = ball.colour;
        ball.x = ball.nextX;
        ball.y = ball.nextY;
        
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI *2, true);
        context.closePath();
        context.fill();
      }
    }
    
    // Draws/updates the screen
    function drawScreen() {
      // Reset canvas
      context.fillStyle = "#EEEEEE";
      context.fillRect(0, 0, theCanvas.width, theCanvas.height);
      
      // Outside border
      context.strokeStyle = "#000000";
      context.strokeRect(1, 1, theCanvas.width - 2, theCanvas.height - 2);
    
      update();
      testWalls();
      collide();
      render();
    }
    
    //returns a random integer between 2 given values.
    function getRandomInt(minVal, maxVal) {
     return Math.floor(Math.random() * (maxVal - minVal+1) + minVal);
    }
    
    //returns a random html colour
    function get_random_colour() {
      var letters = '0123456789ABCDEF'.split('');
      var colour = '#';
      for (var i = 0; i < 6; i++ ) {
        colour += letters[Math.round(Math.random() * 15)];
      }
      return colour;
    }
  }
  
});