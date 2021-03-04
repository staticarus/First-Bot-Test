var Alert = function (name, author, text, time) {
    this.guid = guid(20);
    this.name = name;
    this.author = author;
    this.text = text;
    this.time = time
} 

function guid(len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length,
        length = len || 32;
        
    for (var i = 0; i < length; i++) {
        buf[i] = chars.charAt(Math.floor(Math.random() * charlen));
    }
    
    return buf.join('');
}

module.exports = Alert