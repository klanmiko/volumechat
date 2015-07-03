var auth = {
    objects: []
};
var idcounter = 1;
exports.addauthticket = function(ticket) {
    if (ticket == undefined) {
        throw Error("ticket is undefined");
        return;
    }
    for (var x = 0; x < auth.objects.length; x++) {
        if (auth.objects[x].auth == ticket) {
            throw Error("ticket exists");
            return;
        } 
    }
    auth.objects.push({
        auth: ticket,
        id: idcounter
    });
    console.log("new auth " + auth);
    idcounter++;
    return idcounter-1;
};
exports.removeauthticket = function(ticket) {
    var index = -1;
    for (var x = 0; x < auth.objects.length; x++) {
        if (auth.objects[x].auth = ticket) {
            index = x;
            break;
        }
    }
    if (index != -1) {
        auth.objects.splice(index, 1);
    }
    return index;
    console.log(auth);
};
exports.removeindex=function(index)
{
    try{
        auth.objects.splice(index,1);
    }
    catch(err)
    {
        throw err;
    }
};
exports.getauthbyid = function(id) {
    var ticket = undefined;
    for (var x = 0; x < auth.objects.length; x++) {
        if (auth.objects[x].id == id) {
            ticket = auth.objects[x].auth;
            break;
        }
    }
    console.log("ticket " + ticket);
    return ticket;
};
