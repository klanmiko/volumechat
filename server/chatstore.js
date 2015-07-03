var chatrooms = [];
var chatcounter = 2;
var events = require('events');
var Quadtree = function() {
    this.max = 5;
};

function expand(a) {
    if (!a instanceof ChatRoom) {
        throw new SyntaxError("not a chatroom");
    }
    a.radius += 25;
    for (var x = 0; x < chatrooms.length; x++) {
        if (chatrooms[x].id == a.id) {
            continue;
        }
        if (!canexpand(chatrooms[x], a)) {
            var amount = a.intersectcircle(chatrooms[x].x, chatrooms[x].y, chatrooms[x].radius);
            var angle = Math.atan2(amount.y, amount.x);
            a.x -= amount.isect / 2 * Math.cos(angle);
            a.y -= amount.isect / 2 * Math.sin(angle);
            chatrooms[x].x += amount.isect / 2 * Math.cos(angle);
            chatrooms[x].y += amount.isect / 2 * Math.sin(angle);
        }
    }
}
exports.getChatRoomById = function(id) {
    for (var x = 0; x < chatrooms.length; x++) {
        if (chatrooms[x].id == id) {
            return chatrooms[x];
        }
    }
};

function ChatRoom(x, y, name) {
    if (x === undefined || y === undefined || name === undefined) {
        throw new SyntaxError("missing fields");
    }
    this.id = chatcounter;
    this.emitter = new events.EventEmitter();
    chatcounter += 2;
    this.name = name;
    this.x = x;
    this.y = y;
    this.users = [];
    this.chats = [];
    this.radius = 100;
    this.color = {
        r: Math.round(Math.random() * 255),
        g: Math.round(Math.random() * 255),
        b: Math.round(Math.random() * 255)
    };
    chatrooms.push(this);
    return this;
};
ChatRoom.prototype.getchats = function() {
    return this.chats;
};
ChatRoom.prototype.adduser = function(user) {
    for(var x=0;x<this.users.length;x++)
    {
        if(this.users[x].id==user.id)
        {
            throw new Error("already have that user");
        }
    }
    this.users.push(user);
    if (this.users.length > 2) {
        if (this.radius < 500) {
            expand(this);
            this.emitter.emit('expand', this);
        }
    }
};
ChatRoom.prototype.getuser = function(id) {
    for (var x = 0; x < this.users.length; x++) {
        if (this.users[x].id == id)
            return this.users[x];
    }
};
ChatRoom.prototype.removeuser = function(user) {
    for (var x = 0; x < this.users.length; x++) {
        if (this.users[x].id == user.id)
            this.users.splice(x, 1);
    }
    if (this.radius >= 125)
        this.radius -= 25;
};
ChatRoom.prototype.hasuser = function(user) {
    for (var x = 0; x < this.users.length; x++) {
        if (this.users[x].id == user) {
            return true;
        }
    }
    return false;
};
ChatRoom.prototype.intersectpoint = function(point) {
    if (point.x === undefined || point.y === undefined) {
        throw new SyntaxError("missing arguments");
    }
    if (point.x < 0 || point.y < 0) {
        //throw new SyntaxError("point value is negative");
    }
    var vector = {
        x: point.x - this.x,
        y: point.y - this.y
    };
    var mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (mag <= this.radius) {
        return true;
    }
    return false;
};
ChatRoom.prototype.intersectcircle = function(xw, yw, radiusw) {
    if (x === undefined || y === undefined || radiusw === undefined) {
        throw new SyntaxError("missing arguments");
    }
    var vector = {
        w: this.x - xw,
        z: this.y - yw
    };
    var mag = Math.sqrt(vector.w * vector.w + vector.z * vector.z);
    if (mag < radius + radiusw) {
        vector.isect = (radius + radiusw - mag);
        return vector;
    }
    return -1;
};
ChatRoom.prototype.addChat = function(chat) {
    if (chat.text == undefined || chat.text == "" || chat.user == undefined) {
        throw new SyntaxError("not a Chat");
    }
    this.chats.push(chat);
    this.emitter.emit('chat', chat);
};
exports.createChatRoom = ChatRoom;
exports.findCollision = function searchPoint(x, y) {
    var point = {
        x: x,
        y: y
    };
    for (var x = 0; x < chatrooms.length; x++) {
        if (chatrooms[x].intersectpoint(point)) {
            return chatrooms[x];
        }
    }
    return false;
};
exports.getChatRooms = function() {
    var x = {
        type: "rooms",
        rooms: {
            objects: []
        }
    };
    for (var y = 0; y < chatrooms.length; y++) {
        var newobj = {
            x: chatrooms[y].x,
            y: chatrooms[y].y,
            radius: chatrooms[y].radius,
            name: chatrooms[y].name,
            id: chatrooms[y].id,
            color: chatrooms[y].color
        };
        x.rooms.objects.push(newobj);
    }
    return x;
};

function canexpand(a, b) {
    if (!a instanceof createChatRoom || !b instanceof createChatRoom) {
        throw SyntaxError("wrong arguments");
    }
    if (a.intersectcircle(b.x, b.y, b.radius + 25) != -1) {
        return false;
    }
    return true;
}
exports.createChat = function Chat(user, text) {
    if (user.name == undefined || user.id == undefined) {
        throw new SyntaxError("not a user");
    }
    if (text === undefined || text == "") {
        throw new SyntaxError("text empty");
    }
    this.user = user;
    this.text = text;
}
exports.createUser = function User(name, id) {
    this.name = name;
    this.id = id;
};
var debug = new ChatRoom(1, 1, "debug");