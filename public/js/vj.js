var $ = require("jquery");
var dat = require("dat-gui");
var so = require('./sound_opts.js');

var socket = io();

socket.emit('control');
