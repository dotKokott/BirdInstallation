var $ = require("jquery");
var p5 = require("p5");
window.p5 = p5;
var recordRTC = require('recordrtc');
var dat = require("dat-gui");
var vec2 = require('gl-vec2');

var ServerHandler = require('./server_handler.js');
window.handler = 0;
window.players = {};
var Flock = require('./flock.js');
var Boid = require('./boid.js');
var Feather = require('./feather.js');

const WIDTH = 1280;
const HEIGHT = 720;

var opt = function() {
    this.base = 20;
    this.offset1 = 2;
    this.offset2= -74;
    this.feathers= 30;
    this.f_off= 14;
    this.rot_change= 3.4;
    this.base_scale1= 3;
    this.offset_scale1= 0.1;
    this.base_scale2= 4.8;
    this.offset_scale2= 0;
    this.fillColor1 = "#3604f9";
    this.strokeColor1 = "#5d34ff";
    this.fillColor2 = "#752cfc";
    this.strokeColor2 = "#955cff";
    this.fillColor3 = "#a87afd";
    this.strokeColor3 = "#ccb1ff";
}

opt = new opt();

window.opt = opt;


var canvas = new p5(function(p) {
    var feathers = [];

    var now = Date.now();
    var then = Date.now();
    var INTERVAL_60 = 0.0166666; //60 fps

    p.setup = function() {
        window.handler = new ServerHandler(p);
        // var gui = new dat.GUI();
        //
        // gui.remember(opt);
        // gui.add(opt, 'base', 0, 100).step(1);
        // gui.add(opt, 'offset1', -100, 100).step(1);
        // gui.add(opt, 'offset2', -100, 100).step(1);
        // gui.add(opt, 'feathers', 0, 100).step(1);
        // gui.add(opt, 'f_off', 0, 40).step(1);
        // gui.add(opt, 'rot_change', 0, 10).step(0.1);
        // gui.add(opt, 'base_scale1', 0, 10).step(0.1);
        // gui.add(opt, 'offset_scale1', 0, 3).step(0.1);
        // gui.add(opt, 'base_scale2', 0, 20).step(0.1);
        // gui.add(opt, 'offset_scale2', 0, 3).step(0.1);
        // gui.addColor(opt, 'fillColor1');
        // gui.addColor(opt, 'strokeColor1');
        // gui.addColor(opt, 'fillColor2');
        // gui.addColor(opt, 'strokeColor2');
        // gui.addColor(opt, 'fillColor3');
        // gui.addColor(opt, 'strokeColor3');

        var c = p.createCanvas(WIDTH, HEIGHT);
        c.canvas.style.width = "100%";
        c.canvas.style.height = "100%";
        window.flock = new Flock();
        // Add an initial set of boids into the system
        for (var i = 0; i < 100; i++) {
          var b = new Boid(p, p.random(0, WIDTH), p.random(0, HEIGHT));
          window.flock.addBoid(b);
        }
    }


    p.addNewPlayerBoid = function(id) {
        var b = new Boid(p, WIDTH / 2, HEIGHT / 2, id);
        b.r *= 2;
        window.players[id].boid = b;
        window.flock.addBoid(b);
    }


    p.draw = function() {
        then = now;
        now = Date.now();

        p.background(p.color(0, 0, 0, 10));

        flock.run();

        // //FOR NOW!!!
        // var bs = opt.base_scale1;
        // var os = opt.offset_scale1;
        //
        // var bs2 = opt.base_scale2;
        // var os2 = opt.offset_scale2;
        //
        // var fillColor1 = p.color(opt.fillColor1);
        // var strokeColor1 = p.color(opt.strokeColor1);
        // var fillColor2 = p.color(opt.fillColor2);
        // var strokeColor2 = p.color(opt.strokeColor2);
        // var fillColor3 = p.color(opt.fillColor3);
        // var strokeColor3 = p.color(opt.strokeColor3);
        //
        // //var change = opt.rot_change + Math.cos(now * 0.001) * 0.3;
        // opt.feathers = 30;
        // opt.rot_change += 0.1;
        // var change = opt.rot_change;
        // opt.base = opt.base + Math.cos(now * 0.001) * 0.3;
        // for(var i = 0; i < opt.feathers; i++) {
        //     var f = new Feather(100 + i * opt.f_off, 200, opt.base * bs2, opt.base, opt.offset1 * os2, opt.offset2 * os2);
        //     //f.setRot(p, 10);
        //     f.addRot(p, -i * change);
        //
        //
        //     f.draw(p, fillColor3, strokeColor3);
        //
        //     //break;
        // }
        //
        //
        //
        // for(var i = 0; i < opt.feathers; i++) {
        //     var f_1 = new Feather(100 + i * opt.f_off, 200, opt.base * bs, opt.base, opt.offset1 * os, opt.offset2 * os);
        //     //f_1.setRot(p, 10);
        //     f_1.addRot(p, -i * change);
        //
        //     f_1.draw(p, fillColor2, strokeColor2);
        // }
        //
        // for(var i = 0; i < opt.feathers; i++) {
        //     var f = new Feather(100 + i * opt.f_off, 200, opt.base, opt.base, opt.offset1, opt.offset2);
        //     //f.setRot(p, 10);
        //     f.addRot(p, -i * change);
        //
        //     f.draw(p, fillColor1, strokeColor1);
        // }
    }
});






$( document ).ready(function() {
    //init();
});

$(document).keydown(function(e) {

});
