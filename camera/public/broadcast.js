const peerConnections = {};
const socket = io.connect(window.location.origin);
const video = document.querySelector("video");

// Media contrains
const constraints = {
  video: { facingMode: "user" }
  // Uncomment to enable audio
  // audio: true,
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream;
    socket.emit("broadcaster");
  })
  .catch(error => console.error(error));


  socket.on("watcher", id => {  
    const peerConnection = new RTCPeerConnection();
    console.log(peerConnection.signalingState)

    peerConnections[id] = peerConnection;
  
    let stream = video.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  
    peerConnection
      .createOffer()
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", id, peerConnection.localDescription);
      });
  });
  
  socket.on("answer", (id, description) => { 
     console.log(peerConnections[id].signalingState)

    peerConnections[id].setRemoteDescription(description);
  });
  
  socket.on("candidate", (id, candidate) => {  console.log(peerConnections[id].signalingState)

    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });



  socket.on("disconnectPeer", id => {  console.log(peerConnection.signalingState)

    peerConnections[id].close();
    delete peerConnections[id];
  });


  window.onunload = window.onbeforeunload = () => {
    socket.close();
  };
  