module.exports = Cock;

var Guid = require("guid");

function Cock() {
    var exist = this.readCookie("guid");
    if(exist) {
        console.log("Cookie found: ", exist);
        this.Guid = exist;
    } else {
        var value = Guid.raw();
        console.log("No cookie found, creating: " + value);
        this.createCookie("guid", value, 7);
    }
}

Cock.prototype.createCookie = function(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
Cock.prototype.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
