const slider = document.querySelector('#slider-inner');
const slides = document.querySelectorAll(".slide");
const slideButtons = document.querySelector("#slider-buttons").getElementsByTagName("input");
const prevButton = document.querySelector("#previous-btn");
const nextButton = document.querySelector("#next-btn");
const pauseButton = document.querySelector("#pause-btn")

let slideIdx = 0;

setCurrentSlide(slideIdx);

function setCurrentSlide(idx) {
    slider.appendChild(slides[idx]);
    slideButtons[idx].checked = true;
}

prevButton.addEventListener("click", () => {
    slider.innerHTML = '';
    slideIdx = slideIdx - 1 >= 0 ? slideIdx - 1 : slides.length - 1;
    setCurrentSlide(slideIdx % slides.length);
    
    clearTimeout(lastTimer);
    lastTimer = scheduleTimer();
})

nextButton.addEventListener("click", () => {
    slider.innerHTML = '';
    setCurrentSlide(++slideIdx % slides.length);

    clearTimeout(lastTimer);
    lastTimer = scheduleTimer();
})

for (const btn of slideButtons) {
    btn.addEventListener("change", () => {
        slider.innerHTML = '';
        slideIdx = btn.value - 1;
        setCurrentSlide(slideIdx);
    })
}

let isPaused = false;

pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
});

function scheduleTimer() {
    return setTimeout(() => {
        lastTimer = scheduleTimer();
        console.log(lastTimer);

        if (isPaused)
            return;
    
        slider.removeChild(slides[slideIdx % slides.length]);
        setCurrentSlide((slideIdx + 1) % slides.length);
        slideIdx++;
    }, 3000);
}

let lastTimer = scheduleTimer();
