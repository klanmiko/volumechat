var auth = require('./authsuite.js');
var chatstore = require('./chatstore.js');
module.exports = function(server){
    var WebSocketServer = require('ws').Server,
        wss = new WebSocketServer({
            server: server,
            path: "/chat"
        });
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            if (client.readyState == client.OPEN)
                client.send(data);
        });
    };
    wss.broadcastChat = function broadcastChat(chat, chatroom) {
        wss.clients.forEach(function each(client) {
            if (client.readyState == client.OPEN)
                if (client.chatroomid != undefined) {
                    if (client.chatroomid == chatroom.id){
                        client.send(chat);
                    }
                }
        });
    };
    wss.on('connection', function connection(ws) {
        console.log("someone connected");
        var authno = undefined;
        var user = undefined;
        var room = undefined;
        var chatlistener = undefined;
        ws.on('message', function incoming(message) {
            var time = Date.now();
            try {
                var msg = JSON.parse(message);
                if (authno == undefined) {
                    try {
                        console.log(msg.auth);
                        authno = auth.getauthbyid(msg.id);
                    } catch (err) {
                        console.log(err.message);
                    }
                }
                if (msg.auth != authno || authno == undefined) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        msg: 'wrong key'
                    }));
                    console.log("wrong key");
                } else {
                    if (msg.type == "chat") {
                        debugger;
                        if (authno != undefined && user != undefined && room != undefined) {
                            var x = new chatstore.createChat(user, msg.chat);
                            room.addChat(x);
                        }
                    } else if (msg.type == "connect") {
                        room = chatstore.getChatRoomById(msg.roomid);
                        if (room.hasuser(msg.id)) {
                            user = room.getuser(msg.id);
                            wss.broadcastChat(JSON.stringify({type:"userConnect",name:user.name}),room);
                            chatlistener = function(chat) {
                                if (ws.readyState == ws.OPEN) {
                                    ws.send(JSON.stringify({
                                        type: 'chat',
                                        chat: chat
                                    }));
                                }
                                else{
                                    room.emitter.removeListener('chat',arguments.callee);
                                }
                            };
                            room.emitter.on('chat', chatlistener);
                            ws.chatroomid = room.id;
                            var not = {
                                type: "allchats",
                                chats: room.getchats()
                            };
                            ws.send(JSON.stringify(not));
                        } else {
                            ws.send(JSON.stringify({
                                type: "error",
                                msg: "room does not have you"
                            }));
                            ws.close();
                        }
                    }
                }
            } catch (error) {
                console.log("error in message chatservice");
                console.log(error.message);
            }
        });
        ws.on('open', function() {
            try {} catch (error) {
                ws.close("connect fail");
                console.log(error);
            }
        });
        ws.on('close', function() {
            if (user != undefined && room != undefined) {
                room.removeuser(user);
                wss.broadcastChat(JSON.stringify({
                    type: "disconnected",
                    name: user.name
                }),room);
            }
        });
    });
}