const slider = document.querySelector('#slider-inner');
const images = document.querySelectorAll("img");

let idx = 0;

slider.appendChild(images[0]);

const anim = setInterval(() => {
    slider.removeChild(images[idx % images.length]);
    slider.appendChild(images[(idx + 1) % images.length]);
    idx++;
}, 3000);