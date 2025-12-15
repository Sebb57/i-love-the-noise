const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
let synth = new Tone.PolySynth(Tone.Synth).toDestination();

const instrumentSelect = document.getElementById('instruments');
instrumentSelect.addEventListener('change', () => {
    const instrumentName = instrumentSelect.value;
    synth.dispose();
    synth = new Tone.PolySynth(Tone[instrumentName]).toDestination();
});

let isConnected = false;
let isAudioEnabled = false;

const notes = {
    'a': 'C4',
    'z': 'D4',
    'e': 'E4',
    'r': 'F4',
    't': 'G4'
};

const lobbyView = document.getElementById('lobby');
const gameView = document.getElementById('game-mode');
const roomListDiv = document.getElementById('room-list');
const roomInput = document.getElementById('room-input');
const createRoomBtn = document.getElementById('create-room-btn');
const roomTitle = document.getElementById('current-room-name');
const watch_button = document.getElementById('watch');
const play_button = document.getElementById('play');
const leave_button = document.getElementById('leave');

const playNote = (key) => {
    if (notes[key]) {
        synth.triggerAttackRelease(notes[key], "8n");
    }
};

window.addEventListener("keydown", async (event) => {
    if (!isConnected || event.repeat) return;
    if (notes[event.key]) {
        await Tone.start();
        playNote(event.key);
        ws.send(JSON.stringify({ type: "note", key: event.key }));
    }
});

ws.onopen = () => {
    var room = sessionStorage.getItem("room");
    if (room) {
        enterGameMode(room)
    } else {
        ws.send(JSON.stringify({ type: "get_rooms" }));
    }
};

ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case "room_list":
            renderRoomList(data.rooms);
            break;
        case "joined":
            enterGameMode(data.room);
            break;
        case "note":
            if (isAudioEnabled) {
                await Tone.start();
                playNote(data.key);
            }
            break;
    }
};

const renderRoomList = (rooms) => {
    roomListDiv.innerHTML = '';
    if (rooms.length === 0) {
        roomListDiv.innerHTML = '<p>No active rooms... Create one!</p>';
        return;
    }
    const ul = document.createElement('ul');
    rooms.forEach(roomName => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = `Join ${roomName}`;
        btn.onclick = () => {
            location.reload()
            ws.send(JSON.stringify({ type: "join", room: roomName }));
        };
        li.appendChild(btn);
        ul.appendChild(li);
    });
    roomListDiv.appendChild(ul);
};

const enterGameMode = (roomName) => {
    sessionStorage.setItem("room", roomName);
    roomTitle.textContent = `Room: ${roomName}`;
    lobbyView.style.display = 'none';
    gameView.style.display = 'block';
    setMode('');
};

const leaveGameMode = () => {
    sessionStorage.removeItem("room");
    lobbyView.style.display = 'block';
    gameView.style.display = 'none';
    ws.send(JSON.stringify({ type: "get_rooms" }));
};

createRoomBtn.onclick = () => {
    const name = roomInput.value.trim();
    if (name) {
        ws.send(JSON.stringify({ type: "join", room: name }));
        roomInput.value = '';
    } else {
        alert("enter a room name");
    }
};

const setMode = (mode) => {
    play_button.className = "button-inactive";
    watch_button.className = "button-inactive";
    if (mode === 'play') {
        isConnected = true;
        isAudioEnabled = true;
        play_button.className = "button-active";
    } 
    else if (mode === 'watch') {
        isConnected = false;
        isAudioEnabled = true;
        watch_button.className = "button-active";
    } 
    else {
        isConnected = false;
        isAudioEnabled = false;
    }
};

play_button.onclick = async () => {
    await Tone.start();
    if (isConnected) { 
        setMode('neutral');
    } else {
        setMode('play');
    }
};

watch_button.onclick = async () => {
    await Tone.start();
    if (isAudioEnabled && !isConnected) {
        setMode('neutral');
    } else {
        setMode('watch');
    }
};

leave_button.onclick = () => {
    leaveGameMode();
    location.reload();
};
