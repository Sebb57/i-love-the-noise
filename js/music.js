const ws = new WebSocket(`ws://${window.location.hostname}:8080`);

let isConnected = false
let isAudioEnabled = false;

const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const notes = {
    'a': 'C4',
    'z': 'D4',
    'e': 'E4',
    'r': 'F4',
    't': 'G4'
};

const watch_button = document.getElementById('watch');
const play_button = document.getElementById('play');

window.addEventListener("keydown", (event) => {
    if (!isConnected || event.repeat)
        return;
    if (notes[event.key]) {
        ws.send(event.key);
    }
});

ws.onmessage = async (event) => {
    if (!isAudioEnabled)
        return;
    await Tone.start();
    const key = event.data;
    if (notes[key]) {
        synth.triggerAttackRelease(notes[key], "8n");
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
