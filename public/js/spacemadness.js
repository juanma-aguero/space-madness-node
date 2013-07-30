var gameInstance = new game();
var gameRunning = false;
var gamePaused = false;
var points = 0;
imageBuffer = new Array();
context = {width: 708, height: 570};
var percentage = 5;
soundBuffer = new Array();
var socketIOReady = $.Deferred();
var socket = io.connect('http://localhost:3500');

var messages = [];
var chatroom;
var username = "";

socket.on('connect', function() {
    if (!username.length > 0) {
        username = "player" + parseInt((2 + (Math.random() * (9 - 2)))) ;
    }
    socket.emit('joinGame', {roomName: "galaga", username: username});
});

function updatePlayers(players) {
    $('#players').empty();
    for (var i = 0; i < players.length; i++) {
        $('#players').append("<div><span>" + players[i].username + "</span>:<span>" + players[i].points + "</span></div>");
    }
}

socket.on('clientOnline', function(data) {
    updatePlayers(data.players);
});

socket.on('clientOffline', function(data) {
    updatePlayers(data.current);
});

socket.on('initSlider', function(data) {
    updatePlayers(data.players);
    socketIOReady.resolve(data);
});

socket.on('startGame', function(data) {
    console.log("start game");
    startGame();
});

socket.on('appendEvent', function(data) {
    gameInstance.eventQueue.push(data);
});

socket.on('message', function(data) {
    if (data.message) {
        messages.push(data);
        updateRoom();
        if (!$("#chatbox").hasClass("active")) {
            $("#newmsg").addClass("icon-white");
        }
    } else {
        console.log("There is a problem:", data);
    }
});

function sendMsg(text) {
    if (socket) {
        var data = {message: text, username: username};
        socket.emit('send', data);
        messages.push(data);
        updateRoom();
    }
}
function chat() {
    var msg = $("#chatmsg").val();
    if (msg.length > 0) {
        sendMsg(msg);
        $("#chatmsg").val("");
    }
}

function updateRoom() {
    var html = '';
    for (var i = 0; i < messages.length; i++) {
        html += '<b>' + (messages[i].username ? messages[i].username : 'Webenter') + ': </b>';
        html += messages[i].message + '<br />';
    }
    chatroom.innerHTML = html;
    chatroom.scrollTop = chatroom.scrollHeight;
}

function initSlider(sliderInfo, jsonData) {
    
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

function updatePointsBoard(points) {
    $("#points").text(points);
    $("#points").effect("bounce", {times: 2}, 100);
}

$(document).keydown(function(e) {
    if (gameRunning) {
        gameInstance.eventQueue.push({type: 'keyboard', player: username, value: e.keyCode, status: 'active'});
        socket.emit('appendEvent', {type: 'keyboard', player: username, value: e.keyCode, status: 'active'});
    }
});

var keymapArrows = {left: 37, up: 38, right: 39, down: 40, shoot: 70};
var keymapAsd = {left: 65, up: 87, right: 68, down: 83, shoot: 70};

function startGame() {
    if (!gameRunning) {
        $('#space').pan({fps: 30, speed: 3, dir: 'down', depth: 10});
        gameRunning = true;

        gameInstance.objects.push(new ship({
            player: username,
            keymap: keymapArrows,
            posX: 200,
            posY: 200,
            events: gameInstance.eventQueue
        }));
        socket.emit('appendEvent', {type: 'newShip', player: username, value: {posX: 200, posY: 200}, status: 'active'});

        var randomVel = (2 + (Math.random() * (5 - 2)));
        var randomPosX = (2 + (0 + (Math.random() * (700 - 20))));
        gameInstance.objects.push(new rock({vel: randomVel, posX: randomPosX}));
        socket.emit('appendEvent', {type: 'newRock', player: username, value: {vel: randomVel, posX: randomPosX}, status: 'active'});

        //gameInstance.objects.push(new rock());

        gameInstance.init();
        socket.emit('startGame', {gameStatus: 'running'});
    } else {
        $('#space').spStart();
        gameInstance.startLoop();
    }
    soundBuffer['backMusic'].play();
}

function pauseGame() {
    soundBuffer['backMusic'].pause();
    $('#space').spStop();
    gameInstance.stop();
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

function rankUser() {

    $("#game-over").dialog('close');

    var userMsg;

    $.ajax({
        url: "/rankUser",
        type: "post",
        data: {
            username: $("#username").val(),
            points: points
        },
        success: function(msg) {

            if (!isNaN(parseFloat(msg))) {
                if (msg === 1) {
                    userMsg = "Congrats! You are a beast! You are a top of the ranking.";
                } else {
                    userMsg = "Your game was ranked in " + msg + " position!";
                }
            } else {
                userMsg = "Sory, your game wasnt good enough for been ranked.";
            }

        },
        error: function(a, b, c) {
            userMsg = "Unexpected error.";
        },
        complete: function() {
            $("#showRanking").append(userMsg);
            $("#showRanking").dialog({
                modal: true,
                title: 'Ranked',
                buttons: {"Ok": function() {
                        $('#restartBtn').click();
                    }}
            });
        }
    });

}

$(document).ready(function() {
    preloader();

    $.when(socketIOReady).done(initSlider);
    
    chatroom = document.getElementById("chatroom");
    $('#chatmsg-send').bind('click', function() {
        chat();
    });
    $("#chatmsg").keyup(function(e) {
        if (e.keyCode === 13) {
            chat();
        }
    });

    $('#chatheader > a').bind('click', function() {
        if ($("#chatbox").hasClass("active")) {
            $("#chatbox").removeClass("active");
        } else {
            if (username.length === 0) {

            }
            $("#chatbox").addClass("active");
            $("#newmsg").removeClass("icon-white");
        }
    });
    $('#setusername').bind('click', function() {
        var newUser = $("#username").val();
        if (newUser.length > 0) {
            username = newUser;
        }
        $("#tell-me-username").fadeOut('fast');
        $("#chatbox #controls, #chatbox #chatroom").show();
    });
    
});