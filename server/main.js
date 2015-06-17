var scene = {
    type: "scene",
    objects: [{
        x: 500,
        y: 500,
        shape: "circle",
        name: "debug2",
        lag: "",
        timestamp: 0,
        velocity: {
            x: 0,
            y: 0
        }
    }, {
        x: 600,
        y: 600,
        shape: "circle",
        name: "debug",
        lag: "",
        timestamp: 0,
        velocity: {
            x: 50,
            y: 50
        }
    }]
};
var http = require('http');
var url = require('url');
var maxheight = 1000;
var maxwidth = 1000;
var server = http.createServer(function(req, res) {
    var msg = url.parse(req.url, true).query;
    var returnval = {
        x: 0,
        y: 0,
        shape: msg.icon,
        name: msg.name,
        velocity: {
            x: 0,
            y: 0
        },
        timestamp: 0,
        lag: 0
    };
    returnval.x = Math.round(Math.random() * maxwidth);
    returnval.y = Math.round(Math.random() * maxheight);
    scene.objects.push(returnval);
    req.on('error', function() {
        console.error("error bitch in login");
    });
    res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    res.write(JSON.stringify(returnval));
    res.end();
});
server.listen(784);
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
wss.on('connection', function connection(ws) {
    console.log("someone connected");
    console.log(scene);
    var index = -1;
    ws.on('message', function incoming(message) {
        var time = Date.now();
        try {
            var msg = JSON.parse(message);
            if (index == -1) {
                for (var x = 0; x < scene.objects.length; x++) {
                    if (scene.objects[x].name == msg.name) {
                        index = x;
                        console.log("found");
                        break;
                    }
                }
            }
            if (index != -1) {
                if (scene.objects[index].name != msg.name) {
                    for (var x = 0; x < scene.objects.length; x++) {
                        if (scene.objects[x].name == msg.name) {
                            index = x;
                            console.log("refound");
                            break;
                        }
                    }
                }
                scene.objects[index].x += Math.round(msg.velocity.x * (msg.lag) / 1000);
                scene.objects[index].y += Math.round(msg.velocity.y * (msg.lag) / 1000);
                scene.objects[index].velocity = msg.velocity;
                if(scene.objects[index].timestamp+1!=msg.timestamp)
                {
                    console.log("missingpackets");
                }
                scene.objects[index].timestamp = msg.timestamp;
                /*ws.send(JSON.stringify({
                    type: "player",
                    player: scene.objects[index]
                }));*/
            }
        } catch (error) {
            console.log("error in message");
            console.log(error);
        }


    });
    ws.on('open', function() {
        try {
            ws.send(JSON.stringify(scene));
        } catch (error) {
            ws.close("connect fail");
            console.log(error);
        }
    });
    ws.on('close', function() {
        scene.objects.splice(index, 1);
        wss.broadcast(JSON.stringify({
            type: "update",
            scene: scene
        }));
    });
});
var last = Date.now();
setInterval(function() {
    var now = Date.now();
    scene.objects[1].velocity.x = 100 * Math.cos(10000 * (now));
    scene.objects[1].velocity.y = 100 * Math.sin(10000 * (now));
    scene.objects[1].x += scene.objects[1].velocity.x * (now - last) / 1000;
    scene.objects[1].y += scene.objects[1].velocity.y * (now - last) / 1000;
    scene.objects[1].timestamp++;
    scene.objects[1].lag = now - last;
    wss.broadcast(JSON.stringify(scene));
    last = now;
}, 50);