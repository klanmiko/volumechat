var scene={objects:[]};
var http = require('http');
var url = require('url');
var maxheight = 1000;
var maxwidth = 1000;
var server = http.createServer(function (req,res){
    var msg = url.parse(req.url,true).query;
    var returnval = {x:0,y:0,shape:msg.icon,name:msg.name};
    returnval.x = Math.round(Math.random()*maxwidth);
    returnval.y = Math.round(Math.random()*maxheight);
    scene.objects.push(returnval);
    console.log(msg);
    req.on('error',function(){
        console.error("error bitch in login");
    });
    res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    });
    res.write(JSON.stringify(returnval));
    res.end();
        console.log(scene);
    
});
server.listen(784);
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 783 });
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
wss.on('connection', function connection(ws) {
    console.log("someone connected");
    console.log(scene);
  ws.on('message', function incoming(message) {
      try{
        var msg = JSON.parse(message);
      }
      catch(error)
      {
          
      }
   for(var x = 0; x<scene.objects.length;x++)
   {
       if(scene.objects[x].name == msg.name)
       {
           scene.objects[x]=msg;
       }
   }
  });    
  ws.send(JSON.stringify(scene));
});
setInterval(function(){
    
    wss.broadcast(JSON.stringify(scene));
},10);
