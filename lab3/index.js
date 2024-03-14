const soundElements = document.querySelectorAll("audio");

const sounds = {};

for (const sound of soundElements) {
    sounds[sound.dataset.key] = sound;
}

const recordButton = document.querySelector("#record-btn");
const recordingMap = [];

recordButton.addEventListener('click', () => {
    const recordingStartTime = Date.now();

    addEventListener('keypress', e => {
        const sound = sounds[e.key];
        sound.currentTime = 0;
        sound.play();

        recordingMap.push({ sound, delay: Date.now() - recordingStartTime });
    });
});

const startButton = document.querySelector("#play-recording-btn");
startButton.addEventListener('click', () => {
    console.log(recordingMap);
    for (const { sound, delay } of recordingMap) {
        setTimeout(() => { sound.currentTime = 0; sound.play() }, delay)
    }
});

addEventListener('keypress', e => {
    const sound = sounds[e.key];
    sound.currentTime = 0;
    sound.play();
})
