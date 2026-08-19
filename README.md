# Weather App 🌤️

A clean, responsive weather forecast web app built with vanilla HTML, CSS, and JavaScript. Get current conditions, a 24-hour forecast, and a 7-day outlook for any city — or your current location.

## Features

- 🔍 City search — look up weather for any city worldwide
- 📍 Auto-locate — uses your device's GPS to show local weather on load
- 🌡️ Current conditions — temperature, "feels like", condition, and icon
- 🌅 Sunrise / sunset arc — visual sun position tracker
- 💧 Live stats — humidity, wind speed, pressure, and UV index
- 🕐 24-hour forecast — scrollable hourly temperature cards
- 📅 7-day forecast — daily highs/lows, condition, and rain chance
- 📱 Fully responsive — optimized layouts for desktop, tablet, and mobile
- 🕒 Consistent 12-hour time format (AM/PM) across all devices, regardless of locale

## Tech Stack

- HTML5 — structure
- CSS3 — styling, responsive layout, animations
- Vanilla JavaScript — app logic, DOM rendering, geolocation
- [Open-Meteo API](https://open-meteo.com/) — free weather & geocoding data (no API key required)


## How It Works

1. On load, the app requests the browser's geolocation permission and fetches weather for the current position.
2. If location access is denied, users can search for a city using the search bar.
3. City names are resolved to coordinates via Open-Meteo's **Geocoding API**.
4. Coordinates are then used to fetch current, hourly, and daily weather data from Open-Meteo's **Forecast API**.
5. Data is rendered dynamically into the hero card, stats grid, hourly scroll strip, and 7-day list.
6. Clicking a day in the 7-day forecast shows a detailed breakdown (high/low, rain chance, UV, sunrise/sunset) via an alert popup.

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
