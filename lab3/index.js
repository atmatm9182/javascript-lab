const soundElements = document.querySelectorAll("audio");

const sounds = {};

for (const sound of soundElements) {
    sounds[sound.dataset.key] = sound;
}

const recordButton = document.querySelector("#record-btn");

const recordingMap = [];

let recordingEventListener = null;

recordButton.addEventListener('click', () => {
    const recordingStartTime = Date.now();

    recordingEventListener = e => {
        const sound = sounds[e.key];
        sound.currentTime = 0;
        sound.play();

        recordingMap.push({ sound, delay: Date.now() - recordingStartTime })
    };

    window.addEventListener('keypress', recordingEventListener);
});

const startButton = document.querySelector("#play-recording-btn");

function startButtonEventListener() {
    for (const { sound, delay } of recordingMap) {
        setTimeout(() => { sound.currentTime = 0; sound.play() }, delay)
    }
}

startButton.addEventListener('click', startButtonEventListener);

const stopButton = document.querySelector("#stop-btn");
stopButton.addEventListener('click', () => {
    if (recordingEventListener)
        window.removeEventListener('keypress', recordingEventListener);

    window.addEventListener('keypress', e => {
        const sound = sounds[e.key];
        if (!sound)
            return;

        sound.currentTime = 0;
        sound.play();
    })
});
