const slider = document.querySelector('#slider-inner');
const images = document.querySelectorAll("img");
const imageButtons = document.querySelector("#image-buttons").getElementsByTagName("input");


let idx = 0;

for (const btn of imageButtons) {
    btn.addEventListener("change", () => {
        slider.innerHTML = '';
        idx = btn.value - 1;
        slider.appendChild(images[idx]);
    })
}

slider.appendChild(images[0]);

const anim = setInterval(() => {
    slider.removeChild(images[idx % images.length]);
    slider.appendChild(images[(idx + 1) % images.length]);
    idx++;
}, 3000);