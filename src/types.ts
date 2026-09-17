export type WeatherConditionType = 
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'night';

export type TemperatureUnit = 'C' | 'F';

export interface WeatherLocation {
  name: string;
  country: string;
  admin?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface AirQuality {
  aqi: number;
  label: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor';
  pm25: number;
  pm10: number;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionType: WeatherConditionType;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number; // in km
  uvIndex: number;
  uvLabel: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  isDay: boolean;
  sunrise: string;
  sunset: string;
  rainProbability: number;
  airQuality?: AirQuality;
}

export interface HourlyForecast {
  time: string;
  hourNum: number;
  temp: number;
  condition: string;
  conditionType: WeatherConditionType;
  precipitationProb: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  day: string;
  formattedDate: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  conditionType: WeatherConditionType;
  precipitationProb: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  lastUpdated: string;
}

export interface SearchHistoryItem {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  temp?: number;
  conditionType?: WeatherConditionType;
  timestamp: number;
}

export interface FavoriteItem {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}
