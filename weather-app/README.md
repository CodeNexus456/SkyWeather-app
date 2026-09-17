# Modern Weather App 🌦️

A modern, responsive, and user-friendly Weather Application built with HTML5, CSS3, and JavaScript (ES6+). It allows users to search for any city globally or detect their current location to view real-time meteorological conditions, 24-hour hourly trends, and a 5-day extended forecast.

![Weather App Preview](https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Features

### 1. City Search & Geocoding
* Search for any city, town, or country globally.
* Real-time auto-suggestions and instant validation.
* Clear error feedback when a location cannot be found.
* Popular destination quick-chips (Tokyo, London, New York, Paris, Sydney).

### 2. Comprehensive Current Weather
* City name, country, and regional badge.
* Current temperature and "Feels-Like" calculation.
* Dynamic weather condition description and icon.
* Daily High & Low temperatures.
* Humidity percentage, Wind speed with compass heading, Atmospheric Pressure (hPa), Visibility (km), and UV Index.
* European Air Quality Index (AQI) with status badges.
* Visual sunrise & sunset arc progress indicator.

### 3. 24-Hour Hourly Forecast
* Smooth horizontal scrolling strip.
* Hourly temperature, condition icons, and precipitation probability (rain chance %).

### 4. 5-Day Extended Forecast
* Cards displaying day of the week, formatted date, condition, rain chance, and day high/low temperature range bars.

### 5. Geolocation ("Use My Location")
* One-click browser geolocation retrieval.
* Automatic reverse geocoding to city name.
* Graceful fallback handling for permission denial or timeouts.

### 6. Local Storage Persistence
* Stores up to 6 recent search queries for one-click re-searching.
* Saved favorite cities with bookmark toggle.
* Remembers temperature unit preference (°C / °F) and dark/light theme choice across sessions.

### 7. Dynamic Atmospheric UI
* Visual background themes adapt automatically based on current weather condition:
  * **Clear / Sunny**: Golden sun rays and radiant glow.
  * **Cloudy**: Soft cumulus layers and ambient sky tones.
  * **Rainy**: Animated falling raindrops and wet sky gradient.
  * **Thunderstorm**: Slate-purple clouds with ambient electric aura.
  * **Snow**: Gentle drifting snowflakes.
  * **Fog / Mist**: Floating atmospheric haze.
  * **Night**: Indigo twilight with starry night glow.

---

## 🚀 Technology Stack

* **HTML5**: Semantic document structure and accessibility attributes.
* **CSS3**: Modern Flexbox, CSS Grid, custom properties (CSS variables), glassmorphism effects, and keyframe animations.
* **JavaScript (ES6+)**: Async/await Fetch API, modular functions, LocalStorage API, Geolocation API, and Web Share API.
* **Icons**: Font Awesome 6 & Lucide Icons.
* **Weather Data Source**: Open-Meteo Global Meteorological API (free, zero API key required, high precision) and OpenWeatherMap compatible.

---

## 📁 Folder Structure

```text
weather-app/
│
├── index.html          # Main HTML markup and structure
├── css/
│   └── style.css       # Complete responsive styling and weather animations
├── js/
│   └── script.js       # Core logic, API integration, and DOM handlers
├── assets/
│   └── icons/          # Weather icon assets and illustrations
└── README.md           # Documentation and setup guide
```

---

## 🔑 API Integration

This application defaults to the **Open-Meteo API**, which requires **no registration or API key**, making it instantly usable for anyone cloning the repository.

If you would like to connect your own **OpenWeatherMap** API key:
1. Register for a free API key at [OpenWeatherMap](https://openweathermap.org/api).
2. Store your key in browser `localStorage` or inject it into `script.js`:
   ```javascript
   const OPENWEATHER_API_KEY = "YOUR_API_KEY_HERE";
   ```
3. In production environments, never expose private API keys in client-side repositories. Use a serverless function (e.g. Netlify Functions, Vercel API routes, or Cloud Run backend proxy) to keep your keys secure.

---

## 💻 How to Run the Project

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```
2. Simply open `index.html` in any modern web browser:
   * Double-click `index.html` to open in Google Chrome, Edge, Safari, or Firefox.
   * Or use VS Code with the **Live Server** extension (right-click `index.html` -> *Open with Live Server*).
3. Deploy to **GitHub Pages**, **Netlify**, or **Vercel** with a single drag-and-drop or Git push.

---

## 📋 Testing Checklist

- [x] Search for a major city (e.g., "Paris") returns correct temperatures and conditions.
- [x] Search for an invalid city displays an alert message without crashing.
- [x] "Use My Location" requests geolocation and displays current city.
- [x] Temperature toggle accurately switches between °C and °F across current, hourly, and 5-day forecasts.
- [x] Recent searches are saved in LocalStorage and can be clicked to re-query.
- [x] Dark mode / Light mode toggle switches seamlessly and persists on page refresh.
- [x] Dynamic background visual changes to match sunny, cloudy, rainy, or night conditions.
- [x] Fully responsive across mobile, tablet, and desktop viewports.

---

## 🔮 Future Improvements

- Interactive radar map layer with Leaflet.js or Mapbox.
- Severe weather push notifications via Service Worker.
- Hourly precipitation bar chart visualization.
- Multi-language localization (Spanish, French, German, Japanese).
