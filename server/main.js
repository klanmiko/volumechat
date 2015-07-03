var server = require("./httpserver.js");
var httpserver = server.createServer();
httpserver.listen(784);
var ws = require("./gameserver.js");
var chatserver = require("./chatservice.js");