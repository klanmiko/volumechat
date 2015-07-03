var circleradius = 25;
var boxsidelength = 50;
var SceneObject = function SceneObject(x, y, name, shape) {
    if (x == undefined || x < 0 || y == undefined || y < 0 || name == undefined || name == "" || shape == undefined || shape == "") {
        throw new SyntaxError("one or more arguments are undefined");
    }
    this.x = x;
    this.y = y;
    this.velocity = {
        x: 0,
        y: 0
    };
    this.timestamp = 0;
    this.lag = 0;
    this.shape = shape;
    this.name = name;
    this.moving = true;
    return this;
};
exports.createSceneObject = SceneObject;

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
        },
        moving: false
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
        },
        moving: true
    }]
};
exports.addsceneobject = function(object) {
    if (object.name == undefined || object.x == undefined || object.y == undefined || object.velocity.x == undefined || object.velocity.y == undefined || object.lag == undefined || object.timestamp == undefined) {
        throw TypeError("object missing fields");
    }
    for (var x = 0; x < scene.objects.length; x++) {
        if (scene.objects[x].name == object.name) {
            throw Error("name exists");
            return;
        }
    }
    scene.objects.push(object);
}
exports.getsceneobject = function(index) {
    try {
        return scene.objects[index];
    } catch (err) {
        throw err;
    }
}
exports.removesceneobject = function(index) {
    try {
        scene.objects.splice(index, 1);
    } catch (err) {
        throw err;
    }
}
exports.replacesceneobject = function(index, object) {
    try {
        scene.objects[index] = object;
    } catch (err) {
        throw err;
    }
}
exports.scenegetindexofname = function(name) {
    var index = -1;
    for (var x = 0; x < scene.objects.length; x++) {
        if (scene.objects[x].name == name) {
            index = x;
            break;
        }
    }
    console.log(index)
    return index;
}
exports.getscenebroadcast = function() {
    return scene;
}
exports.checkCollision = function(a) {
    if (!a instanceof(SceneObject)) {
        throw new SyntaxError("oops");
    }
    for (var x = 0; x < scene.objects.length; x++) {
        if (scene.objects[x].name == a.name) {
            continue;
        } else {
            if (Collision(a, scene.objects[x])) {
                return scene.objects[x];
            }
        }
    }
    return false;
}

function Collision(a, b) {
    if (a.moving == false || b.moving == false) {
        return false;
    } else {
        if (a.shape == "circle" && b.shape == "circle") {
            return circleCollision(a, b);
        }
    }
}

function circleCollision(a, b) {
    if (a.shape != "circle" || b.shape != "circle") {
        throw new SyntaxError("nope");
    }
    var vector = {
        x: a.x - b.x,
        y: a.y - b.y
    };
    var mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (mag < circleradius*2) {
        return true;
    }
    return false;
}
