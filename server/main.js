var server = require("./httpserver.js");
var httpserver = server.createServer();
console.log("port: "+process.env.PORT);
httpserver.listen(process.env.PORT||8080);
var ws = require("./gameserver.js")(httpserver);
var chatserver = require("./chatservice.js")(httpserver);