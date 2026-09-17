/**
 * Weather App - Core JavaScript Application
 * Built with vanilla ES6+, Fetch API, and LocalStorage.
 * Compatible with Open-Meteo & OpenWeatherMap.
 */

// ==========================================================================
// 1. CONFIGURATION & STATE
// ==========================================================================

const CONFIG = {
  DEFAULT_CITY: 'London',
  STORAGE_KEYS: {
    RECENTS: 'weather_app_recents',
    UNIT: 'weather_app_unit',
    THEME: 'weather_app_theme',
    FAVORITES: 'weather_app_favorites',
    LAST_CITY: 'weather_app_last_city',
  },
  MAX_RECENT_SEARCHES: 6,
};

// Global App State
const state = {
  currentWeather: null,
  unit: localStorage.getItem(CONFIG.STORAGE_KEYS.UNIT) || 'C',
  theme: localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light',
  recentSearches: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENTS)) || [],
  favorites: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES)) || [],
  isLoading: false,
};

// ==========================================================================
// 2. DOM ELEMENT REFERENCES
// ==========================================================================

const elements = {
  // Atmospheric Background
  weatherBg: document.getElementById('weather-background'),
  particlesContainer: document.getElementById('particles-container'),

  // Header / Controls
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIcon: document.getElementById('theme-icon'),
  unitToggleBtn: document.getElementById('unit-toggle-btn'),
  unitCLabel: document.getElementById('unit-c-label'),
  unitFLabel: document.getElementById('unit-f-label'),
  navLocationBtn: document.getElementById('nav-location-btn'),
  shareBtn: document.getElementById('share-btn'),

  // Search Section
  searchForm: document.getElementById('search-form'),
  cityInput: document.getElementById('city-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  searchSubmitBtn: document.getElementById('search-submit-btn'),
  geoLocationBtn: document.getElementById('geo-location-btn'),
  suggestionsBox: document.getElementById('suggestions-box'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  closeErrorBtn: document.getElementById('close-error-btn'),
  recentChipsList: document.getElementById('recent-chips-list'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),

  // Loading & Main Dashboard
  loadingSpinner: document.getElementById('loading-spinner'),
  weatherDashboard: document.getElementById('weather-dashboard'),

  // Current Weather Card
  cityName: document.getElementById('city-name'),
  countryBadge: document.getElementById('country-badge'),
  lastUpdatedText: document.getElementById('last-updated-text'),
  favoriteBtn: document.getElementById('favorite-btn'),
  currentTemp: document.getElementById('current-temp'),
  currentUnit: document.getElementById('current-unit'),
  weatherCondition: document.getElementById('weather-condition'),
  feelsLikeTemp: document.getElementById('feels-like-temp'),
  todayMaxTemp: document.getElementById('today-max-temp'),
  todayMinTemp: document.getElementById('today-min-temp'),
  mainWeatherIcon: document.getElementById('main-weather-icon'),
  miniHumidity: document.getElementById('mini-humidity'),
  miniWind: document.getElementById('mini-wind'),

  // Hourly Forecast
  hourlyTrack: document.getElementById('hourly-track'),
  hourlyScrollLeft: document.getElementById('hourly-scroll-left'),
  hourlyScrollRight: document.getElementById('hourly-scroll-right'),

  // Weather Statistics
  statFeelsLike: document.getElementById('stat-feels-like'),
  statFeelsHint: document.getElementById('stat-feels-hint'),
  statHumidity: document.getElementById('stat-humidity'),
  statHumidityHint: document.getElementById('stat-humidity-hint'),
  humidityBar: document.getElementById('humidity-bar'),
  statWindSpeed: document.getElementById('stat-wind-speed'),
  statWindDirection: document.getElementById('stat-wind-direction'),
  windCompassIcon: document.getElementById('wind-compass-icon'),
  statVisibility: document.getElementById('stat-visibility'),
  statVisibilityHint: document.getElementById('stat-visibility-hint'),
  statPressure: document.getElementById('stat-pressure'),
  statUvIndex: document.getElementById('stat-uv-index'),
  statUvBadge: document.getElementById('stat-uv-badge'),
  statUvHint: document.getElementById('stat-uv-hint'),
  statAqiValue: document.getElementById('stat-aqi-value'),
  statAqiBadge: document.getElementById('stat-aqi-badge'),
  sunIndicator: document.getElementById('sun-indicator'),
  statSunrise: document.getElementById('stat-sunrise'),
  statSunset: document.getElementById('stat-sunset'),

  // 5-Day Forecast
  dailyForecastGrid: document.getElementById('daily-forecast-grid'),

  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toast-message'),
};

// ==========================================================================
// 3. WEATHER CODE INTERPRETATION & HELPERS
// ==========================================================================

/**
 * Interpret WMO weather codes into UI condition labels and Font Awesome icons.
 */
function interpretWeatherCode(code, isDay = true) {
  if (code === 0) {
    return {
      condition: isDay ? 'Clear Sky' : 'Clear Night',
      iconClass: isDay ? 'fa-solid fa-sun text-amber' : 'fa-solid fa-moon text-amber',
      bgClass: isDay ? 'bg-clear' : 'bg-night',
    };
  }
  if (code === 1 || code === 2) {
    return {
      condition: isDay ? 'Partly Cloudy' : 'Partly Cloudy Night',
      iconClass: isDay ? 'fa-solid fa-cloud-sun text-amber' : 'fa-solid fa-cloud-moon text-sky',
      bgClass: isDay ? 'bg-clouds' : 'bg-night',
    };
  }
  if (code === 3) {
    return {
      condition: 'Overcast',
      iconClass: 'fa-solid fa-cloud text-muted',
      bgClass: 'bg-clouds',
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: 'Fog & Mist',
      iconClass: 'fa-solid fa-smog text-muted',
      bgClass: 'bg-fog',
    };
  }
  if (code >= 51 && code <= 55) {
    return {
      condition: 'Drizzle',
      iconClass: 'fa-solid fa-cloud-rain text-sky',
      bgClass: 'bg-rain',
    };
  }
  if (code >= 61 && code <= 65) {
    return {
      condition: code === 61 ? 'Light Rain' : code === 63 ? 'Moderate Rain' : 'Heavy Rain',
      iconClass: 'fa-solid fa-cloud-showers-heavy text-sky',
      bgClass: 'bg-rain',
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      condition: 'Snowfall',
      iconClass: 'fa-regular fa-snowflake text-sky',
      bgClass: 'bg-snow',
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      condition: 'Rain Showers',
      iconClass: 'fa-solid fa-cloud-sun-rain text-sky',
      bgClass: 'bg-rain',
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      condition: 'Thunderstorm',
      iconClass: 'fa-solid fa-cloud-bolt text-amber',
      bgClass: 'bg-storm',
    };
  }
  return {
    condition: 'Moderate Weather',
    iconClass: isDay ? 'fa-solid fa-sun text-amber' : 'fa-solid fa-moon',
    bgClass: isDay ? 'bg-clear' : 'bg-night',
  };
}

/**
 * Convert temperature between Celsius and Fahrenheit.
 */
function convertTemp(celsius, unit) {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

function formatTempString(celsius, unit) {
  return `${convertTemp(celsius, unit)}°${unit}`;
}

// ==========================================================================
// 4. API REQUESTS & DATA FETCHING
// ==========================================================================

/**
 * Geocode city name to coordinates using Open-Meteo.
 */
async function geocodeCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName.trim())}&count=5&language=en&format=json`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Network error while searching for city.');
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found. Please verify the spelling and try again.`);
  }

  return data.results[0];
}

/**
 * Reverse geocode coordinates to location name.
 */
async function reverseGeocodeCoords(latitude, longitude) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return {
        name: data.city || data.locality || data.principalSubdivision || 'Current Location',
        country: data.countryCode || data.countryName || '',
        latitude,
        longitude,
      };
    }
  } catch {
    // Fallback if reverse geocoding is blocked
  }
  return {
    name: 'My Location',
    country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    latitude,
    longitude,
  };
}

/**
 * Fetch full weather data (Current, Hourly, Daily 5-day, AQI) by coordinates.
 */
async function fetchWeatherData(loc) {
  const { latitude, longitude } = loc;
  
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,is_day,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(aqiUrl),
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error('Unable to retrieve weather forecast. Please check your connection.');
  }

  const wData = await weatherRes.value.json();
  let aqiData = { aqi: 24, label: 'Good' };

  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    try {
      const aData = await aqiRes.value.json();
      if (aData.current && aData.current.european_aqi !== undefined) {
        const val = Math.round(aData.current.european_aqi);
        let label = 'Good';
        if (val > 20 && val <= 40) label = 'Fair';
        else if (val > 40 && val <= 60) label = 'Moderate';
        else if (val > 60) label = 'Poor';
        aqiData = { aqi: val, label };
      }
    } catch {
      // ignore
    }
  }

  return processWeatherData(loc, wData, aqiData);
}

/**
 * Transform raw API payloads into a clean application model.
 */
function processWeatherData(location, wData, aqiData) {
  const current = wData.current;
  const isDay = Boolean(current.is_day);
  const conditionMeta = interpretWeatherCode(current.weather_code, isDay);

  // Hourly index
  const nowHourIso = new Date().toISOString().slice(0, 13);
  let startIdx = 0;
  if (wData.hourly && wData.hourly.time) {
    const idx = wData.hourly.time.findIndex(t => t.startsWith(nowHourIso));
    if (idx !== -1) startIdx = idx;
  }

  const hourly = [];
  if (wData.hourly && wData.hourly.time) {
    for (let i = startIdx; i < Math.min(startIdx + 24, wData.hourly.time.length); i++) {
      const timeDate = new Date(wData.hourly.time[i]);
      const hourMeta = interpretWeatherCode(wData.hourly.weather_code[i], Boolean(wData.hourly.is_day[i]));
      hourly.push({
        time: i === startIdx ? 'Now' : timeDate.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        temp: wData.hourly.temperature_2m[i],
        pop: wData.hourly.precipitation_probability ? (wData.hourly.precipitation_probability[i] || 0) : 0,
        condition: hourMeta.condition,
        iconClass: hourMeta.iconClass,
      });
    }
  }

  // 5-Day Forecast
  const daily = [];
  if (wData.daily && wData.daily.time) {
    const totalDays = Math.min(5, wData.daily.time.length);
    for (let i = 0; i < totalDays; i++) {
      const dDate = new Date(wData.daily.time[i] + 'T00:00:00');
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dDate.toLocaleDateString([], { weekday: 'short' });
      const formattedDate = dDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const dayMeta = interpretWeatherCode(wData.daily.weather_code[i], true);

      daily.push({
        dayName,
        formattedDate,
        tempMax: wData.daily.temperature_2m_max[i],
        tempMin: wData.daily.temperature_2m_min[i],
        condition: dayMeta.condition,
        iconClass: dayMeta.iconClass,
        pop: wData.daily.precipitation_probability_max ? (wData.daily.precipitation_probability_max[i] || 0) : 0,
        sunrise: wData.daily.sunrise[i] ? new Date(wData.daily.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        sunset: wData.daily.sunset[i] ? new Date(wData.daily.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      });
    }
  }

  const visibilityKm = wData.hourly?.visibility ? Math.round((wData.hourly.visibility[startIdx] / 1000) * 10) / 10 : 10.0;
  const uvIndex = wData.hourly?.uv_index ? Math.round(wData.hourly.uv_index[startIdx]) : 3;

  return {
    location,
    current: {
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      condition: conditionMeta.condition,
      iconClass: conditionMeta.iconClass,
      bgClass: conditionMeta.bgClass,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirection: current.wind_direction_10m,
      pressure: Math.round(current.surface_pressure),
      visibility: visibilityKm,
      uvIndex: uvIndex,
      isDay,
      sunrise: daily[0]?.sunrise || '06:00 AM',
      sunset: daily[0]?.sunset || '07:30 PM',
      airQuality: aqiData,
      todayMax: daily[0]?.tempMax || current.temperature_2m,
      todayMin: daily[0]?.tempMin || current.apparent_temperature,
    },
    hourly,
    daily,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

// ==========================================================================
// 5. UI RENDERING & DOM UPDATES
// ==========================================================================

/**
 * Update the dynamic atmospheric background and particle animations.
 */
function updateDynamicBackground(bgClass) {
  elements.weatherBg.className = `weather-bg ${bgClass}`;

  // Clear existing particles
  elements.particlesContainer.innerHTML = '';

  if (bgClass === 'bg-rain' || bgClass === 'bg-storm') {
    // Generate rain particles
    for (let i = 0; i < 25; i++) {
      const drop = document.createElement('div');
      drop.className = 'particle rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.6 + Math.random() * 0.6}s`;
      drop.style.animationDelay = `${Math.random() * 1.5}s`;
      elements.particlesContainer.appendChild(drop);
    }
  } else if (bgClass === 'bg-snow') {
    // Generate snow particles
    for (let i = 0; i < 20; i++) {
      const flake = document.createElement('div');
      flake.className = 'particle snow-flake';
      const size = 3 + Math.random() * 4;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${3 + Math.random() * 3}s`;
      flake.style.animationDelay = `${Math.random() * 2}s`;
      elements.particlesContainer.appendChild(flake);
    }
  }
}

/**
 * Render complete weather data to the dashboard.
 */
function renderWeatherDashboard(data) {
  const { location, current, hourly, daily, lastUpdated } = data;
  const unit = state.unit;

  // Background
  updateDynamicBackground(current.bgClass);

  // Current Card
  elements.cityName.textContent = location.name;
  elements.countryBadge.textContent = location.country || 'Global';
  elements.lastUpdatedText.textContent = `Updated ${lastUpdated}`;
  elements.currentTemp.textContent = convertTemp(current.temp, unit);
  elements.currentUnit.textContent = `°${unit}`;
  elements.weatherCondition.textContent = current.condition;
  elements.feelsLikeTemp.textContent = formatTempString(current.feelsLike, unit);
  elements.todayMaxTemp.textContent = formatTempString(current.todayMax, unit);
  elements.todayMinTemp.textContent = formatTempString(current.todayMin, unit);
  elements.mainWeatherIcon.className = `${current.iconClass} weather-hero-icon`;
  elements.miniHumidity.textContent = `${current.humidity}%`;
  elements.miniWind.textContent = `${current.windSpeed} km/h`;

  // Favorite button active check
  const isFav = state.favorites.some(f => f.toLowerCase() === location.name.toLowerCase());
  elements.favoriteBtn.classList.toggle('active', isFav);
  elements.favoriteBtn.innerHTML = isFav 
    ? '<i class="fa-solid fa-bookmark text-amber"></i>' 
    : '<i class="fa-regular fa-bookmark"></i>';

  // Statistics
  elements.statFeelsLike.textContent = formatTempString(current.feelsLike, unit);
  elements.statFeelsHint.textContent = current.feelsLike > current.temp ? 'Feels warmer than actual' : 'Feels cooler due to breeze';
  elements.statHumidity.textContent = `${current.humidity}%`;
  elements.humidityBar.style.width = `${Math.min(100, current.humidity)}%`;
  elements.statHumidityHint.textContent = current.humidity > 70 ? 'Humid air' : current.humidity < 30 ? 'Dry air' : 'Comfortable humidity';
  elements.statWindSpeed.textContent = current.windSpeed;
  elements.statWindDirection.textContent = `Direction ${current.windDirection}°`;
  elements.windCompassIcon.style.transform = `rotate(${current.windDirection}deg)`;
  elements.statVisibility.textContent = current.visibility.toFixed(1);
  elements.statPressure.textContent = current.pressure;

  // UV Index
  elements.statUvIndex.textContent = current.uvIndex;
  let uvLabel = 'Low';
  let uvBadgeClass = 'badge-emerald';
  if (current.uvIndex >= 3 && current.uvIndex < 6) { uvLabel = 'Moderate'; uvBadgeClass = 'badge-amber'; }
  else if (current.uvIndex >= 6) { uvLabel = 'High'; uvBadgeClass = 'badge-rose'; }
  elements.statUvBadge.textContent = uvLabel;
  elements.statUvBadge.className = `badge-pill ${uvBadgeClass}`;

  // Air Quality
  elements.statAqiValue.textContent = current.airQuality.aqi;
  elements.statAqiBadge.textContent = current.airQuality.label;

  // Sunrise & Sunset
  elements.statSunrise.textContent = current.sunrise;
  elements.statSunset.textContent = current.sunset;

  // Render Hourly Forecast
  elements.hourlyTrack.innerHTML = '';
  hourly.forEach(h => {
    const hourlyCard = document.createElement('div');
    hourlyCard.className = 'hourly-card';
    hourlyCard.innerHTML = `
      <span class="hourly-time">${h.time}</span>
      <i class="${h.iconClass} hourly-icon"></i>
      <span class="hourly-temp">${formatTempString(h.temp, unit)}</span>
      <span class="hourly-pop"><i class="fa-solid fa-droplet"></i> ${h.pop}%</span>
    `;
    elements.hourlyTrack.appendChild(hourlyCard);
  });

  // Render 5-Day Forecast
  elements.dailyForecastGrid.innerHTML = '';
  daily.forEach(d => {
    const dailyCard = document.createElement('div');
    dailyCard.className = 'daily-card';
    dailyCard.innerHTML = `
      <div class="daily-header">
        <div>
          <h4 class="daily-name">${d.dayName}</h4>
          <span class="daily-date">${d.formattedDate}</span>
        </div>
        <div class="daily-icon-box">
          <i class="${d.iconClass}"></i>
        </div>
      </div>
      <div class="daily-condition">${d.condition}</div>
      <div class="daily-pop">
        <i class="fa-solid fa-droplet"></i> ${d.pop}% rain
      </div>
      <div class="daily-temp-row">
        <span class="text-sky"><i class="fa-solid fa-arrow-down"></i> ${formatTempString(d.tempMin, unit)}</span>
        <span class="text-rose"><i class="fa-solid fa-arrow-up"></i> ${formatTempString(d.tempMax, unit)}</span>
      </div>
    `;
    elements.dailyForecastGrid.appendChild(dailyCard);
  });
}

// ==========================================================================
// 6. SEARCH, HISTORY, & FAVORITES HANDLERS
// ==========================================================================

/**
 * Perform search for a city by query string or coordinate object.
 */
async function performSearch(queryOrCoords) {
  setLoading(true);
  clearError();

  try {
    let location;
    if (typeof queryOrCoords === 'string') {
      location = await geocodeCity(queryOrCoords);
    } else {
      location = queryOrCoords;
    }

    const weatherData = await fetchWeatherData(location);
    state.currentWeather = weatherData;

    // Render data
    renderWeatherDashboard(weatherData);

    // Save to recents
    addToRecentSearches(location.name);
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, JSON.stringify(location));
  } catch (error) {
    showError(error.message || 'Could not fetch weather data.');
  } finally {
    setLoading(false);
  }
}

/**
 * Add a city to local storage recent searches.
 */
function addToRecentSearches(cityName) {
  if (!cityName) return;
  const filtered = state.recentSearches.filter(
    name => name.toLowerCase() !== cityName.toLowerCase()
  );
  state.recentSearches = [cityName, ...filtered].slice(0, CONFIG.MAX_RECENT_SEARCHES);
  localStorage.setItem(CONFIG.STORAGE_KEYS.RECENTS, JSON.stringify(state.recentSearches));
  renderRecentSearches();
}

/**
 * Render recent searches chips.
 */
function renderRecentSearches() {
  elements.recentChipsList.innerHTML = '';
  if (state.recentSearches.length === 0) {
    elements.clearHistoryBtn.classList.add('hidden');
    return;
  }

  elements.clearHistoryBtn.classList.remove('hidden');
  state.recentSearches.forEach(city => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'recent-chip';
    chip.textContent = city;
    chip.addEventListener('click', () => performSearch(city));
    elements.recentChipsList.appendChild(chip);
  });
}

/**
 * Toggle favorite status of current city.
 */
function toggleFavoriteCity() {
  if (!state.currentWeather) return;
  const cityName = state.currentWeather.location.name;
  const exists = state.favorites.includes(cityName);

  if (exists) {
    state.favorites = state.favorites.filter(c => c !== cityName);
    showToast(`Removed ${cityName} from favorites`);
  } else {
    state.favorites.push(cityName);
    showToast(`Saved ${cityName} to favorites!`);
  }

  localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
  renderWeatherDashboard(state.currentWeather);
}

// ==========================================================================
// 7. GEOLOCATION HANDLER
// ==========================================================================

function handleGetLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  setLoading(true);
  clearError();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const loc = await reverseGeocodeCoords(latitude, longitude);
        await performSearch(loc);
        showToast(`Loaded weather for your coordinates (${loc.name})!`);
      } catch (err) {
        showError('Could not obtain weather for your location coordinates.');
        setLoading(false);
      }
    },
    (geoError) => {
      setLoading(false);
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          showError('Location permission denied. You can still search for any city.');
          break;
        case geoError.POSITION_UNAVAILABLE:
          showError('Location information is unavailable.');
          break;
        case geoError.TIMEOUT:
          showError('Location request timed out. Please try searching manually.');
          break;
        default:
          showError('An unknown error occurred while retrieving location.');
      }
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

// ==========================================================================
// 8. UNIT & THEME TOGGLES
// ==========================================================================

function toggleTemperatureUnit() {
  state.unit = state.unit === 'C' ? 'F' : 'C';
  localStorage.setItem(CONFIG.STORAGE_KEYS.UNIT, state.unit);

  elements.unitCLabel.className = state.unit === 'C' ? 'unit-active' : 'unit-inactive';
  elements.unitFLabel.className = state.unit === 'F' ? 'unit-active' : 'unit-inactive';

  if (state.currentWeather) {
    renderWeatherDashboard(state.currentWeather);
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, state.theme);
  applyTheme(state.theme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('theme-dark');
    elements.themeIcon.className = 'fa-solid fa-sun';
  } else {
    document.body.classList.remove('theme-dark');
    elements.themeIcon.className = 'fa-solid fa-moon';
  }
}

// ==========================================================================
// 9. UI FEEDBACK (LOADING, ERROR, TOAST, SHARE)
// ==========================================================================

function setLoading(isLoading) {
  state.isLoading = isLoading;
  elements.loadingSpinner.classList.toggle('hidden', !isLoading);
  elements.weatherDashboard.style.opacity = isLoading ? '0.4' : '1';
  elements.searchSubmitBtn.disabled = isLoading;
}

function showError(msg) {
  elements.errorMessage.textContent = msg;
  elements.errorBanner.classList.remove('hidden');
}

function clearError() {
  elements.errorBanner.classList.add('hidden');
}

function showToast(msg) {
  elements.toastMessage.textContent = msg;
  elements.toast.classList.remove('hidden');
  setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3000);
}

async function handleShareWeather() {
  if (!state.currentWeather) return;
  const { location, current } = state.currentWeather;
  const summary = `Weather in ${location.name}, ${location.country}: ${formatTempString(current.temp, state.unit)}, ${current.condition}. Feels like ${formatTempString(current.feelsLike, state.unit)}.`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Weather in ${location.name}`,
        text: summary,
        url: window.location.href,
      });
      showToast('Shared successfully!');
      return;
    } catch {
      // fallback
    }
  }

  try {
    await navigator.clipboard.writeText(summary);
    showToast('Weather info copied to clipboard!');
  } catch {
    showToast('Could not copy to clipboard.');
  }
}

// ==========================================================================
// 10. EVENT LISTENERS INITIALIZATION
// ==========================================================================

function setupEventListeners() {
  // Search Form Submission
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = elements.cityInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  // Clear Search Input Button
  elements.cityInput.addEventListener('input', () => {
    elements.clearSearchBtn.classList.toggle('hidden', !elements.cityInput.value.trim());
    clearError();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.cityInput.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.cityInput.focus();
  });

  // Location Buttons
  elements.navLocationBtn.addEventListener('click', handleGetLocation);
  elements.geoLocationBtn.addEventListener('click', handleGetLocation);

  // Unit & Theme Buttons
  elements.unitToggleBtn.addEventListener('click', toggleTemperatureUnit);
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  elements.shareBtn.addEventListener('click', handleShareWeather);

  // Favorite Button
  elements.favoriteBtn.addEventListener('click', toggleFavoriteCity);

  // Clear Error
  elements.closeErrorBtn.addEventListener('click', clearError);

  // Clear History
  elements.clearHistoryBtn.addEventListener('click', () => {
    state.recentSearches = [];
    localStorage.removeItem(CONFIG.STORAGE_KEYS.RECENTS);
    renderRecentSearches();
    showToast('Recent searches cleared.');
  });

  // Popular City Chips
  document.querySelectorAll('.popular-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const city = btn.getAttribute('data-city');
      if (city) performSearch(city);
    });
  });

  // Hourly Scroll Controls
  elements.hourlyScrollLeft.addEventListener('click', () => {
    elements.hourlyTrack.scrollBy({ left: -280, behavior: 'smooth' });
  });
  elements.hourlyScrollRight.addEventListener('click', () => {
    elements.hourlyTrack.scrollBy({ left: 280, behavior: 'smooth' });
  });
}

// ==========================================================================
// 11. BOOTSTRAP APPLICATION
// ==========================================================================

function initApp() {
  applyTheme(state.theme);
  renderRecentSearches();
  setupEventListeners();

  // Load last searched city or default
  const savedCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);
  if (savedCity) {
    try {
      const parsed = JSON.parse(savedCity);
      performSearch(parsed);
      return;
    } catch {
      // fallback
    }
  }

  performSearch(CONFIG.DEFAULT_CITY);
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
