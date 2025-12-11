const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

console.log("Server running :)");

server.on("connection", (socket) => {
    socket.on("message", (data) => {
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        });
    });
});
