const inputList = document.querySelector("#input-list");
const inputElements = getInputElements();

function getInputElements() {
    return Array.of(...inputList.getElementsByTagName("input"));
}

const wyniki = document.querySelector('.wyniki');

for (const inputElement of inputElements) {
    inputElement.addEventListener('change', () => {
        wyniki.textContent = calculateStats();
    });
}

function calculateStats() {
    const inputElements = getInputElements();
    const inputArrayValues = inputElements.map(input => Number(input.value));
    const sum = inputArrayValues.reduce((sum, x) => sum + x, 0);
    const min = Math.min(...inputArrayValues);
    const max = Math.max(...inputArrayValues);
    const avg = sum / inputElements.length;

    return `sum = ${sum}, min = ${min}, max = ${max}, avg = ${avg}`;
}

const addInputButton = document.querySelector("#add-input");
addInputButton.addEventListener("click", addNewInput);

function addNewInput() {
    for (let el of getInputElements()) {
        if (el.value == "") {
            inputList.removeChild(el.parentNode);
        }
    }

    const input = document.createElement("input");
    input.type = "text";
    input.addEventListener('change', () => {
        wyniki.textContent = calculateStats();
    });

    const li = document.createElement("li");
    li.appendChild(input);
    inputList.appendChild(li);
}
