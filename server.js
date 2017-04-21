/**
 * Created by DEV2 on 07/04/2017.
 */
var moment = require('moment');
const readline = require('readline');
var fs = require("fs");

function MySocket(id, socket) {
    this.id = id;
    this.socket = socket;
};

function User(id,nom,socketId) {
    this.id = id;
    this.nom = nom;
    this.socketId = socketId;
};

function Message(id,user,message,date) {
    this.id = id;
    this.user = user;
    this.message = message;
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

function ecritureFichier(file, message) {
    fs.appendFile(file, message, function (err) {
        if (err)
            return console.log(err);
    });
}

function recuperationListeMessages() {
    return fs.readFileSync('messages.json','utf8','r', function(err, data)  {
        if (err) throw err;
        return data;
    });
}

exports.messages = [];
exports.users = [];
exports.port = undefined;
exports.sockets = [];

exports.init = function (config) {
    var _self = this;
    this.port = config.port;
    this.io = require('socket.io')(this.port);

    this.io.sockets.on('connection', function (socket) {
        var __self = _self;
        __self.sockets.push(new MySocket(socket.id, socket));
        console.log(JSON.parse(recuperationListeMessages()));
        fs.appendFile('log.txt', moment().format('DD-MM-YYYY, HH:mm:ss')+" Nouvelle connexion\n", function (err) {
            if (err)
                return console.log(err);
        });

        socket.on('nouveauUser',function(pseudo){
            id = new idGenerateur().generate();
            nouveauUser = new User(id,pseudo,socket.id);
            __self.users.push(nouveauUser);
            socket.emit('currentUser', nouveauUser);
            ecritureFichier('log.txt',JSON.stringify(nouveauUser)+"\n");
            __self.io.sockets.emit('recupererUsers', __self.users);
            socket.emit('recupererMessages', __self.messages);
        })

        socket.on('nouveauMessage', function(data){
            id = new idGenerateur().generate();
            currentMessage = new Message(id,data.user,data.message,moment().format('DD-MM-YYYY, HH:mm:ss'));
            __self.messages.push(currentMessage);
            ecritureFichier('messages.json',JSON.stringify(currentMessage)+"\n");
            __self.io.sockets.emit('recupererNouveauMessage', currentMessage);
        })

        socket.on('disconnect', function () {
            for ( i = 0; i<__self.users.length; i++) {
                if(__self.users[i].socketId == socket['id']) {
                    ecritureFichier('log.txt', moment().format('DD-MM-YYYY, HH:mm:ss')+" Deconnexion\n");
                    ecritureFichier('log.txt',JSON.stringify(__self.users[i])+"\n");
                    console.log("Déconnexion de "+__self.users[i].nom);
                    __self.users.splice(i,1);
                    __self.io.sockets.emit('recupererUsers', __self.users);
                }
            }
            for ( i = 0; i<__self.sockets.length; i++) {
                if(__self.sockets[i].id == socket['id']) {
                    __self.sockets.splice(i,1);
                }
            }
            __self.io.emit();
        });
    });
};
