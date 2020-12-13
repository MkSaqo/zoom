const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
let peers = [];
let peerSPDs = [];

server.listen(3000);

app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});
io.sockets.on("connection", socket => {
  if(peers.length == 0){
    socket.emit('client_socket','0');
    peers.push(socket);
  }
  else if(peers.length == 1){
    peers.push(socket);
    socket.emit('client_socket',peerSPDs[0]);
  }


  socket.on('server_socket',function(data){
    if(peers.length<3){
      peerSPDs.push(data);
      socket.broadcast.emit('client_socket',data);
    }
  });

  socket.on('disconnect',function(){
    peers = [];
    peerSPDs = [];
    var sockets = io.sockets.adapter.rooms;
    for(let i = 0;i<sockets.length;i++){
      sockets[i].emit('client_socket','reset');
    }
  })
});