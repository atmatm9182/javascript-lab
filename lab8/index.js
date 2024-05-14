const apiKey = "21f4560db80f5925f55edd78be72ff29";
const baseApiPath = "https://api.openweathermap.org";

const searchbox = document.querySelector("#searchbox");
const forecastsContainer = document.querySelector("#forecasts");

const forecastsCacheKey = "forecast-cities";

let forecastsCount = 0;
const maxForecastsCount = 10;

const fiveMinutesInMilliseconds = 1000 * 60 * 5;

startApp();

async function startApp() {
    searchbox.addEventListener("submit", (e) => searchboxEventListener(e));
    enableForecastActualization();
    await restoreForecastsFromStorage();
}

async function restoreForecastsFromStorage() {
    const forecastsItem = localStorage.getItem(forecastsCacheKey);
    if (!forecastsItem) {
        setForecastsInCache([]);
        return;
    }

    const forecasts = JSON.parse(forecastsItem);
    for (const forecast of forecasts) {
        if (Date.now() - forecast.lastUpdated > 5000) {
            const forecast = await getForecastForCity(forecast.city);
            addForecastToDocument(forecast.weather);
            continue;
        }

        try {
            addWeatherForecastToDocument(forecast.weather);
        } catch (e) {
            console.error(`Failed to get forecast for city ${forecast}: ${e}`);
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

function addWeatherForecastToDocument(weather) {
    const html = htmlForWeather(weather);
    forecastsContainer.appendChild(html);
    forecastsCount++;
}

class Forecast {
    constructor(city, weather, lastUpdated) {
        this.city = city;
        this.weather = weather;
        this.lastUpdated = lastUpdated;
    }
}

function getForecastForCity(city) {
    const path = `${baseApiPath}/data/2.5/weather?appid=${apiKey}&q=${city}&units=metric`;
    return fetch(path)
        .then((res) => res.json())
        .then((f) => new Forecast(city, f, Date.now()));
}

function htmlForWeather({ main, name: city, weather }) {
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
    return (e) => {
        e.target.parentElement.remove();
        removeCityForecast(city);
    };
}

function removeCityForecast(city) {
    forecastsCount--;
    const cities = getForecastsFromCache();
    const cityIndex = cities.indexOf(city);
    cities.splice(cityIndex, 1);

    setForecastsInCache(cities);
}

function addForecastToDocument(forecast) {
    const html = htmlForWeather(forecast);
    forecastsContainer.appendChild(html);
}

async function addCityForecast(city) {
    try {
        const forecast = await getForecastForCity(city);
        addForecastToDocument(forecast.weather);
        addForecastToCache(forecast);
    } catch (e) {
        console.error(`Failed to get forecast for city ${city}: ${e}`);
    }
}

function getForecastsFromCache() {
    return JSON.parse(localStorage.getItem(forecastsCacheKey));
}

function setForecastsInCache(forecasts) {
    localStorage.setItem(forecastsCacheKey, JSON.stringify(forecasts));
}

function addForecastToCache({ city, weather }) {
    const cities = getForecastsFromCache();
    cities.push({ city, weather });
    setForecastsInCache(cities);
}

function getIconSource({ icon }) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function enableForecastActualization() {
    setInterval(() => {
        updateForecasts();
    }, fiveMinutesInMilliseconds);
}

async function updateForecasts() {
    const forecasts = getForecastsFromCache();
    const promises = [];

    for (const forecast of forecasts) {
        const promise = getForecastForCity(forecast.city).then((f) =>
            htmlForWeather(f.weather),
        );
        promises.push(promise);
    }

    const forecastElements = await Promise.all(promises);
    removeAllForecasts();

    for (const forecast of forecastElements) {
        forecastsContainer.appendChild(forecast);
    }
}

function removeAllForecasts() {
    forecastsContainer.innerHTML = "";
}
