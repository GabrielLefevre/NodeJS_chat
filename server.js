/**
 * Created by DEV2 on 07/04/2017.
 */
var moment = require('moment');

function MySocket(id, socket) {
    this.id = id;
    this.socket = socket;
};

function User(id,nom) {
    this.id = id;
    this.nom = nom;
};

function Message(id,message,user,date) {
    this.id = id;
    this.message = message;
    this.user = user;
    this.date = date;
};

function idGenerateur() {
    this.length = 8;
    this.timestamp = +new Date;
    var _getRandomInt = function (min, max) {
        return Math.floor(Math.random() * ( max - min + 1 )) + min;
    }
    this.generate = function () {
        var ts = this.timestamp.toString();
        var parts = ts.split("").reverse();
        var id = "";
        for (var i = 0; i < this.length; ++i) {
            var index = _getRandomInt(0, parts.length - 1);
            id += parts[index];
        }
        return id;
    }
}

exports.messages = [];
exports.users = [];
exports.port = undefined;
exports.sockets = [];
exports.dateTimeCurrent = moment().format('DD-MM-YYYY, HH:mm:ss');
exports.init = function (config) {
    var _self = this;
    this.port = config.port;
    this.io = require('socket.io')(this.port);

    this.io.sockets.on('connection', function (socket) {
        var __self = _self;

        __self.sockets.push(new MySocket(socket.id, socket));
        console.log(__self.dateTimeCurrent+" Nouvelle connexion, nombre de Gandalf-guys présent : "+_self.sockets.length);

        socket.on('nouveauUser',function(pseudo){
            id = new idGenerateur().generate();
            nouveauUser = new User(id,pseudo);
            __self.users.push(nouveauUser);
            console.log( nouveauUser.id+" "+nouveauUser.nom);
        })

        socket.emit('recupererMessages', __self.messages);
        socket.on('nouveauMessage', function(message){
            currentMessage = new Message(message);
            __self.messages.push(currentMessage);
            __self.io.sockets.emit('recupererNouveauMessage', message);
        })

        socket.on('disconnect', function () {
            for ( i = 0; i<__self.sockets.length; i++) {
                if(__self.sockets[i].id == socket['id']) {
                    __self.sockets.splice(i,1);
                    console.log("Déconnexion");
                }
            }
            __self.io.emit();
        });
    });



};
