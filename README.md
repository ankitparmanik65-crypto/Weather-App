# Weather App 🌤️

A clean, responsive weather forecast web app built with vanilla HTML, CSS, and JavaScript. Get current conditions, a 24-hour forecast, and a 7-day outlook for any city — or your current location.

## Features

- 🔍 City search — Search for weather information for any city worldwide.
- 📍 Auto-location — Uses your device's GPS to detect your current location and display local weather.
- 🌡️ Current conditions — Shows current temperature, feels-like temperature, weather condition, and weather icon.
- 🔄 Celsius / Fahrenheit toggle — Switch between °C and °F instantly using JavaScript conversion. The selected unit is saved in localStorage.
- 💾 Last searched city — The most recently searched city is stored in localStorage and automatically loaded when the app is opened again.
- 🌅 Sunrise / sunset arc — Visual sunrise and sunset tracker showing the approximate position of the sun.
- 💧 Live weather stats — Displays humidity, wind speed, atmospheric pressure, and UV index.
- 🕐 24-hour forecast — Scrollable hourly forecast showing weather icons and temperatures.
- 📅 7-day forecast — Daily high/low temperatures, weather conditions, and precipitation probability.
- 🔎 Daily forecast details — Click any day in the 7-day forecast to view detailed weather information including high/low temperature, rain chance, UV index, sunrise, and sunset.
- 🌧️ Weather-based animations — Background animations change according to weather conditions, including animated rain drops and moving clouds.
- 🌌 Dark navy interface — Clean dark navy gradient background with glassmorphism-style weather cards.
- 📱 Fully responsive — Optimized layouts for desktop, tablet, and mobile devices.
- 🕒 Consistent 24-hour time format — Time is displayed 24 hour format consistently across supported devices.
- ⚡ No API key required — Uses the free Open-Meteo API for weather and geocoding data.

## Tech Stack

- HTML5 — structure
- CSS3 — styling, responsive layout, animations
- JavaScript — app logic, DOM rendering, geolocation
- [Open-Meteo API](https://open-meteo.com/) — free weather & geocoding data (no API key required)


## How It Works

1. On first load, the app checks whether a previously searched city is stored in localStorage.

2. If a saved city exists, that city is automatically loaded.

3. If no saved city exists, the app requests browser geolocation permission and attempts to fetch weather for the user's current position.

4. If location access is denied or unavailable, users can search for a city using the search bar.

5. The city name is converted into latitude and longitude using Open-Meteo's Geocoding API.

6. The coordinates are then used to fetch current, hourly, and daily weather data from Open-Meteo's Forecast API.

7. Weather data is dynamically rendered into the current weather card, stats grid, hourly forecast, sunrise/sunset section, and 7-day forecast.

8. The selected temperature unit is saved in localStorage and restored after page reload.

9. The last searched city is saved in localStorage and automatically restored on the next visit.

10. Weather-based CSS animations are enabled according to the current WMO weather code.

11. Clicking a day in the 7-day forecast opens a detailed weather modal.

## APIs Used

| Endpoint | Purpose |
|---|---|
| `https://geocoding-api.open-meteo.com/v1/search` | Convert city name → coordinates |
| `https://api.open-meteo.com/v1/forecast` | Fetch current, hourly, and daily weather |

No API key or sign-up is needed — Open-Meteo's endpoints are free and open.

## Notes

- Time values are formatted with `hour12: true` in `formatTime()` and `formatHour()` so that hourly labels (e.g. `5pm`, `6pm`) display consistently across all devices, instead of falling back to a 24-hour format on phones with different locale settings.
- Weather icons and descriptions are mapped from [WMO weather codes](https://open-meteo.com/en/docs) in the `weatherCodes` object in `script.js`.

## Credits

Weather data provided by [Open-Meteo](https://open-meteo.com/).
