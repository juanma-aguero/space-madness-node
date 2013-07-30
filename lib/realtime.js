var socketIo = require('socket.io');

exports.start = function(server) {
    var io = socketIo.listen(server),
            rooms = [];

    io.sockets.on('connection', function(socket) {
        var roomName = "";

        socket.on('joinGame', function(joinParams) {

            var joinGameRoom = function() {
                roomName = joinParams.roomName;
                socket.join(roomName);
                rooms[roomName].players.push({username: joinParams.username, points: 0});
                socket.broadcast.to(roomName).emit('clientOnline', {players: rooms[roomName].players});

                socket.emit('initSlider', {
                    players: rooms[roomName].players
                });
            }

            if (!rooms[joinParams.roomName]) {
                rooms[joinParams.roomName] = {
                    players: [{username: joinParams.username, points: 0}]
                };
                joinGameRoom();
            }
            else {
                joinGameRoom();
            }
        });

        socket.on('appendEvent', function(data) {
            rooms[roomName].visible = data.visible;
            socket.broadcast.to(roomName).emit('appendEvent', data);
        });

        socket.on('startGame', function(data) {
            rooms[roomName].gameStatus = data.gameStatus;
            socket.broadcast.to(roomName).emit('startGame', {gameStatus: data.gameStatus});
        });
        socket.on('pauseGame', function(data) {
            rooms[roomName].gameStatus = data.gameStatus;
            socket.broadcast.to(roomName).emit('startGame', {gameStatus: data.gameStatus});
        });

        socket.on('send', function(data) {
            socket.broadcast.to(roomName).emit('message', data);
        });

        socket.on('disconnect', function() {
            if (rooms[roomName] && rooms[roomName].clients > 0) {
                rooms[roomName].clients--;
                socket.broadcast.to(roomName).emit('clientOffline', {current: rooms[roomName].clients});
                socket.leave(roomName);
            }
            else if (rooms[roomName]) {
                delete rooms[roomName];
            }
        });

    });

};