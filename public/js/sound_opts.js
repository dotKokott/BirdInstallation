module.exports = sound_opts;

var dat = require("dat-gui");
var p5 = require("p5");

function randomBetween(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function sound_opts() {
    this.p_tresh = 0.12;
    this.p_decay = 0.5;
    this.p_frames = 20;
    this.back_alpha = 0.1;
    this.flash_back_alpha = false;
    this.flash_back_alpha_on_beat = false;
    this.alpha_on_beat_min = 0.0;
    this.alpha_on_beat_max = 1.0;
    //this.v_max = 1.0;

    this.fft_stroke_scale = 1.0;

    this.flash_random_color = false;
    this.flash_black_white = false;
    this.draw_fft = false;
    this.draw_circles = false;
    this.flash_boids = true;
    this.boid_base_alpha = 0.5;
    this.flap_boid_wings = true;
    this.flap_boid_wings_max = 4;
    this.light = 0;
    this.lightChanged = false;

    this.color = 0;
    this.draw_neighbour_max = 5;
    this.neighbour_channel = 3;

    this.live_edit = false;
    this.change = function(value) {};
    this.changeRC = function(value) {
        if(value) {
            opt.light = 50;
            opt.lightChanged = true;
            opt.flash_black_white = false;
        }

        opt.change(value);

        opt.lightChanged = false;
    }

    this.changeBW = function(value) {
        if(value) {
            opt.flash_random_color = false;
            opt.light = 0;
            opt.lightChanged = true;
        }

        opt.change(value);

        opt.lightChanged = false;
    }

    this.changeLight = function(value) {
        opt.lightChanged = true;
        opt.change(value);
        opt.lightChanged = false;
    }

    this.avoid_player_force = 30;

    this.autoplay = true;
    this.autoplay_switch_min = 3;
    this.autoplay_switch_max = 15;

    this.doAutoplay = function() {
        this.doRandom();
    }

    this.apply = undefined;
}

sound_opts.prototype.doRandom = function() {
    console.log("Thing");
    if(opt.autoplay) {
        var time = randomBetween(opt.autoplay_switch_min, opt.autoplay_switch_max) * 1000;
        console.log("Setting time to ", time);
        setTimeout(this.doRandom, time);
    }
}

sound_opts.prototype.GUI = function() {
    var gui = new dat.GUI();
    this.gui = gui;
    gui.useLocalStorage = true;
    gui.remember(this);
    window.gui = gui;

    var b = gui.addFolder('Beat detection');
    b.add(this, 'p_tresh', 0, 1).listen().onChange(this.change);
    b.add(this, 'p_decay', 0, 1).listen().onChange(this.change);
    b.add(this, 'p_frames', 0, 100).step(1).listen().onChange(this.change);

    var ba = gui.addFolder('Background');
    ba.add(this, 'back_alpha', 0, 1.0).listen().onChange(this.change);
    ba.add(this, 'flash_back_alpha').listen().onChange(this.change);
    ba.add(this, 'flash_back_alpha_on_beat').listen().onChange(this.change);
    ba.add(this, 'alpha_on_beat_min', 0, 1.0).step(0.01).listen().onChange(this.change);
    ba.add(this, 'alpha_on_beat_max', 0, 1.0).step(0.01).listen().onChange(this.change);

    var wa = gui.addFolder('Wave (FFT)')
    wa.add(this, 'draw_fft').listen().onChange(this.change);
    wa.add(this, 'fft_stroke_scale', 0, 20).listen().onChange(this.change);

    var ci = gui.addFolder('Center circles')
    ci.add(this, 'draw_circles').listen().onChange(this.change);

    var co = gui.addFolder('Color change')
    co.add(this, 'flash_random_color').listen().onChange(this.changeRC);
    co.add(this, 'flash_black_white').listen().onChange(this.changeBW);
    co.add(this, 'light', 0, 100).step(1).listen().onChange(this.changeLight);
    co.add(this, 'color', 0, 360).step(1).listen().onChange(this.change);

    var bo = gui.addFolder("Boids");
    bo.add(this, 'flash_boids').listen().onChange(this.change);
    bo.add(this, 'boid_base_alpha', 0, 1).listen().step(0.01).onChange(this.change);
    bo.add(this, 'flap_boid_wings').listen().onChange(this.change);
    bo.add(this, 'flap_boid_wings_max', 0, 10).listen().onChange(this.change);
    bo.add(this, 'draw_neighbour_max', 0, 10).listen().step(1).onChange(this.change);
    bo.add(this, 'neighbour_channel', 0, 512).listen().step(1).onChange(this.change);

    var be = gui.addFolder("Behaviour");
    be.add(this, 'avoid_player_force', 0, 30).listen().step(0.1).onChange(this.change);

    gui.add(this, 'autoplay').listen().onChange(this.change);
    gui.add(this, 'autoplay_switch_min', 0, 30).step(0.1).listen().onChange(this.change);
    gui.add(this, 'autoplay_switch_max', 0, 60).step(0.1).listen().onChange(this.change);

    gui.add(this, 'doAutoplay');

    if(this.apply) {
        var con = gui.addFolder("Control");
        con.add(this, 'live_edit');
        con.add(this, 'apply');
    }
}
