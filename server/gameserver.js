var datastore = require("./datastore.js");
var auth = require("./authsuite.js");
var chatstore = require("./chatstore.js");
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 783
    });
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState == client.OPEN)
            client.send(data);
    });
};
wss.sendtoclient = function sendto(name, data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState == client.OPEN)
            if (client.clientid != undefined) {
                if (client.clientid == name) {
                    console.log("sending");
                    client.send(data);
                }
            }
    });
};
var old = Date.now();
wss.on('connection', function connection(ws) {
    console.log("someone connected");
    var index = -1;
    var authno = undefined;
    ws.on('message', function incoming(message) {
        var time = Date.now();
        try {
            var msg = JSON.parse(message);
            if (authno == undefined) {
                try {
                    authno = auth.getauthbyid(msg.id);
                } catch (err) {
                    console.log(err.message);
                }
            }
            if (msg.auth != authno || authno == undefined) {
                console.log("msg.auth " + msg.auth);
                console.log("authno " + authno);
                ws.send(JSON.stringify({
                    type: 'error',
                    msg: 'wrong key'
                }));
                console.log("wrong key");
            } else {
                if (index == -1) {
                    try {
                        index = datastore.scenegetindexofname(msg.name);
                    } catch (err) {
                        console.log("error in line 41");
                        console.log(err.message);
                    }
                }
                if (index != -1) {
                    if (ws.clientid == undefined) {
                        ws.clientid = msg.id;
                    }
                    var object = datastore.getsceneobject(index);
                    if (object.name != msg.name) {
                        index = datastore.scenegetindexofname(msg.name);
                    }
                    if (msg.type == "position") {
                        if (object.moving) {
                            var now = Date.now();
                            var fps = 1000 / (now - old)
                            object.x += Math.round(msg.velocity.x * (msg.lag) / 1000);
                            object.y += Math.round(msg.velocity.y * (msg.lag) / 1000);
                            object.velocity = msg.velocity;
                            if (object.timestamp + 1 != msg.timestamp) {
                                console.log("missingpackets");
                            }
                            object.timestamp = msg.timestamp;
                            old = Date.now();
                        }
                        //datastore.replacesceneobject(index, object);
                    } else if (msg.type == "spacebar") {
                        if (object.moving) {
                            var l = datastore.checkCollision(object);
                            if (l) {
                                console.log("client request sent");
                                console.log(l.name);
                                var params = {
                                    type: "chatreq",
                                    player: object.name,
                                    id: msg.id
                                };
                                wss.sendtoclient(l.id, JSON.stringify(params));
                            } else {
                                var x = chatstore.findCollision(object.x, object.y);
                                if (x) {
                                    var user = new chatstore.createUser(msg.name, msg.id);
                                    x.adduser(user);
                                    object.moving = false;
                                    var not = {
                                        type: "chatmode",
                                        id: x.id,
                                    };
                                    ws.send(JSON.stringify(not));
                                }
                            }
                        }
                    } else if (msg.type == "reconnect") {
                        object.moving = true;
                    } else if (msg.type == "accept") {
                        var room = new chatstore.createChatRoom(object.x, object.y, msg.player + object.name);
                        room.emitter.on('expand', function() {
                            wss.broadcast(JSON.stringify({
                                type: "expand",
                                id: room.id,
                                radius: room.radius,
                                x: room.x,
                                y: room.y
                            }));
                        });
                        var a = new chatstore.createUser(object.name, msg.id);
                        room.adduser(a);
                        var b = new chatstore.createUser(msg.player, msg.playerid);
                        room.adduser(b);
                        object.moving = false;
                        var theirname = datastore.scenegetindexofname(msg.player);
                        var them = datastore.getsceneobject(theirname);
                        them.moving = false;
                        var not = {
                            type: "chatmode",
                            id: room.id
                        };
                        ws.send(JSON.stringify(not));
                        wss.sendtoclient(msg.playerid, JSON.stringify(not));
                        wss.broadcast(JSON.stringify({
                            type: "newroom",
                            room: {
                                x: room.x,
                                y: room.y,
                                radius: room.radius,
                                id: room.id,
                                name: room.name,
                                color:room.color
                            }
                        }));
                    }
                }
                /*ws.send(JSON.stringify({
                    type: "player",
                    player: scene.objects[index]
                }));*/
            }
        } catch (error) {
            console.log("error in message");
            console.log(error.message);
        }
    });
    ws.on('close', function() {
        if (index != -1) {
            datastore.removesceneobject(index);
            auth.removeindex(index);
            wss.broadcast(JSON.stringify({
                type: "update",
                scene: datastore.getscenebroadcast()
            }));
        }
        console.log("disconnected");

    });
    try {
        wss.broadcast(JSON.stringify({
            type: "update",
            scene: datastore.getscenebroadcast()
        }));
        ws.send(JSON.stringify(datastore.getscenebroadcast()));
        ws.send(JSON.stringify(chatstore.getChatRooms()));
    } catch (error) {
        ws.close();
        console.log(error);
    }
});
var last = Date.now();
setInterval(function() {
    var now = Date.now();
    var object = datastore.getsceneobject(1);
    object.velocity.x = 100 * Math.cos(10000 * (now));
    object.velocity.y = 100 * Math.sin(10000 * (now));
    object.x += object.velocity.x * (now - last) / 1000;
    object.y += object.velocity.y * (now - last) / 1000;
    object.timestamp++;
    object.lag = now - last;
    datastore.replacesceneobject(1, object);
    wss.broadcast(JSON.stringify(datastore.getscenebroadcast()));
    last = now;
}, 50);