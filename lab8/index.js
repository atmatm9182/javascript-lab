const apiKey = "21f4560db80f5925f55edd78be72ff29";
const baseApiPath = "https://api.openweathermap.org";

const searchbox = document.querySelector("#searchbox");
const forecastsContainer = document.querySelector("#forecasts");

const localStorageCitiesKey = "forecast-cities";

let forecastsCount = 0;
const maxForecastsCount = 10;

startApp();

async function startApp() {
    searchbox.addEventListener("submit", (e) => searchboxEventListener(e));
    enableForecastActualization();
    await restoreForecastsFromStorage();
    console.log("started");
}

async function restoreForecastsFromStorage() {
    const citiesItem = localStorage.getItem(localStorageCitiesKey);
    if (!citiesItem) {
        localStorage.setItem(localStorageCitiesKey, JSON.stringify([]));
        return;
    }

    const cities = JSON.parse(citiesItem);
    for (const city of cities) {
        try {
            await addCityForecastToDocument(city);
        } catch (e) {
            console.error(`Failed to get forecast for city ${city}: ${e}`);
        }
    }
}

async function searchboxEventListener(e) {
    e.preventDefault();

    if (forecastsCount >= maxForecastsCount) {
        alert(`You cannot have more than ${maxForecastsCount} forecasts`);
        return;
    }

    const input = searchbox.querySelector("input");
    const city = input.value;
    input.value = "";

    await addCityForecast(city);
}

async function addCityForecastToDocument(city) {
    const forecast = await getForecastForCity(city);
    const html = htmlForForecast(forecast);
    forecastsContainer.appendChild(html);
    forecastsCount++;
}

function getForecastForCity(city) {
    const path = `${baseApiPath}/data/2.5/weather?appid=${apiKey}&q=${city}&units=metric`;
    return fetch(path).then((res) => res.json());
}

function htmlForForecast({ main, name: city, weather }) {
    const temp = main.temp;
    const humidity = main.humidity;
    const mainWeather = weather[0];
    const icon = getIconSource(mainWeather);

    const header = document.createElement("header");
    header.textContent = city;

    const iconElement = document.createElement("img");
    iconElement.src = icon;
    header.appendChild(iconElement);

    const tempP = document.createElement("p");
    const humidityP = document.createElement("p");
    tempP.innerText = `temperature: ${temp}C`;
    humidityP.innerText = `humidity: ${humidity}%`;

    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.addEventListener(
        "click",
        createForecastRemoveButtonEventListener(city),
    );

    const section = document.createElement("section");
    section.append(header, iconElement, removeButton, tempP, humidityP);
    section.classList.add("forecast");

    return section;
}

function createForecastRemoveButtonEventListener(city) {
    console.log(city);
    return (e) => {
        e.target.parentElement.remove();
        removeCityForecast(city);
    };
}

function removeCityForecast(city) {
    forecastsCount--;
    const cities = getForecastCities();
    const cityIndex = cities.indexOf(city);
    cities.splice(cityIndex, 1);

    setForecastCities(cities);
    console.log(`removed ${city}`);
}

async function addCityForecast(city) {
    try {
        await addCityForecastToDocument(city);
        addCityToLocalStorage(city);
    } catch (e) {
        console.error(`Failed to get forecast for city ${city}: ${e}`);
    }
}

function getForecastCities() {
    return JSON.parse(localStorage.getItem(localStorageCitiesKey));
}

function setForecastCities(cities) {
    localStorage.setItem(localStorageCitiesKey, JSON.stringify(cities));
}

function addCityToLocalStorage(city) {
    const cities = getForecastCities();
    cities.push(city);
    setForecastCities(cities);
}

function getIconSource({ icon }) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function enableForecastActualization() {
    setInterval(
        () => {
            updateForecasts();
        },
        1000 * 60 * 5,
    );
}

async function updateForecasts() {
    const cities = getForecastCities();
    const promises = [];

    for (const city of cities) {
        promises.push(getForecastForCity(city).then(htmlForForecast));
    }

    const forecastElements = await Promise.all(promises);
    removeAllForecasts();

    for (const forecast of forecastElements) {
        forecastsContainer.appendChild(forecast);
    }

    console.log("updated");
}

function removeAllForecasts() {
    forecastsContainer.innerHTML = "";
}
