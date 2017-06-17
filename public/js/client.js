var $ = require("jquery");
var p5 = require("p5");

window.p5 = p5;

var Cock = require("./cock.js");
var cookie = new Cock();


var recordRTC = require('recordrtc');


var socket = io();

socket.on('info', function (data) {
    socket.emit('register', {id: cookie.Guid});
});

socket.on('success', function (data) {
    if(data.existing) {
        $('#info').text("Welcome back");
    }
})

var canvas = new p5(function(p) {
    var now = Date.now();
    var then = Date.now();
    var INTERVAL_60 = 0.0166666; //60 fps

    var col;
    p.setup = function() {
        p.frameRate(30);
        var cv = p.createCanvas(window.innerWidth, window.innerHeight);
        // cv.style.height  = cv.height + 'px';
        // cv.style.width  = cv.width + 'px';
        col = p.color(p.random(255), p.random(255), p.random(255));
    }


    p.draw = function() {
        p.background(51);
        // p.rotateY(p.radians(p.rotationY));
        // p.box(200, 200, 200);
        //$('#info').text(p.rotationY);

        var currentY = p.rotationY;
        currentY = p.constrain(currentY, -70, 70);

        p.fill(col);
        p.stroke(200);
        p.push();
        p.translate(p.width / 2,p.height/2);
        p.rotate(p.radians(currentY));
        p.beginShape();
        var r = 50;
        p.vertex(0, -r * 2);
        p.vertex(-r, r * 2);
        p.vertex(r, r * 2);
        p.endShape(p.CLOSE);
        p.pop();

        socket.emit('update_rotation', {id: cookie.Guid, rotation: currentY, color: [p.red(col), p.green(col), p.blue(col)]});

    }
});

$( document ).ready(function() {
    //init();
});

var mediaStream, recordAudio;

navigator.getUserMedia({audio: true, video: false}, function(stream) {
    mediaStream = stream;
        recordAudio = recordRTC(stream, {
            type: 'audio',
            recorderType: recordRTC.StereoAudioRecorder
        });
    }, function(error) {
        alert(JSON.stringify(error));
    });


$('#start-recording').click(function() {
    console.log(recordAudio);
    recordAudio.startRecording();
});

$('#stop-recording').click(function() {
    recordAudio.stopRecording(function () {
        recordAudio.getDataURL(function(audioDataURL) {
            var files = {
                audio: {
                     type: recordAudio.getBlob().type || 'audio/wav',
                     dataURL: audioDataURL
                 }
            };
            console.log(files);
            socket.emit('recording', {id: cookie.Guid, recording: files});
        });
    });
});
