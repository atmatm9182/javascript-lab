const soundElements = document.querySelectorAll("audio");

const sounds = {};

for (const sound of soundElements) {
    sounds[sound.dataset.key] = sound;
}

addEventListener('keypress', e => {
    const sound = sounds[e.key];
    sound.currentTime = 0;
    sound.play();
})
