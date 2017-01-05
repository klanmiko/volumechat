var server = require("./httpserver.js");
var httpserver = server.createServer();
httpserver.listen(process.env.port||784);
var ws = require("./gameserver.js")(httpserver);
var chatserver = require("./chatservice.js")(httpserver);