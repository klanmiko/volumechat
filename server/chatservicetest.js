var chat = require("./chatstore.js");
var assert = require("assert");
describe('chatstore', function() {
    describe('chatrooms', function() {
        it("should return undefined", function() {
            assert.equal(chat.chatrooms, undefined);
        });
    });
    describe('addUser()', function() {
        var chatroom = chat.createChatRoom(500, 500, "hello");
        it('should create a user', function() {
            var user = {name:"blarg",auth:"yellow"};
            chatroom.adduser(user);
            assert.deepEqual(chatroom.users[0],user);
        });
        it('should throw an error', function(){
            assert.throws(chatroom.adduser);
        });
    });
    describe("createChatRoom()", function() {
        it("should create a new chatroom", function() {
            var x = {
                x: 100,
                y: 100,
                name: "yellow room",
                users: []
            };
            var room = chat.createChatRoom(100, 100, "yellow room");
            assert.equal(x.x, room.x);
            assert.equal(x.y, room.y);
            assert.equal(x.name, room.name);
            assert.deepEqual(x.users, room.users);
        });
        it("should correctly increment id", function() {
            for (var x = 2; x < 100; x += 2) {
                var z = chat.createChatRoom(x, x + 1, "name" + x);
                assert(z.id, x);
            }
        });
        it("should throw an error", function() {
            assert.throws(chat.createChatRoom, function(err) {
                if (err.message == "missing fields") {
                    return true;
                }
            });
        });
    });
});