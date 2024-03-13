const slider = document.querySelector('#slider-inner');
const images = document.querySelectorAll("img");
const imageButtons = document.querySelector("#image-buttons").getElementsByTagName("input");
const prevButton = document.querySelector("#previous-btn");
const nextButton = document.querySelector("#next-btn");
const pauseButton = document.querySelector("#pause-btn")

let slideIdx = 0;

setCurrentSlide(slideIdx);

/**
 * @param {number} idx
 */
function setCurrentSlide(idx) {
    slider.appendChild(images[idx]);
    imageButtons[idx].checked = true;
}

prevButton.addEventListener("click", () => {
    slider.innerHTML = '';
    slideIdx = slideIdx - 1 >= 0 ? slideIdx - 1 : images.length - 1;
    setCurrentSlide(slideIdx % images.length);
})

nextButton.addEventListener("click", () => {
    slider.innerHTML = '';
    setCurrentSlide(++slideIdx % images.length);
})

for (const btn of imageButtons) {
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

const anim = setInterval(() => {
    if (isPaused)
        return;

    slider.removeChild(images[slideIdx % images.length]);
    setCurrentSlide((slideIdx + 1) % images.length);
    slideIdx++;
}, 3000);
