module.exports = Boid;


// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added
var p;
var id = 0;
function Boid(p5, x,y, playerID) {
    this.playerID = playerID;
    p = p5;

  this.acceleration = p.createVector(0,0);
  if(this.playerID) {
      this.velocity = p.createVector(1, 0);
  } else {
      this.velocity = p.createVector(p.random(-1,1),p.random(-1,1));
  }

  this.position = p.createVector(x,y);
  this.r = 4.0;

  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force

  this.controlled = false;

  this.ghostFill = p.color(255, 255, 255, 255);
  this.ghostStroke = p.color(255, 255, 255, 255);

  this.s_i = Math.floor(p.random(0, 512));
  id++;
}

Boid.prototype.isControl = function() {
    return this.playerID && window.players[this.playerID].online;
}

Boid.prototype.run = function(boids) {
    if(!this.controlled) {
        this.flock(boids);
    } else {
        this.control();
    }

  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

Boid.prototype.control = function() {
    var rotation = window.players[this.playerID].rotation;

    rotation = rotation - p.radians(90);
    //rotation += this.velocity.heading();
    var rotVec = p.createVector(Math.cos(rotation), Math.sin(rotation));
    //rotVec.mult(30);
    var conTarget = p5.Vector.add(this.position, rotVec);

    // p.fill(p.color(255, 0, 0));
    // p.ellipse(conTarget.x, conTarget.y, 5, 5);

    var seekForce = this.seek(conTarget);
    this.applyForce(seekForce);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids);   // Separation
  var ali = this.align(boids);      // Alignment
  var coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
    this.controlled = this.isControl();
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  var max = this.maxspeed;
  if(this.controlled) max *=2;
  this.velocity.limit(max);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired,this.velocity);
  var maxForce = this.maxforce;
  if(this.controlled) maxForce *= 4;
  steer.limit(maxForce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  var r = this.r;

  var alpha = 1;
  if(opt.flash_boids) {
    alpha = window.boid_alpha;
  }

  var theta = this.velocity.heading() + p.radians(90);
  var hue = window.h + 180;
  if(hue > 360) hue -= 360;

  p.strokeWeight(2);
  p.stroke(hue, 100, 95 - opt.light, alpha);
  if(!this.controlled) {
        p.fill(360, 100, 100, alpha);
  } else {
      var col = window.players[this.playerID].color;
      p.strokeWeight(2);

      p.fill(col, 100, 50, 1);

      r *= 2;
  }

  var rScale = 1;
  if(opt.flap_boid_wings) {
        rScale = p.map(window.spec[this.s_i] / 2, 0, 255, 1, opt.flap_boid_wings_max);
  }


  p.push();
  p.translate(this.position.x,this.position.y);
  p.rotate(theta);
  p.beginShape();
  p.vertex(0, -r*4);
  p.vertex(-r * rScale, r);
  p.vertex(r * rScale, r);
  p.endShape(p.CLOSE);
  p.pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = p.width +this.r;
  if (this.position.y < -this.r)  this.position.y = p.height+this.r;
  if (this.position.x > p.width +this.r) this.position.x = -this.r;
  if (this.position.y > p.height+this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 25.0;
  var steer = p.createVector(0,0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = window.p5.Vector.dist(this.position,boids[i].position);
    var isControl = boids[i].controlled;
    if(isControl) desiredseparation *= 3;
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position,boids[i].position);
      diff.normalize();
      var b = boids[i];

      diff.div(d);

      if(isControl) {
          diff.mult(opt.avoid_player_force);
      }

      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 50;
  var sum = p.createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return p.createVector(0,0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 50;
  var sum = p.createVector(0,0);   // Start with empty vector to accumulate all locations
  var count = 0;

  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;

      if(count < opt.draw_neighbour_max - p.map(window.spec[opt.neighbour_channel], 0, 255, 0, opt.draw_neighbour_max)) {
          p.strokeWeight(1);
          p.line(this.position.x, this.position.y, boids[i].position.x, boids[i].position.y);
      }
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return p.createVector(0,0);
  }
}
