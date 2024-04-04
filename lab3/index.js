const soundElements = document.querySelectorAll("audio");

const sounds = {};

for (const sound of soundElements) {
    if (sound.dataset.key) sounds[sound.dataset.key] = sound;
}

const recordButton = document.querySelector("#record-btn");

const recordingMap = [];

let recordingEventListener = null;

const looper = document.querySelector("#looper");
const looperEnabledCheckbox = looper.getElementsByTagName("input").item(0);

let looperInterval = null;

looperEnabledCheckbox.addEventListener("click", () => {
    const soundsArray = Object.values(sounds);
    const maxSoundDuration = soundsArray.reduce((prev, cur) => {
        return cur.duration > prev.duration ? cur : prev;
    }, soundsArray[0]).duration;

    for (const [_, sound] of Object.entries(sounds)) {
        sound.currentTime = 0;
        sound.play();
    }

    if (looperEnabledCheckbox.checked) {
        looperInterval = setInterval(() => {
            for (const [_, sound] of Object.entries(sounds)) {
                sound.currentTime = 0;
                sound.play();
            }
        }, maxSoundDuration * 1000);
    } else {
        clearInterval(looperInterval);
    }
});

recordButton.addEventListener("click", () => {
    const recordingStartTime = Date.now();

    recordingEventListener = (e) => {
        const sound = sounds[e.key];
        sound.currentTime = 0;
        sound.play();

        recordingMap.push({ sound, delay: Date.now() - recordingStartTime });
    };

    window.addEventListener("keypress", recordingEventListener);
});

const startButton = document.querySelector("#play-recording-btn");

function startButtonEventListener() {
    for (const { sound, delay } of recordingMap) {
        setTimeout(() => {
            sound.currentTime = 0;
            sound.play();
        }, delay);
    }
}

startButton.addEventListener("click", startButtonEventListener);

const stopButton = document.querySelector("#stop-btn");
stopButton.addEventListener("click", () => {
    if (recordingEventListener)
        window.removeEventListener("keypress", recordingEventListener);

    window.addEventListener("keypress", (e) => {
        const sound = sounds[e.key];
        if (!sound) return;

        sound.currentTime = 0;
        sound.play();
    });
});

const metronomeSound = document.querySelector("#metronome-sound");
const metronome = document.querySelector("#metronome");

let metronomeTimer = null;

const metronomeButton = metronome.getElementsByTagName("button").item(0);
metronomeButton.addEventListener("click", () => {
    const freq = metronome.getElementsByTagName("input").item(0);

    if (metronomeTimer) {
        clearInterval(metronomeTimer);
        metronomeTimer = null;
        metronomeButton.textContent = "Play";
    } else {
        metronomeTimer = setInterval(() => {
            metronomeSound.currentTime = 0;
            metronomeSound.play();
        }, 60000 / freq.valueAsNumber);
        metronomeButton.textContent = "Stop";
    }
});
