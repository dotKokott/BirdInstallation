module.exports = ServerHandler;

function ServerHandler(p) {
    this.p = p;
    this.socket = io();

    this.socket.emit('server_register', {});

    this.socket.on('success', function (data) {

         if(window.players[data.config.id]) {
             window.players[data.config.id] = data.config;
             console.log("Old boid for: ", data.config.id);
         } else {
           window.players[data.config.id] = data.config;
           p.addNewPlayerBoid(data.config.id);
           console.log("New boid for: ", data.config.id);
        }
    });

    this.socket.on('update_player', function(data) {
        if(window.players[data.config.id]) {
            window.players[data.config.id] = data.config;
        }
    })

    this.socket.on('associate_sound', function(data) {
        if(window.players[data.id]) {
            window.players[data.config.id].sound = data.sound;
            console.log("Thanks for the sound");
        }
    })

    this.socket.on('update_sound_opts', function(data) {
        if(!data.opts.lightChanged) {
            var oldLight = opt.light;
            opt = data.opts;
            opt.light = oldLight;
        } else {
            opt = data.opts;
        }

    })
}
