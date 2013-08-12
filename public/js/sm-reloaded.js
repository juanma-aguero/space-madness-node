var game = undefined;
var socketIOReady = $.Deferred();
var socket = io.connect();
var percentage = 5;
imageBuffer = new Array();
context = {width: 708, height: 570};
soundBuffer = new Array();


socket.on('connect', function() {
    username = $("#player").val();
    if (!username.length > 0) {
        username = "player" + parseInt((2 + (Math.random() * (9 - 2))));
    }
    socket.emit('joinServer', {username: username});
});

socket.on('joined', function(data) {
    for (var i = 0; i < data.rooms.length; i++) {
        var roomHtml = "<div class='room well pull-left'>";
        roomHtml += "<h4>" + data.rooms[i].name + "</h4>";
        roomHtml += "<small>Players count: " + data.rooms[i].players + "</small>";
        roomHtml += "<div><button class='btn btn-block' onclick='joinRoom(\"" + data.rooms[i].name + "\")'>Join</button></div>";
        roomHtml += "</div>";
        $("#rooms").append(roomHtml);
    }
    $("#connecting-layer").hide();
    $("#server-layer").fadeIn();
});

socket.on('clientOnline', function(data) {
    updatePlayers(data.players);
});

socket.on('clientOffline', function(data) {
    updatePlayers(data.players);
});

socket.on('runGame', function(data) {
    console.log("start game");
    startGame();
});
socket.on('stopGame', function(data) {
    console.log("stop game");
    stopGame();
});

socket.on('updateObjects', function(data) {
    updatePlayers(data.players);
    game.objects = data.objects;
    game.correctObjects();
});

socket.on('initWorld', function(data) {
    initWorld(data);
    $('#connecting-layer').fadeOut('fast');
    $('#serverControl').show();
});
function newRoom() {
    var roomName = $("#new-room").val();
    $('#server-layer').hide();
    joinRoom(roomName);
}
function updatePlayers(players) {
    $('#players').empty();
    for (var i = 0; i < players.length; i++) {
        $('#players').append("<tr><td>" + players[i].player + "</td><td>" + players[i].points + "</td></tr>");
    }
}

function joinRoom(roomName) {
    game = new clientNgn({prediction: false});
    $('#server-layer').hide();
    $('body').append("<span class='message'>" + roomName + "<span>");
    $(".message").fadeIn('slow');
    setTimeout(function() {
        $(".message").hide("drop", {direction: 'left'}, "slow", function() {
            $("#roomTitle").text(roomName);
            $("#roomTitle").fadeIn('slow');
        });
    }, 1500);
    game.setup(socket);
    socket.emit('joinGame', {roomName: roomName, player: username});
}

function initWorld(data) {
    updatePlayers(data.players);
}

/*
 * For preloading images on cache
 */
function preloader() {

    $("#progress-bar").progressbar({value: percentage});

    // set image list
    var images = new Array();
    images['ship'] = "images/spaceship.png";
    images['fireball'] = "images/fireball.png";
    images['rock'] = "images/rock.png";
    images['rock-explosion'] = "images/rock-explosion.png";

    var sounds = Array();
    sounds['backMusic'] = "sounds/game-song1.mp3";
    sounds['weapon-fire'] = "sounds/laser.ogg";
    sounds['rock-explosion'] = "sounds/bigboom.wav";
    sounds['ship-explosion'] = "sounds/ship-explode.wav";
    for (var key in sounds) {
        var soundObj = new Audio();
        soundObj.src = sounds[key];
        soundBuffer[key] = soundObj;
    }


    var imageslength = 4;
    var count = 1;
    // start preloading
    for (var key in images) {
        var imgObj = new Image();
        imgObj.src = images[key];
        imageBuffer[key] = imgObj;
        var imageBufferLength = imageBuffer.length;
        percentage = ((count * 100) / imageslength);
        $('#progress-bar').progressbar({value: percentage});
        count++;
    }

    $("#loading-layer").hide();

}


function addPoints() {
    points += 10;
    updatePointsBoard(points);
}

$(document).keydown(function(e) {
    if (game && game.status == 'running') {
        var value = game.sampleUserInput(e.keyCode);
        if (value) {
            game.handleInput({type: 'keyboard', player: username, value: value, status: 'active'});
        }
    }
});

var keymapArrows = {left: 37, up: 38, right: 39, down: 40, shoot: 70};
var keymapAsd = {left: 65, up: 87, right: 68, down: 83, shoot: 70};

function runGame() {
    socket.emit('runGame', {player: username});
    startGame();
}
function pauseGame() {
    socket.emit('stopGame', {gameStatus: 'running'});
    stopGame();
}
function startGame() {
    console.log("start local game");
    if (game.status === 'dead') {
        game.status = 'running';
        console.log("game running");
        game.run();
        $('#space').pan({fps: 30, speed: 3, dir: 'down', depth: 10});
    } else {
        console.log("game was started");
        game.status = 'running';
        game.run();
        $('#space').spStart();
    }
    soundBuffer['backMusic'].play();
}

function stopGame() {
    game.stop();
    soundBuffer['backMusic'].pause();
    $('#space').spStop();
}


function gameOver() {
    $("#pointsToUser").html(points);

    $("#game-over").dialog({
        modal: true,
        title: 'Game over',
        buttons: {"Ok": function() {
                rankUser();
            }}
    });

    soundBuffer['backMusic'].stop();
}



$(document).ready(function() {
    preloader();

    $("#player").keypress(function(e) {
        if (e.keyCode === 13) {
            $("#connectBtn").click();
        }
    });

    $.when(socketIOReady).done(function() {
        $('#connecting-layer').hide();
        $('#connectBtn').show();
    });

});