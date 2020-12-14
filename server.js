const express = require("express");
const app = express();
var fs = require('fs');
var options = {
  key: fs.readFileSync('/etc/ssl/private/apache-selfsigned.key'),
  cert: fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt'),
  requestCert: false,
  rejectUnauthorized: false
};
const https = require("https");
const server = https.createServer(options, app);
const io = require("socket.io")(server);
let peers = [];
let peerSPDs = [];


server.listen(3000);

app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/public/index.html');

  io.sockets.on("connection", socket => {
    // socket.on('aaa',function(a){
    //   console.log(a)
    // });
    // console.log(peers.length)
    if (peers.length == 0) {
      peers.push(socket);
      socket.emit('client_socket', 0);
    }
    // else if (peers.length == 1) {
    //   peers.push(socket);
    //   socket.emit('client_socket', peerSPDs[0]);
    // }
    else {
      peers = [];
    }


    socket.on('server_socket', function (data) {
      if (peers.length == 1) {
        peerSPDs.push(data);
        socket.broadcast.emit('client_socket', data);
      }
    });

    // socket.on('disconnect', function () {
    //   peers = [];
    //   peerSPDs = [];
    //   var sockets = io.sockets.adapter.rooms;
    //   for (let i = 0; i < sockets.length; i++) {
    //     sockets[i].emit('client_socket', 'reset');
    //   }
    // })
  });
});