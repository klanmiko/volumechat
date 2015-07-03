var maxheight = 1000;
var maxwidth = 1000;
var http = require('http');
var crypto = require('crypto');
var url = require('url');
var datastore = require('./datastore.js');
var auth = require("./authsuite.js");
exports.createServer = function createserver() {
    var server = http.createServer(function(req, res) {
        var msg = url.parse(req.url, true).query;
        var returnval;
        try {
            console.log(msg);
            returnval = new datastore.createSceneObject(Math.round(Math.random() * maxwidth), Math.round(Math.random() * maxheight), msg.name,msg.icon);
            datastore.addsceneobject(returnval);
        } catch (error) {
            if (error.message == "name exists") {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.write(JSON.stringify({
                    type: "error",
                    msg: "name taken"
                }));
                console.log("denied");
                res.end();
                return;
            }
            else{
                console.log(error);
                res.write(JSON.stringify({
                    type: "error",
                    msg: "internal server error"
                }));
                res.end();
            }
        }
        var shasum = crypto.createHash('sha256');
        shasum.update(Date.now().toString());
        shasum.update(returnval.x.toString());
        shasum.update(returnval.y.toString());
        var x = shasum.digest('hex');
        console.log(x);
        req.on('error', function() {
            console.error("error bitch in login");
        });
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        });
        returnval.auth = x;
        try {
            returnval.id = auth.addauthticket(x);
        } catch (err) {
            console.log(err.message);
            res.write(JSON.stringify({
                type: "error",
                msg: "internal server error"
            }));
            res.end();
            return;
        }
        res.write(JSON.stringify(returnval));
        res.end();
    });
    if (server == undefined) {
        throw Error("undefined");
    }
    return server;
}