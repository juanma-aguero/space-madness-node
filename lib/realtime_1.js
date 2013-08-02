var socketIo = require('socket.io');
var spaceMadnessServer = require('../models/SpaceMadnessServer');

exports.start = function(server) {
    var io = socketIo.listen(server),
            rooms = [];

    io.sockets.on('connection', function(socket) {
        var roomName = "";

        socket.on('joinGame', function(joinParams) {

            // register user
            socket.username = joinParams.username;

            var joinGameRoom = function() {
                roomName = joinParams.roomName;
                socket.join(roomName);
                rooms[roomName].players.push({username: joinParams.username, points: 0});

                socket.broadcast.to(roomName).emit('clientOnline', {players: rooms[roomName].players});

                spaceMadnessServer.addPlayer({player: joinParams.username});

                socket.emit('initWorld', {players: rooms[roomName].players});
            }

            if (!rooms[joinParams.roomName]) {
                rooms[joinParams.roomName] = {
                    players: []
                };
                joinGameRoom();
            }
            else {
                joinGameRoom();
            }
        });

        socket.on('appendEvent', function(data) {
            spaceMadnessServer.appendEvent(data);
        });

        socket.on('startGame', function(data) {
            // start server
            spaceMadnessServer.run(function() {
                socket.broadcast.to(roomName).emit('updateObjects', {objects: spaceMadnessServer.getObjects()});
                socket.emit('updateObjects', {objects: spaceMadnessServer.getObjects()});
            });
        });

        socket.on('stopGame', function(data) {
            spaceMadnessServer.stop();

        });

        socket.on('send', function(data) {
            socket.broadcast.to(roomName).emit('message', data);
        });

        socket.on('disconnect', function() {
            if (rooms[roomName] && rooms[roomName].players.length > 0) {
                for (var i = 0; i < rooms[roomName].players.length; i++) {
                    if (rooms[roomName].players[i].username === socket.username) {
                        rooms[roomName].players.splice(i, 1);
                        break;
                    }
                }
                socket.broadcast.to(roomName).emit('clientOffline', {players: rooms[roomName].players});
                spaceMadnessServer.cleanPlayer(socket.username);
                
                // if no players, stop server
                if (rooms[roomName].players.length === 0) {
                    spaceMadnessServer.stop();
                }
                socket.leave(roomName);
            }
            else if (rooms[roomName]) {
                delete rooms[roomName];
            }
        });

    });



};