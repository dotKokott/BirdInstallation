module.exports = sound_opts;

var dat = require("dat-gui");

function sound_opts() {
    this.p_tresh = 0.12;
    this.p_decay = 0.5;
    this.p_frames = 20;
    this.v_min = 0.1;
    this.v_max = 1.0;

    this.fft_stroke_scale = 1.0;

    this.flash_random_beat = false;
    this.flash_bw = true;
    this.draw_fft = false;
    this.draw_circles = true;
    this.flash_boids = true;
    this.boid_flash_base_alpha = 0.7;
    this.flap_boid_wings = true;
    this.flap_boid_wings_max = 4;
    this.light = 50;
}
