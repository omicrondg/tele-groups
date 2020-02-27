import { Server as WebSocketServer } from 'ws';
const wss = new WebSocketServer({port: 8181});

wss.on('connection', (socket) => {
    console.log("Client connected");
    socket.on('message', (message) => {
        console.log("Message: ", message);
                
    });
});
