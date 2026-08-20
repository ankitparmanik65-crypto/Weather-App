/* =========================================
   SKYCAST WEATHER APP
========================================= */

/* =========================================
   GLOBAL VARIABLES
========================================= */

let currentUnit = localStorage.getItem("temperatureUnit") || "C";

let currentWeatherData = null;

let currentDailyData = null;

let currentLocation = null;

/* =========================================
   DOM HELPERS
========================================= */

const $ = (id) => document.getElementById(id);

/* =========================================
   ELEMENTS
========================================= */

const cityInput = $("cityInput");

const searchBtn = $("searchBtn");

const locationBtn = $("locationBtn");

const unitToggle = $("unitToggle");

const loading = $("loading");

const errorBox = $("error");

const weatherApp = $("weatherApp");

const weatherBackground = $("weatherBackground");

const rainContainer = $("rainContainer");

const dayModal = $("dayModal");

const modalClose = $("modalClose");

const modalContent = $("modalContent");

/* =========================================
   WEATHER CODE
========================================= */

function weatherInfo(code) {
  const map = {
    0: ["☀️", "Clear sky"],

    1: ["🌤️", "Mainly clear"],

    2: ["⛅", "Partly cloudy"],

    3: ["☁️", "Overcast"],

    45: ["🌫️", "Fog"],

    48: ["🌫️", "Rime fog"],

    51: ["🌦️", "Light drizzle"],

    53: ["🌦️", "Drizzle"],

    55: ["🌧️", "Heavy drizzle"],

    56: ["🌧️", "Freezing drizzle"],

    57: ["🌧️", "Heavy freezing drizzle"],

    61: ["🌧️", "Light rain"],

    63: ["🌧️", "Rain"],

    65: ["🌧️", "Heavy rain"],

    66: ["🌧️", "Freezing rain"],

    67: ["🌧️", "Heavy freezing rain"],

    71: ["🌨️", "Light snow"],

    73: ["🌨️", "Snow"],

    75: ["❄️", "Heavy snow"],

    77: ["❄️", "Snow grains"],

    80: ["🌦️", "Rain showers"],

    81: ["🌧️", "Rain showers"],

    82: ["⛈️", "Heavy showers"],

    85: ["🌨️", "Snow showers"],

    86: ["🌨️", "Heavy snow showers"],

    95: ["⛈️", "Thunderstorm"],

    96: ["⛈️", "Thunderstorm + hail"],

    99: ["⛈️", "Thunderstorm + hail"],
  };

  return map[code] || ["🌡️", "Unknown"];
}

/* =========================================
   CELSIUS / FAHRENHEIT
========================================= */

function convertTemperature(celsius) {
  if (currentUnit === "C") {
    return Math.round(celsius);
  }

  return Math.round((celsius * 9) / 5 + 32);
}

function temperatureText(celsius) {
  return `${convertTemperature(celsius)}°`;
}

/* =========================================
   UNIT TOGGLE
========================================= */

function updateUnitButton() {
  unitToggle.textContent =
    currentUnit === "C" ? "°F" : "°C";
}

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";

  localStorage.setItem("temperatureUnit", currentUnit);

  updateUnitButton();

  if (currentWeatherData) {
    renderWeather(currentWeatherData);
  }

  if (currentDailyData) {
    renderDaily(currentDailyData);
  }
});

/* =========================================
   LOADING
========================================= */

function showLoading() {
  loading.style.display = "flex";

  weatherApp.style.opacity = "0.35";
}

function hideLoading() {
  loading.style.display = "none";

  weatherApp.style.opacity = "1";
}

/* =========================================
   ERROR
========================================= */

function showError(message) {
  errorBox.textContent = message;

  errorBox.style.display = "block";
}

function hideError() {
  errorBox.style.display = "none";
}

/* =========================================
   CITY SEARCH
========================================= */

async function searchCity(city) {
  if (!city.trim()) {
    showError("Please enter a city name.");

    return;
  }

  try {
    showLoading();

    hideError();

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("City not found.");
    }

    const location = data.results[0];

    currentLocation = location;

    /*
      SAVE LAST SEARCHED CITY
    */

    localStorage.setItem(
      "lastCity",
      JSON.stringify({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        admin1: location.admin1 || "",
      }),
    );

    await loadWeather(
      location.latitude,
      location.longitude,
      location.name,
      location.country,
    );
  } catch (error) {
    console.error(error);

    showError(error.message || "Unable to find city.");
  } finally {
    hideLoading();
  }
}

/* =========================================
   LOAD WEATHER
========================================= */

async function loadWeather(latitude, longitude, cityName, country) {
  currentLocation = {
    name: cityName,
    country: country,
  };

  showLoading();

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,pressure_msl,wind_speed_10m` +
      `&hourly=temperature_2m,weather_code,precipitation_probability,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset` +
      `&timezone=auto` +
      `&forecast_days=7`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather service unavailable.");
    }

    const data = await response.json();

    currentWeatherData = data;

    currentDailyData = data.daily;

    /*
      RENDER EVERYTHING
    */

    renderWeather(data);

    renderHourly(data);

    renderDaily(data.daily);

    updateBackground(data);
  } catch (error) {
    console.error(error);

    showError("Unable to load weather data.");
  } finally {
    hideLoading();
  }
}

/* =========================================
   RENDER CURRENT WEATHER
========================================= */

function renderWeather(data) {
  const current = data.current;

  const daily = data.daily;

  const info = weatherInfo(current.weather_code);

  $("cityName").textContent = currentLocation?.name || "--";

  $("countryName").textContent = currentLocation?.country || "--";

  $("currentIcon").textContent = info[0];

  $("currentTemp").textContent = convertTemperature(current.temperature_2m);

  $("tempUnit").textContent = `°${currentUnit}`;

  $("currentCondition").textContent = info[1];

  $("feelsLike").textContent = `Feels like ${temperatureText(
    current.apparent_temperature,
  )}`;

  $("humidity").textContent = `${current.relative_humidity_2m}%`;

  $("wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  $("pressure").textContent = `${Math.round(current.pressure_msl)} hPa`;

  $("uv").textContent =
    daily.uv_index_max[0] !== undefined
      ? daily.uv_index_max[0].toFixed(1)
      : "--";

  $("sunrise").textContent = formatTime(daily.sunrise[0]);

  $("sunset").textContent = formatTime(daily.sunset[0]);

  $("updated").textContent = `Updated ${formatTime(current.time)}`;

  updateSunPosition(daily.sunrise[0], daily.sunset[0]);
}

/* =========================================
   HOURLY FORECAST
========================================= */

function renderHourly(data) {
  const container = $("hourlyForecast");

  container.innerHTML = "";

  const hourly = data.hourly;

  const currentTime = new Date(data.current.time);

  let startIndex = hourly.time.findIndex(
    (time) => new Date(time) >= currentTime,
  );

  if (startIndex < 0) {
    startIndex = 0;
  }

  for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
    const info = weatherInfo(hourly.weather_code[i]);

    const card = document.createElement("div");

    card.className = "hour-card";

    if (i === startIndex) {
      card.classList.add("active");
    }

    card.innerHTML = `

      <div class="hour-time">
        ${i === startIndex ? "Now" : formatHour(hourly.time[i])}
      </div>

      <div class="hour-icon">
        ${info[0]}
      </div>

      <div class="hour-temp">
        ${temperatureText(hourly.temperature_2m[i])}
      </div>

    `;

    container.appendChild(card);
  }
}

/* =========================================
   7 DAY FORECAST
========================================= */

function renderDaily(daily) {
  const container = $("dailyForecast");

  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const info = weatherInfo(daily.weather_code[i]);

    const card = document.createElement("div");

    card.className = "day-card";

    card.innerHTML = `

      <div>

        <div class="day-name">

          ${i === 0 ? "Today" : formatDay(daily.time[i])}

        </div>

        <div class="day-date">

          ${formatDate(daily.time[i])}

        </div>

      </div>


      <div class="day-weather">

        <span>
          ${info[0]}
        </span>

        <span class="day-condition">
          ${info[1]}
        </span>

      </div>


      <div class="day-temp">

        ${temperatureText(daily.temperature_2m_max[i])}

        /

        ${temperatureText(daily.temperature_2m_min[i])}

      </div>


      <div class="day-rain">

        💧
        ${daily.precipitation_probability_max[i] ?? 0}%

      </div>

    `;

    card.addEventListener("click", () => {
      showDayDetails(daily, i);
    });

    container.appendChild(card);
  }
}

/* =========================================
   DAY DETAILS
========================================= */

function showDayDetails(daily, index) {
  const info = weatherInfo(daily.weather_code[index]);

  const dayName = index === 0 ? "Today" : formatDay(daily.time[index]);

  modalContent.innerHTML = `

    <div class="modal-title">
      ${dayName}
    </div>

    <div class="day-date">
      ${formatDate(daily.time[index])}
    </div>

    <div class="modal-weather">
      ${info[0]}
    </div>

    <h3>
      ${info[1]}
    </h3>

    <br>

    <div class="modal-grid">

      <div class="modal-item">
        <span>High</span>
        <strong>
          ${temperatureText(daily.temperature_2m_max[index])}
        </strong>
      </div>

      <div class="modal-item">
        <span>Low</span>
        <strong>
          ${temperatureText(daily.temperature_2m_min[index])}
        </strong>
      </div>

      <div class="modal-item">
        <span>Rain chance</span>
        <strong>
          ${daily.precipitation_probability_max[index] ?? 0}%
        </strong>
      </div>

      <div class="modal-item">
        <span>UV Index</span>
        <strong>
          ${
            daily.uv_index_max[index] !== undefined
              ? daily.uv_index_max[index].toFixed(1)
              : "--"
          }
        </strong>
      </div>

      <div class="modal-item">
        <span>Sunrise</span>
        <strong>
          ${formatTime(daily.sunrise[index])}
        </strong>
      </div>

      <div class="modal-item">
        <span>Sunset</span>
        <strong>
          ${formatTime(daily.sunset[index])}
        </strong>
      </div>

    </div>

  `;

  dayModal.classList.add("show");
}

/* =========================================
   MODAL CLOSE
========================================= */

modalClose.addEventListener("click", () => {
  dayModal.classList.remove("show");
});

dayModal.addEventListener("click", (event) => {
  if (event.target === dayModal) {
    dayModal.classList.remove("show");
  }
});

/* =========================================
   TIME / DATE
========================================= */

function formatTime(dateString) {
  if (!dateString) {
    return "--";
  }

  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHour(dateString) {

  const date =
    new Date(dateString);

  return date.toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString([], {
    weekday: "short",
  });
}

/* =========================================
   SUN POSITION
========================================= */

function updateSunPosition(sunriseString, sunsetString) {
  const sunrise = new Date(sunriseString).getTime();

  const sunset = new Date(sunsetString).getTime();

  const now = Date.now();

  let progress = (now - sunrise) / (sunset - sunrise);

  progress = Math.max(0, Math.min(1, progress));

  const angle = 180 - progress * 180;

  const x = 50 + Math.cos((angle * Math.PI) / 180) * 45;

  const y = 70 - Math.sin((angle * Math.PI) / 180) * 45;

  const sun = $("sunPosition");

  sun.style.left = `${x}%`;

  sun.style.top = `${y}px`;
}

/* =========================================
   DAY / NIGHT + WEATHER BACKGROUND
========================================= */

function updateBackground(data) {
  const current = data.current;

  const code = current.weather_code;

  weatherBackground.className = "weather-background";

  /*
    TIME OF DAY
  */

  // if (current.is_day === 1) {
  //   weatherBackground.classList.add("day");
  // } else {
  //   weatherBackground.classList.add("night");
  // }

  /*
    WEATHER CONDITION
  */

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(
      code,
    )
  ) {
    weatherBackground.classList.add("rain");

    createRain();
  } else if ([2, 3, 45, 48].includes(code)) {
    weatherBackground.classList.add("cloudy");

    clearRain();
  } else {
    clearRain();
  }
}

/* =========================================
   CREATE RAIN
========================================= */

function createRain() {
  if (rainContainer.children.length > 0) {
    return;
  }

  for (let i = 0; i < 80; i++) {
    const drop = document.createElement("span");

    drop.className = "raindrop";

    drop.style.left = `${Math.random() * 100}%`;

    drop.style.animationDuration = `${0.5 + Math.random() * 0.7}s`;

    drop.style.animationDelay = `${Math.random() * 2}s`;

    rainContainer.appendChild(drop);
  }
}

/* =========================================
   CLEAR RAIN
========================================= */

function clearRain() {
  rainContainer.innerHTML = "";
}

/* =========================================
   GEOLOCATION
========================================= */

function getUserLocation() {
  if (!navigator.geolocation) {
    showError("Location is not supported by your browser.");

    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;

      const lon = position.coords.longitude;

      try {
        /*
          Reverse geocoding
        */

        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent("India")}&count=1&language=en&format=json`;

        /*
          We don't actually need reverse
          geocoding for weather.

          Use coordinates directly.
        */

        currentLocation = {
          name: "Your Location",
          country: "",
        };

        await loadWeather(lat, lon, "Your Location", "");

        /*
          Save coordinates
        */

        localStorage.setItem(
          "lastLocation",
          JSON.stringify({
            latitude: lat,
            longitude: lon,
          }),
        );
      } catch (error) {
        showError("Unable to detect your location.");
      } finally {
        hideLoading();
      }
    },

    () => {
      hideLoading();

      showError("Location permission was denied.");
    },
  );
}

/* =========================================
   LOCATION BUTTON
========================================= */

locationBtn.addEventListener("click", getUserLocation);

/* =========================================
   SEARCH BUTTON
========================================= */

searchBtn.addEventListener("click", () => {
  searchCity(cityInput.value);
});

/* ENTER KEY SEARCH */

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchCity(cityInput.value);
  }
});

/* =========================================
   LOAD SAVED CITY
========================================= */

async function loadSavedCity() {
  const saved = localStorage.getItem("lastCity");

  if (!saved) {
    /*
      No saved city:
      use location
    */

    getUserLocation();

    return;
  }

  try {
    const city = JSON.parse(saved);

    currentLocation = city;

    cityInput.value = city.name;

    await loadWeather(city.latitude, city.longitude, city.name, city.country);
  } catch (error) {
    console.error(error);

    getUserLocation();
  }
}

/* =========================================
   INITIALIZE
========================================= */

updateUnitButton();

loadSavedCity();
