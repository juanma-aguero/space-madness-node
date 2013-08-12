var socketIo = require('socket.io');
var spaceMadnessServerModule = require('../models/SpaceMadnessServer');
var rooms = [];

exports.start = function(server) {
    var io = socketIo.listen(server);
    io.sockets.on('connection', function(socket) {
        var roomName = "";

        socket.on('joinServer', function(joinParams) {
            // register user
            socket.username = joinParams.username;
            var roomsInfo = [];
            for (var name in io.sockets.manager.rooms) {
                if (name.length > 0) {
                    var roomname = name.substring(1);
                    roomsInfo.push({name: roomname, players: io.sockets.clients(roomname).length});
                }
            }
            socket.emit('joined', {rooms: roomsInfo});
        });

        /*** game events */
        socket.on('joinGame', function(joinParams) {

            var joinGameRoom = function() {
                roomName = joinParams.roomName;
                socket.join(roomName);

                // add player to server
                rooms[roomName].server.addPlayer({player: socket.username});

                socket.broadcast.to(roomName).emit('clientOnline', {players: rooms[roomName].server.getPlayers()});
                socket.emit('initWorld', {players: rooms[roomName].server.getPlayers()});
            }

            if (!rooms[joinParams.roomName]) {

                // create room
                rooms[joinParams.roomName] = {
                    server: new spaceMadnessServerModule.SpaceMadnessServer()
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
                socket.broadcast.to(roomName).emit('updateObjects', {objects: rooms[roomName].server.getObjects(), players: rooms[roomName].server.getPlayers()});
                socket.emit('updateObjects', {objects: rooms[roomName].server.getObjects(), players: rooms[roomName].server.getPlayers()});
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
            if (rooms[roomName] && rooms[roomName].server.players.length > 0) {
                rooms[roomName].server.cleanPlayer(socket.username);
                socket.broadcast.to(roomName).emit('clientOffline', {players: rooms[roomName].server.getPlayers()});

                // if no players, stop server
                if (rooms[roomName].server.players.length === 0) {
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