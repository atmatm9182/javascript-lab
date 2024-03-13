const slider = document.querySelector('#slider-inner');
const images = document.querySelectorAll("img");
const imageButtons = document.querySelector("#image-buttons").getElementsByTagName("input");
const prevButton = document.querySelector("#previous-btn");
const nextButton = document.querySelector("#next-btn");
const pauseButton = document.querySelector("#pause-btn")

let idx = 0;
slider.appendChild(images[idx]);

prevButton.addEventListener("click", () => {
    slider.innerHTML = '';
    idx = idx - 1 >= 0 ? idx - 1 : images.length - 1;
    slider.appendChild(images[idx % images.length]);
})

nextButton.addEventListener("click", () => {
    slider.innerHTML = '';
    slider.appendChild(images[++idx % images.length]);
})

for (const btn of imageButtons) {
    btn.addEventListener("change", () => {
        slider.innerHTML = '';
        idx = btn.value - 1;
        slider.appendChild(images[idx]);
    })
}

let isPaused = false;

pauseButton.addEventListener("click", () => { 
    isPaused = !isPaused;
    console.log("voop")
});

const anim = setInterval(() => {
    if (isPaused)
        return;

    slider.removeChild(images[idx % images.length]);
    slider.appendChild(images[(idx + 1) % images.length]);
    idx++;
}, 3000);
