var maxheight = 1000;
var maxwidth = 1000;
var http = require('http');
var crypto = require('crypto');
var url = require('url');
var datastore = require('./datastore.js');
var auth = require("./authsuite.js");
var express = require("express");
exports.createServer = function createserver() {
    var app = express();
    console.log(__dirname);
    app.use(express.static(__dirname + '/public'));
    app.get('/connect',function(req,res){
        var msg = req.query;
        var returnval;
        try {
            console.log(msg);
            returnval = new datastore.createSceneObject(Math.round(Math.random() * maxwidth), Math.round(Math.random() * maxheight), msg.name,msg.icon);
            datastore.addsceneobject(returnval);
        } catch (error) {
            if (error.message == "name exists") {
                res.status(200).set({
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.send({
                    type: "error",
                    msg: "name taken"
                });
                console.log("denied");
                return;
            }
            else{
                console.log(error);
                res.status(504).send({
                    type: "error",
                    msg: "internal server error"
                });
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
        res.status(200).set({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        });
        returnval.auth = x;
        try {
            returnval.id = auth.addauthticket(x);
        } catch (err) {
            console.log(err.message);
            res.send({
                type: "error",
                msg: "internal server error"
            });
            return;
        }
        res.send(returnval);
    });
    var server = http.createServer(app);
    if (server == undefined) {
        throw Error("undefined");
    }
    return server;
}