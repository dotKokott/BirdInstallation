module.exports = Flock;

function Flock() {
    this.boids = [];
}

Flock.prototype.run = function() {
    //PERFORMANCE?
  for (var i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}
