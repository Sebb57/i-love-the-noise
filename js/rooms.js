const rooms = {};

const joinRoom = (ws, roomName) => {
    if (ws.currentRoom) {
        leaveRoom(ws);
    }
    if (!rooms[roomName]) {
        rooms[roomName] = new Set();
    }
    rooms[roomName].add(ws);
    ws.currentRoom = roomName;
};

const leaveRoom = (ws) => {
    const roomName = ws.currentRoom;
    if (roomName && rooms[roomName]) {
        rooms[roomName].delete(ws);
        if (rooms[roomName].size === 0) {
            delete rooms[roomName];
        }
    }
    ws.currentRoom = null;
};

const sendToRoom = (ws, data, includeSelf = false) => {
    const roomName = ws.currentRoom;
    if (!roomName || !rooms[roomName]) return;
    rooms[roomName].forEach(client => {
        if (client.readyState === 1 && (includeSelf || client !== ws)) {
            client.send(data);
        }
    });
};

const getRoomList = () => {
    return Object.keys(rooms);
};

module.exports = { joinRoom, leaveRoom, sendToRoom, getRoomList };
