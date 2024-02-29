const inputElements = document.querySelectorAll("input");

const wyniki = document.querySelector('.wyniki')

const przeliczButton = document.querySelector("#przelicz")
przeliczButton.addEventListener('click', () => {
    wyniki.textContent = calculateStats()
})

for (const inputElement of inputElements) {
    inputElement.addEventListener('keypress', () => wyniki.textContent = calculateStats())
}

function calculateStats() {
    const inputArray = Array.of(...inputElements)
    const inputArrayValues = inputArray.map(input => Number(input.value))
    const sum = inputArrayValues.reduce((sum, x) => sum + x, 0)
    const min = Math.min(...inputArrayValues)
    const max = Math.max(...inputArrayValues)
    const avg = sum / inputArray.length;

    return `suma = ${sum}, min = ${min}, max = ${max}, avg = ${avg}`;
}