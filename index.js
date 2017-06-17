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

app.get('/manifest.json', function(req, res) {
    res.sendFile(__dirname + '/public/manifest.json');
});

var players = {};
var clients = {};


var serverSockets = [];

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

      if(players[data.id]) {
          players[data.id].online = true;
          io.emit('success', {existing: true, config: players[data.id]});
      } else {
          players[data.id] = new config(data.id);
          players[data.id].online = true;
          socket.emit('success', {existing: false, config: players[data.id]});
      }


  });

  socket.on('server_register', function(data) {
      serverSockets.push(socket);
  })

  socket.on('update_rotation', function (data) {
      var p = players[data.id];
      if(!p) {
          //console.log("Error, player not found: ", data.id);
          return;
      }

      p.rotation = data.rotation;
      p.color = data.color;
      if(serverSockets.length > 0) {
          for(var i = 0; i < serverSockets.length; i++) {
              serverSockets[i].emit('update_player', {config: p});
          }
      }
  });

  socket.on('recording', function(data) {
      var filename = uuid.v4();

      var p = path.join('recordings', filename + ".wav");
      players[data.id].sound = p;

      var file = fs.createWriteStream(p);

      console.log("Writing recording: ", filename);
      var buffer = new Buffer(data.recording.audio.dataURL.split(",")[1], 'base64');
      fs.writeFile(p, buffer, function(err) {
          if(err) {
              return console.log(err);
          }

          console.log("The file was saved!");
          socket.emit('recording_saved', {id: data.id});
      });
  });

  socket.on('disconnect', function() {
      var client = clients[socket.id];
      if(client) {
          players[client].online = false;

          if(serverSockets.length > 0) {
              for(var i = 0; i < serverSockets.length; i++) {
                  serverSockets[i].emit('update_player', {config: players[client]});
              }
          }

          console.log("Disconnected: ", client);
          clients[socket.id] = undefined;
      } else {
          var i = serverSockets.indexOf(socket);
          serverSockets.splice(i, 1);

          console.log("Disconnected server");
      }
  })
});
