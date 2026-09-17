import { WeatherData, WeatherConditionType, TemperatureUnit, WeatherLocation } from '../types';

// Map WMO Weather Interpretation Codes (used by Open-Meteo) to condition types and descriptions
export function interpretWmoCode(code: number, isDay: boolean = true): { condition: string; type: WeatherConditionType } {
  if (code === 0) {
    return { condition: isDay ? 'Clear Sky' : 'Clear Night', type: isDay ? 'clear' : 'night' };
  }
  if (code === 1) {
    return { condition: isDay ? 'Mainly Clear' : 'Mainly Clear Night', type: isDay ? 'clear' : 'night' };
  }
  if (code === 2) {
    return { condition: 'Partly Cloudy', type: isDay ? 'clouds' : 'night' };
  }
  if (code === 3) {
    return { condition: 'Overcast', type: 'clouds' };
  }
  if (code === 45 || code === 48) {
    return { condition: 'Fog & Depositing Rime', type: 'fog' };
  }
  if (code >= 51 && code <= 55) {
    return { condition: 'Drizzle', type: 'rain' };
  }
  if (code >= 56 && code <= 57) {
    return { condition: 'Freezing Drizzle', type: 'snow' };
  }
  if (code >= 61 && code <= 65) {
    return { condition: code === 61 ? 'Slight Rain' : code === 63 ? 'Moderate Rain' : 'Heavy Rain', type: 'rain' };
  }
  if (code >= 66 && code <= 67) {
    return { condition: 'Freezing Rain', type: 'snow' };
  }
  if (code >= 71 && code <= 77) {
    return { condition: code === 71 ? 'Slight Snow' : code === 75 ? 'Heavy Snow' : 'Snow Grains', type: 'snow' };
  }
  if (code >= 80 && code <= 82) {
    return { condition: 'Rain Showers', type: 'rain' };
  }
  if (code >= 85 && code <= 86) {
    return { condition: 'Snow Showers', type: 'snow' };
  }
  if (code === 95) {
    return { condition: 'Thunderstorm', type: 'storm' };
  }
  if (code >= 96 && code <= 99) {
    return { condition: 'Thunderstorm with Hail', type: 'storm' };
  }
  return { condition: 'Moderate Weather', type: isDay ? 'clear' : 'night' };
}

export function getUvLabel(uv: number): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

export function getAqiLabel(aqi: number): 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' {
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  return 'Very Poor';
}

export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  return `${convertTemp(celsius, unit)}°${unit}`;
}

// Search locations via Open-Meteo Geocoding
export async function searchLocations(query: string): Promise<WeatherLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Could not connect to geocoding service. Please check your connection.');
  }

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.map((item: any) => ({
    name: item.name,
    country: item.country || item.country_code || '',
    admin: item.admin1 || '',
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
}

// Reverse geocode latitude/longitude to city and country
export async function reverseGeocode(lat: number, lon: number): Promise<WeatherLocation> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || data.countryCode || '';
      return {
        name,
        country,
        latitude: lat,
        longitude: lon,
      };
    }
  } catch {
    // fallback
  }
  return {
    name: 'Local Position',
    country: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    latitude: lat,
    longitude: lon,
  };
}

// Fetch complete weather forecast using Open-Meteo (Free, reliable, no key needed)
export async function fetchWeatherByCoords(location: WeatherLocation): Promise<WeatherData> {
  const { latitude, longitude } = location;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,is_day,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto`;
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(airQualityUrl),
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error('Weather data could not be retrieved. Please try again.');
  }

  const wData = await weatherRes.value.json();
  let airQuality = undefined;

  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    try {
      const aData = await aqiRes.value.json();
      if (aData.current) {
        const aqiVal = Math.round(aData.current.european_aqi ?? 25);
        airQuality = {
          aqi: aqiVal,
          label: getAqiLabel(aqiVal),
          pm25: Math.round((aData.current.pm2_5 ?? 10) * 10) / 10,
          pm10: Math.round((aData.current.pm10 ?? 15) * 10) / 10,
        };
      }
    } catch {
      // AQI is supplementary
    }
  }

  const current = wData.current;
  const isDay = Boolean(current.is_day);
  const conditionInfo = interpretWmoCode(current.weather_code, isDay);

  // Hourly index: find the current hour in hourly array
  const now = new Date();
  const currentHourIso = now.toISOString().slice(0, 13);
  let startIdx = 0;
  if (wData.hourly && wData.hourly.time) {
    const found = wData.hourly.time.findIndex((t: string) => t.startsWith(currentHourIso));
    if (found !== -1) startIdx = found;
  }

  const hourly: any[] = [];
  if (wData.hourly && wData.hourly.time) {
    // Next 24 hours
    for (let i = startIdx; i < Math.min(startIdx + 24, wData.hourly.time.length); i++) {
      const timeStr = wData.hourly.time[i];
      const dateObj = new Date(timeStr);
      const hourNum = dateObj.getHours();
      const hourFormatted = dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const hIsDay = Boolean(wData.hourly.is_day[i]);
      const hCond = interpretWmoCode(wData.hourly.weather_code[i], hIsDay);

      hourly.push({
        time: i === startIdx ? 'Now' : hourFormatted,
        hourNum,
        temp: wData.hourly.temperature_2m[i],
        condition: hCond.condition,
        conditionType: hCond.type,
        precipitationProb: wData.hourly.precipitation_probability ? (wData.hourly.precipitation_probability[i] ?? 0) : 0,
        isDay: hIsDay,
      });
    }
  }

  // 5-Day / 7-Day Daily Forecast
  const daily: any[] = [];
  if (wData.daily && wData.daily.time) {
    const daysCount = Math.min(5, wData.daily.time.length);
    for (let i = 0; i < daysCount; i++) {
      const dateStr = wData.daily.time[i];
      const dObj = new Date(dateStr + 'T00:00:00');
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dObj.toLocaleDateString([], { weekday: 'short' });
      const formattedDate = dObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const dCond = interpretWmoCode(wData.daily.weather_code[i], true);

      // Sunrise & sunset times formatted
      const sunriseTime = wData.daily.sunrise[i] ? new Date(wData.daily.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
      const sunsetTime = wData.daily.sunset[i] ? new Date(wData.daily.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

      daily.push({
        date: dateStr,
        day: dayName,
        formattedDate,
        tempMax: wData.daily.temperature_2m_max[i],
        tempMin: wData.daily.temperature_2m_min[i],
        condition: dCond.condition,
        conditionType: dCond.type,
        precipitationProb: wData.daily.precipitation_probability_max ? (wData.daily.precipitation_probability_max[i] ?? 0) : 0,
        uvIndexMax: wData.daily.uv_index_max ? Math.round(wData.daily.uv_index_max[i]) : 3,
        sunrise: sunriseTime,
        sunset: sunsetTime,
      });
    }
  }

  // Current UV and visibility from hourly
  const currentVisibilityMeters = wData.hourly?.visibility ? wData.hourly.visibility[startIdx] ?? 10000 : 10000;
  const currentVisibilityKm = Math.round((currentVisibilityMeters / 1000) * 10) / 10;
  const currentUv = wData.hourly?.uv_index ? Math.round(wData.hourly.uv_index[startIdx] ?? 3) : 3;

  const todaySunrise = daily[0]?.sunrise || '06:00 AM';
  const todaySunset = daily[0]?.sunset || '07:30 PM';

  return {
    location,
    current: {
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      condition: conditionInfo.condition,
      conditionType: conditionInfo.type,
      conditionCode: current.weather_code,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirection: current.wind_direction_10m,
      pressure: Math.round(current.surface_pressure),
      visibility: currentVisibilityKm,
      uvIndex: currentUv,
      uvLabel: getUvLabel(currentUv),
      isDay,
      sunrise: todaySunrise,
      sunset: todaySunset,
      rainProbability: hourly[0]?.precipitationProb ?? 0,
      airQuality,
    },
    hourly,
    daily,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
