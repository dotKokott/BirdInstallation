var $ = require("jquery");
var p5 = require("p5");
var sound = require("p5/lib/addons/p5.sound");
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
var so = require('./sound_opts.js');

const WIDTH = 1280;
const HEIGHT = 720;

window.level = 0;

// var opt = function() {
//     this.base = 20;
//     this.offset1 = 2;
//     this.offset2= -74;
//     this.feathers= 30;
//     this.f_off= 14;
//     this.rot_change= 3.4;
//     this.base_scale1= 3;
//     this.offset_scale1= 0.1;
//     this.base_scale2= 4.8;
//     this.offset_scale2= 0;
//     this.fillColor1 = "#3604f9";
//     this.strokeColor1 = "#5d34ff";
//     this.fillColor2 = "#752cfc";
//     this.strokeColor2 = "#955cff";
//     this.fillColor3 = "#a87afd";
//     this.strokeColor3 = "#ccb1ff";
// }

opt = new so();

window.opt = opt;

window.h = 0;
window.s = 100;
window.l = 100;

window.back_b = 0;

var canvas = new p5(function(p) {
    var feathers = [];

    var now = Date.now();
    var then = Date.now();
    var INTERVAL_60 = 0.0166666; //60 fps
    var mic;
    var amp;
    var fft;

    var peak;

    var smoothing = 0.5;

    p.setup = function() {
        window.handler = new ServerHandler(p);
        mic = new p5.AudioIn();
        amp = mic.amplitude;
        amp.toggleNormalize();
        amp.smooth(smoothing);

        fft = new p5.FFT(0.6, 512);
        //fft.smooth(smoothing * 2);
        fft.setInput(mic);
        mic.start();

        peak = new p5.PeakDetect();
        p.colorMode(p.HSL);7

        // {
        //     // var gui = new dat.GUI();
        //     //
        //     // gui.remember(opt);
        //     // gui.add(opt, 'base', 0, 100).step(1);
        //     // gui.add(opt, 'offset1', -100, 100).step(1);
        //     // gui.add(opt, 'offset2', -100, 100).step(1);
        //     // gui.add(opt, 'feathers', 0, 100).step(1);
        //     // gui.add(opt, 'f_off', 0, 40).step(1);
        //     // gui.add(opt, 'rot_change', 0, 10).step(0.1);
        //     // gui.add(opt, 'base_scale1', 0, 10).step(0.1);
        //     // gui.add(opt, 'offset_scale1', 0, 3).step(0.1);
        //     // gui.add(opt, 'base_scale2', 0, 20).step(0.1);
        //     // gui.add(opt, 'offset_scale2', 0, 3).step(0.1);
        //     // gui.addColor(opt, 'fillColor1');
        //     // gui.addColor(opt, 'strokeColor1');
        //     // gui.addColor(opt, 'fillColor2');
        //     // gui.addColor(opt, 'strokeColor2');
        //     // gui.addColor(opt, 'fillColor3');
        //     // gui.addColor(opt, 'strokeColor3');
        //
        // }

        var gui = new dat.GUI();
        gui.remember(opt);
        gui.add(opt, 'p_tresh', 0, 1);
        gui.add(opt, 'p_decay', 0, 1);
        gui.add(opt, 'p_frames', 0, 100).step(1);
        gui.add(opt, 'v_min', 0, 1.0);
        gui.add(opt, 'v_max', 0, 1.0);
        gui.add(opt, 'fft_stroke_scale', 0, 20);
        gui.add(opt, 'flash_random_beat');
        gui.add(opt, 'flash_bw');
        gui.add(opt, 'draw_fft');
        gui.add(opt, 'draw_circles');
        gui.add(opt, 'flash_boids');
        gui.add(opt, 'boid_flash_base_alpha', 0, 1);
        gui.add(opt, 'flap_boid_wings');
        gui.add(opt, 'flap_boid_wings_max', 0, 10);
        gui.add(opt, 'light', 0, 100).step(1).listen();

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
        window.players[id].boid = b;
        window.flock.addBoid(b);
    }

    var core_ = 0;
    var flipFlop = -1;
    p.draw = function() {
        then = now;
        now = Date.now();

        peak.threshold = opt.p_tresh;
        peak.decayRate = opt.p_decay;
        peak.framesPerPeak = opt.p_frames;

        window.level = vol = mic.getLevel();

        // vol = p.map(vol, 0, 1, opt.v_min, opt.v_max);
        // p.background(180, 360, 360, opt.v_min);


        var spectrum = fft.analyze();
        var waveform = fft.waveform();
        peak.update(fft);

        window.spec = spectrum;
        window.spec_len = spectrum.length;
        window.wave = waveform;
        window.wave_len = waveform.length;
        window.is_peak = peak.isDetected;

        if(window.is_peak) {
            flipFlop *= -1;
            if(opt.flash_random_beat) {
                window.h = p.random(0, 360);
            }

            if(opt.flash_bw) {
                opt.light = opt.light > 0 ? 0 : 100;
            }
        }

        p.background(window.h, 100, opt.light, opt.v_min);

        var circleBase = window.h + 180;
        if(circleBase > 360) circleBase -= 360;

        if(opt.draw_circles) {
            p.push();
            p.translate(WIDTH / 2, HEIGHT / 2);
            p.rotate(vol * flipFlop);
                for (var i = 0; i< spectrum.length / 6; i++){
                  var r1 = p.map(spectrum[i * 3], 0, 255, 0, WIDTH / 4);
                  var r2 = p.map(spectrum[(i * 3) + 3], 0, 255, 0, HEIGHT / 4);
                  var c =circleBase + (90 / spectrum.length) * i * 6;

                  p.fill(c, 80, 100 - opt.light, vol);
                  p.ellipse(0, 0, r1, r2)
                }
            p.pop();
            p.noStroke();
            //p.fill(0,255,0); // spectrum is green

        }


        if(opt.draw_fft) {
            p.noFill();
            p.beginShape();
            p.strokeWeight(Math.floor(5 + (vol * opt.fft_stroke_scale)));
            p.stroke(circleBase,100,100 - opt.light, vol); // waveform is red

            for (var i = 0; i< waveform.length; i++){
              var x = p.map(i, 0, waveform.length, 0, WIDTH);
              var y = p.map( waveform[i], -1, 1, 0, HEIGHT);
              p.vertex(x,y);
            }
            p.endShape();
        }


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
