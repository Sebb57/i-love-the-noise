const WebSocket = require("ws");
const { joinRoom, leaveRoom, sendToRoom, getRoomList } = require("./js/rooms");

const server = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

console.log("Server running on port 8080");

server.on("connection", (ws) => {
    ws.currentRoom = null;
    ws.on("message", (raw) => {
        let data = JSON.parse(raw);
        switch (data.type) {
            case "get_rooms":
                ws.send(JSON.stringify({ type: "room_list", rooms: getRoomList() }));
                break;

            case "join":
                joinRoom(ws, data.room);
                ws.send(JSON.stringify({ type: "joined", room: data.room }));
                break;

            case "note":
                sendToRoom(ws, JSON.stringify({ type: "note", key: data.key }), false);
                break;
        }
    });

    ws.on("close", () => {
        leaveRoom(ws);
    });
});
