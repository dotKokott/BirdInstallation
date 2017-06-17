module.exports = Feather;

var vec2 = require('gl-vec2');

function Feather(x, y, yOff, base, offset1, offset2) {
    this.rot = 0;
    this.pos = vec2.fromValues(x, y);
    this.yOff = yOff;
    this.b = base;
    this.o1 = offset1;
    this.o2 = offset2;
}

Feather.prototype.setRot = function(p, rot) {
    this.rot = p.radians(rot);
}

Feather.prototype.addRot = function(p, rot) {
    this.rot += p.radians(rot);
}

Feather.prototype.draw = function(p, fillColor, strokeColor) {
    // this.base = window.options.base;
    // this.offset1 = window.options.offset1;
    // this.offset2 = window.options.offset2;

    p.fill(fillColor);
    //p.noFill();
    p.stroke(strokeColor);
    p.push();
        p.translate(this.pos[0], this.pos[1]);
        p.rotate(this.rot);
        p.beginShape();
            p.curveVertex(84 ,  91 + this.yOff);
            p.curveVertex(68 + this.o1,  91 + this.b + this.yOff); //middle right
            p.curveVertex(68 + this.o1,  19 + this.b + this.yOff); //up right
            p.curveVertex(21,  17 + this.b + this.yOff); // up left
            p.curveVertex(24, 200 + this.yOff); //middle left
            p.curveVertex(54  + this.o1, 270 + this.o2 + this.yOff); //bottom right
            p.curveVertex(165, 100 + this.o2 + this.yOff);
        p.endShape();
    p.pop();
}
