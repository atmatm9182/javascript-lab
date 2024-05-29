const soundElements = document.querySelectorAll("audio");

const sounds = {};

for (const sound of soundElements) {
    if (sound.dataset.key) sounds[sound.dataset.key] = sound;
}

const recordButton = document.querySelector("#record-btn");

let recordingMap = [];

let recordingEventListener = null;

const looper = document.querySelector("#looper");
const looperEnabledCheckbox = looper.getElementsByTagName("input").item(0);

let looperIntervals = [];

recordButton.addEventListener("click", () => {
    recordingMap = [];

    const recordingStartTime = Date.now();

    function loopedRecordingEventListener(e) {
        const sound = sounds[e.key];
        if (!sound) {
            return;
        }

        sound.play();
        recordingMap.push({
            sound,
            delay: Date.now() - recordingStartTime,
        });

        const interval = setInterval(() => {
            sound.play();
            recordingMap.push({
                sound,
                delay: Date.now() - recordingStartTime,
            });
        }, sound.duration * 1000);

        looperIntervals.push(interval);
    }

    recordingEventListener = (e) => {
        const sound = sounds[e.key];
        if (!sound) {
            return;
        }

        sound.currentTime = 0;
        sound.play();

        recordingMap.push({ sound, delay: Date.now() - recordingStartTime });
    };

    recordingEventListener = looperEnabledCheckbox.checked
        ? loopedRecordingEventListener
        : recordingEventListener;

    window.addEventListener("keypress", recordingEventListener);
});

const playButton = document.querySelector("#play-recording-btn");

function startButtonEventListener() {
    for (const { sound, delay } of recordingMap) {
        setTimeout(() => {
            sound.currentTime = 0;
            sound.play();
        }, delay);
    }
}

playButton.addEventListener("click", startButtonEventListener);

const stopButton = document.querySelector("#stop-btn");
stopButton.addEventListener("click", () => {
    if (recordingEventListener) {
        window.removeEventListener("keypress", recordingEventListener);
    }

    for (const interval of looperIntervals) {
        clearInterval(interval);
    }

    looperIntervals = [];
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
        return;
    }

    metronomeTimer = setInterval(() => {
        metronomeSound.currentTime = 0;
        metronomeSound.play();
    }, 60000 / freq.valueAsNumber);
    metronomeButton.textContent = "Stop";
});
