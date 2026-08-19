const API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const weatherApp = document.getElementById("weatherApp");


// --------------------------------------------------
// Weather code → icon + description
// --------------------------------------------------

const weatherCodes = {
  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mainly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],

  45: ["🌫️", "Fog"],
  48: ["🌫️", "Rime fog"],

  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Moderate drizzle"],
  55: ["🌧️", "Dense drizzle"],

  56: ["🌧️", "Freezing drizzle"],
  57: ["🌧️", "Heavy freezing drizzle"],

  61: ["🌦️", "Light rain"],
  63: ["🌧️", "Moderate rain"],
  65: ["🌧️", "Heavy rain"],

  66: ["🌧️", "Freezing rain"],
  67: ["🌧️", "Heavy freezing rain"],

  71: ["🌨️", "Light snow"],
  73: ["❄️", "Moderate snow"],
  75: ["❄️", "Heavy snow"],

  77: ["🌨️", "Snow grains"],

  80: ["🌦️", "Light showers"],
  81: ["🌧️", "Moderate showers"],
  82: ["⛈️", "Violent showers"],

  85: ["🌨️", "Snow showers"],
  86: ["🌨️", "Heavy snow showers"],

  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm with hail"],
  99: ["⛈️", "Severe thunderstorm"]
};


function weatherInfo(code) {
  return weatherCodes[code] || ["🌤️", "Unknown"];
}


// --------------------------------------------------
// Helpers
// --------------------------------------------------

function $(id) {
  return document.getElementById(id);
}


function showLoading(value) {
  loading.classList.toggle("hidden", !value);
}


function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = "block";

  setTimeout(() => {
    errorBox.style.display = "none";
  }, 5000);
}


function formatTime(time) {
  if (!time) return "--:--";

  return new Date(time).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}


function formatHour(time) {
  return new Date(time).toLocaleTimeString([], {
    hour: "numeric"
  });
}


function formatDay(time) {
  return new Date(time).toLocaleDateString([], {
    weekday: "short"
  });
}


function formatDate(time) {
  return new Date(time).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
}


// --------------------------------------------------
// City search
// --------------------------------------------------

async function searchCity(city) {

  if (!city.trim()) {
    showError("Please enter a city.");
    return;
  }

  showLoading(true);
  weatherApp.classList.add("hidden");

  try {

    const url =
      `${GEO_API}?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not search for city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("City not found.");
    }

    // First result = best match
    const place = data.results[0];

    await getWeather(
      place.latitude,
      place.longitude,
      place.name,
      place.country,
      place.admin1
    );

  } catch (error) {

    showError(error.message || "Something went wrong.");

    showLoading(false);
  }
}


// --------------------------------------------------
// Current location
// --------------------------------------------------

function getLocation() {

  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading(true);
  weatherApp.classList.add("hidden");

  navigator.geolocation.getCurrentPosition(

    async position => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {

        await getWeather(
          lat,
          lon,
          "Your Location",
          "",
          ""
        );

      } catch (error) {

        showError("Unable to load weather for your location.");
        showLoading(false);

      }

    },

    () => {

      showLoading(false);

      showError(
        "Location permission was denied. Search for a city instead."
      );

    },

    {
      enableHighAccuracy: true,
      timeout: 10000
    }

  );
}


// --------------------------------------------------
// Get weather
// --------------------------------------------------

async function getWeather(
  latitude,
  longitude,
  city,
  country,
  admin1
) {

  showLoading(true);

  const params = new URLSearchParams({

    latitude,
    longitude,

    timezone: "auto",

    forecast_days: "7",

    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "pressure_msl",
      "wind_speed_10m",
      "uv_index"
    ].join(","),

    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
      "precipitation_probability",
      "uv_index"
    ].join(","),

    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_probability_max"
    ].join(",")

  });


  const response = await fetch(`${API}?${params}`);

  if (!response.ok) {
    throw new Error("Weather service unavailable.");
  }

  const data = await response.json();

  renderWeather(
    data,
    city,
    country,
    admin1
  );

  showLoading(false);
  weatherApp.classList.remove("hidden");
}


// --------------------------------------------------
// Render weather
// --------------------------------------------------

function renderWeather(data, city, country, admin1) {

  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;


  // Location
  $("cityName").textContent = city;

  $("countryName").textContent =
    [admin1, country]
      .filter(Boolean)
      .join(", ");


  // Current weather
  const info = weatherInfo(current.weather_code);

  $("currentIcon").textContent = info[0];

  $("condition").textContent = info[1];

  $("currentTemp").textContent =
    Math.round(current.temperature_2m);

  $("feelsLike").textContent =
    Math.round(current.apparent_temperature);


  // Stats
  $("humidity").textContent =
    `${current.relative_humidity_2m}%`;

  $("wind").textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

  $("pressure").textContent =
    `${Math.round(current.pressure_msl)} hPa`;

  $("uv").textContent =
    Number(current.uv_index).toFixed(1);


  // Update time
  $("updated").textContent =
    `Updated ${formatTime(current.time)}`;


  // Sunrise / sunset
  $("sunrise").textContent =
    formatTime(daily.sunrise[0]);

  $("sunset").textContent =
    formatTime(daily.sunset[0]);


  // Sun position
  updateSunPosition(
    daily.sunrise[0],
    daily.sunset[0]
  );


  // Hourly
  renderHourly(hourly);


  // Daily
  renderDaily(daily);
}


// --------------------------------------------------
// Hourly forecast
// --------------------------------------------------

function renderHourly(hourly) {

  const container = $("hourlyForecast");

  container.innerHTML = "";

  // Find current hour
  const currentHourIndex =
    Math.max(
      0,
      hourly.time.findIndex(
        time =>
          new Date(time) >= new Date()
      )
    );


  const end =
    Math.min(
      currentHourIndex + 24,
      hourly.time.length
    );


  for (
    let i = currentHourIndex;
    i < end;
    i++
  ) {

    const info =
      weatherInfo(hourly.weather_code[i]);

    const card =
      document.createElement("div");

    card.className =
      `hour-card ${i === currentHourIndex ? "active" : ""}`;


    card.innerHTML = `
      <div class="hour-time">
        ${i === currentHourIndex
          ? "Now"
          : formatHour(hourly.time[i])}
      </div>

      <div class="hour-icon">
        ${info[0]}
      </div>

      <div class="hour-temp">
        ${Math.round(hourly.temperature_2m[i])}°
      </div>
    `;


    container.appendChild(card);
  }
}


// --------------------------------------------------
// 7-day forecast
// --------------------------------------------------

function renderDaily(daily) {

  const container = $("dailyForecast");

  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {

    const info = weatherInfo(daily.weather_code[i]);

    const card = document.createElement("div");

    card.className = "day-card";

    card.dataset.dayIndex = i;

    const dayName =
      i === 0
        ? "Today"
        : formatDay(daily.time[i]);

    card.innerHTML = `

      <div>
        <div class="day-name">
          ${dayName}
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

        ${Math.round(daily.temperature_2m_max[i])}°
        /
        ${Math.round(daily.temperature_2m_min[i])}°

      </div>

      <div class="day-rain">

        💧
        ${daily.precipitation_probability_max[i] ?? 0}%

      </div>

    `;

    // CLICK EVENT
    card.addEventListener("click", () => {

      showDayDetails(
        daily,
        i
      );

    });

    container.appendChild(card);
  }
}


// --------------------------------------------------
// Sunrise / sunset arc
// --------------------------------------------------

function updateSunPosition(sunrise, sunset) {

  const now = new Date();

  const start = new Date(sunrise);
  const end = new Date(sunset);

  let progress =
    (now - start) /
    (end - start);

  progress =
    Math.max(0, Math.min(1, progress));


  const sun =
    $("sunPosition");


  // Semi-circle positioning
  const angle =
    Math.PI - progress * Math.PI;


  const radius = 110;

  const x =
    Math.cos(angle) * radius;

  const y =
    Math.sin(angle) * radius;


  sun.style.left =
    `calc(50% + ${x}px)`;

  sun.style.top =
    `${35 + 105 - y}px`;
}


// --------------------------------------------------
// Search events
// --------------------------------------------------

searchBtn.addEventListener(
  "click",
  () => searchCity(cityInput.value)
);


cityInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      searchCity(cityInput.value);
    }

  }
);


locationBtn.addEventListener(
  "click",
  getLocation
);


// --------------------------------------------------
// Start app
// --------------------------------------------------

// Automatically request location when app starts.
getLocation();

function showDayDetails(daily, index) {

  const info =
    weatherInfo(daily.weather_code[index]);

  const dayName =
    index === 0
      ? "Today"
      : new Date(
          daily.time[index]
        ).toLocaleDateString([], {
          weekday: "long"
        });

  alert(
    `${dayName}

${info[0]} ${info[1]}

🌡️ High: ${Math.round(
      daily.temperature_2m_max[index]
    )}°C

🌡️ Low: ${Math.round(
      daily.temperature_2m_min[index]
    )}°C

💧 Rain chance: ${
      daily.precipitation_probability_max[index] ?? 0
    }%

☀️ UV Index: ${
      daily.uv_index_max[index]?.toFixed(1) ?? "--"
    }

🌅 Sunrise: ${
      formatTime(daily.sunrise[index])
    }

🌇 Sunset: ${
      formatTime(daily.sunset[index])
    }`
  );
}