module.exports = Wing;

var vec2 = require('gl-vec2');

function Wing(x, y) {
    this.rot = 0;
    this.pos = vec2.fromValues(x, y);
    this.base = 20;
    this.offset1 = 10;
    this.offset2 = 20;
}

Wing.prototype.setRotation = function(p, rot) {
    this.rot = p.radians(rot);
}

Wing.prototype.addRotation = function(p, rot) {
    this.rot += p.radians(rot);
}

Wing.prototype.draw = function(p) {
    this.base = window.options.base;
    this.offset1 = window.options.offset1;
    this.offset2 = window.options.offset2;

    //p.fill(127);
    p.stroke(127);
    p.push();
        p.translate(this.pos[0], this.pos[1]);
        p.rotate(this.rot);
        p.beginShape();
            p.vertex(0, 0);
            p.vertex(0, this.base);
            p.vertex(this.offset1, this.base + this.offset1);
            p.vertex(0, this.base + this.offset1 + this.offset2);
            p.vertex(-this.offset1, this.base + this.offset1);
            p.vertex(0, this.base);
        p.endShape();
    p.pop();
}
