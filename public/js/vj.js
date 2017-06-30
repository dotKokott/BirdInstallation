var $ = require("jquery");
var dat = require("dat-gui");
var so = require('./sound_opts.js');

var socket = io();

socket.emit('control');

opt = new so();
window.opt = opt;
opt.apply = function() {

    socket.emit('update_vj', {opts: opt})
}

opt.change = function(value) {
    if(opt.live_edit) {
        opt.apply();
    }
}
opt.GUI();
