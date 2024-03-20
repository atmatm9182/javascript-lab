const slider = document.querySelector('#slider-inner');
const slides = document.querySelectorAll(".slide");
const slideButtons = document.querySelector("#slider-buttons").getElementsByTagName("input");
const prevButton = document.querySelector("#previous-btn");
const nextButton = document.querySelector("#next-btn");
const pauseButton = document.querySelector("#pause-btn")
const dialog = document.querySelector("dialog");
const dialogSlidePlaceholder = document.querySelector("dialog div");
const closeDialogButton = document.querySelector("dialog button");

let slideIdx = 0;

setCurrentSlide(slideIdx);

function setCurrentSlide(idx) {
    for (const slide of slides)
        slide.classList.remove("active");

    slides[idx].classList.add("active");
    slideButtons[idx].checked = true;
    idx++;
}

prevButton.addEventListener("click", () => {
    slideIdx = slideIdx - 1 >= 0 ? slideIdx - 1 : slides.length - 1;
    setCurrentSlide(slideIdx % slides.length);
    
    resetTimer();
})

nextButton.addEventListener("click", () => {
    setCurrentSlide(++slideIdx % slides.length);

    resetTimer();
})

for (const btn of slideButtons) {
    btn.addEventListener("change", () => {
        slideIdx = btn.value - 1;
        setCurrentSlide(slideIdx);
        resetTimer();
    })
}

let isPaused = false;

pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Unpause" : "Pause";
});

for (const slide of slides) {
    if (slide.tagName == "IMG" || slide.tagName == "VIDEO") {
        slide.addEventListener("click", () => { 
            dialogSlidePlaceholder.innerHTML = "";

            const clonedSlide = slide.cloneNode(true);
            dialogSlidePlaceholder.appendChild(clonedSlide);
            dialog.showModal(); 

            isPaused = true;
        });
    }
}

closeDialogButton.addEventListener("click", () => { 
    dialog.close(); 
    isPaused = false;
});

function scheduleTimer() {
    return setTimeout(() => {
        lastTimer = scheduleTimer();

        if (isPaused)
            return;
    
        setCurrentSlide(++slideIdx % slides.length);
    }, 3000);
}

function resetTimer() {
    clearTimeout(lastTimer);
    lastTimer = scheduleTimer();
}

let lastTimer = scheduleTimer();
