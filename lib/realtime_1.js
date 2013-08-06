var socketIo = require('socket.io');
var spaceMadnessServerModule = require('../models/SpaceMadnessServer');
var rooms = [];

exports.start = function(server) {
    var io = socketIo.listen(server);
    rooms = [];
    io.sockets.on('connection', function(socket) {
        var roomName = "";

        /*** game events */
        socket.on('joinGame', function(joinParams) {

            // register user
            socket.username = joinParams.username;

            var joinGameRoom = function() {
                roomName = joinParams.roomName;
                socket.join(roomName);
                rooms[roomName].players.push({username: joinParams.username, points: 0});

                socket.broadcast.to(roomName).emit('clientOnline', {players: rooms[roomName].players});

                // add player to server
                rooms[roomName].server.addPlayer({player: joinParams.username});

                socket.emit('initWorld', {players: rooms[roomName].players});
            }

            if (!rooms[joinParams.roomName]) {

                // create room
                rooms[joinParams.roomName] = {
                    server: new spaceMadnessServerModule.SpaceMadnessServer(),
                    players: []
                };
                joinGameRoom();
            }
            else {
                joinGameRoom();
            }
        });
        socket.on('appendEvent', function(data) {
            rooms[roomName].server.appendEvent(data);
        });
        socket.on('runGame', function(data) {
            // start server
            rooms[roomName].server.run(function() {
                socket.broadcast.to(roomName).emit('updateObjects', {objects: rooms[roomName].server.getObjects()});
                socket.emit('updateObjects', {objects: rooms[roomName].server.getObjects()});
            });
            socket.broadcast.to(roomName).emit('runGame', data);
        });
        socket.on('stopGame', function(data) {
            rooms[roomName].server.stop();
            socket.broadcast.to(roomName).emit('stopGame', data);
        });

        /*** game events */
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
                rooms[roomName].server.cleanPlayer(socket.username);

                // if no players, stop server
                if (rooms[roomName].players.length === 0) {
                    rooms[roomName].server.stop();
                    delete rooms[roomName];
                }
                socket.leave(roomName);
            }
            else if (rooms[roomName]) {
                delete rooms[roomName];
            }
        });

    });



};