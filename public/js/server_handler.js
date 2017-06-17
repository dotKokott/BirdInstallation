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
}
