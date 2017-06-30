var express = require('express');
var app = express();
var ht = require('http');

var http = ht.Server(app);
var io = require('socket.io')(http);
var path = require('path'), fs = require('fs');
var uuid = require('node-uuid');
var port =  process.env.PORT || 3000;

app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/images', express.static('public/images'));

http.listen(port, function() {
    console.log('listening on *:'+ port);
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/client.html', function(req, res) {
    res.sendFile(__dirname + '/public/client.html');
});

app.get('/vj.html', function(req, res) {
    res.sendFile(__dirname + '/public/vj.html');
});

app.get('/manifest.json', function(req, res) {
    res.sendFile(__dirname + '/public/manifest.json');
});

var players = {};
var clients = {};


var serverSockets = [];
var serverSocket;

var controlSocket;

function config(id) {
    this.id = id;
    this.rotation = 0;
    this.online = true;

    this.param1 = 0;
    this.param2 = 0;
    this.color = [0, 0, 0];
}

io.on('connection', function (socket) {
  socket.emit('info', { hello: 'world' });

  socket.on('register', function (data) {
      clients[socket.id] = data.id;

      if(serverSocket) {
          if(players[data.id]) {
              players[data.id].online = true;
              serverSocket.emit('success', {existing: true, config: players[data.id]});
          } else {
              players[data.id] = new config(data.id);
              players[data.id].online = true;
              serverSocket.emit('success', {existing: false, config: players[data.id]});
          }
      }
  });

  socket.on('control', function(data) {
      console.log('VJ Controller logged in');

      controlSocket = socket;
  })

  socket.on('server_register', function(data) {
      serverSocket = socket;
  })

  socket.on('update_vj', function(data) {
      serverSocket.emit('update_sound_opts', { opts: data });
  })



  socket.on('update_rotation', function (data) {
      var p = players[data.id];
      if(!p) {
          console.log("Error, player not found: ", data.id);
          return;
      }

      p.rotation = data.rotation;
      p.color = data.color;

      if(serverSocket) serverSocket.emit('update_player', {config: p});
    //   if(serverSockets.length > 0) {
    //       for(var i = 0; i < serverSockets.length; i++) {
    //           serverSockets[i].emit('update_player', {config: p});
    //       }
    //   }
  });

  socket.on('recording', function(data) {
      var filename = uuid.v4();

      var p = path.join('recordings', filename + ".wav");


    //   for(var i = 0; i < serverSockets.length; i++) {
    //       serverSockets[i].emit('associate_sound', { id: data.id, sound: data.recording.audio.dataURL.split(",")[1]});
    //   }
    if(serverSocket) serverSocket.emit('associate_sound', { id: data.id, sound: data.recording.audio.dataURL.split(",")[1]});
  });

  socket.on('disconnect', function() {
      var client = clients[socket.id];
      if(client) {
          players[client].online = false;

        //   if(serverSockets.length > 0) {
        //       for(var i = 0; i < serverSockets.length; i++) {
        //           serverSockets[i].emit('update_player', {config: players[client]});
        //       }
        //   }

            if(serverSocket) serverSocket.emit('update_player', {config: players[client]});

          console.log("Disconnected: ", client);
          clients[socket.id] = undefined;
      }
  })
});
