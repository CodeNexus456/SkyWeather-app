import React from 'react';
import { CurrentWeather, TemperatureUnit } from '../types';
import { formatTemp } from '../services/weatherService';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Sun,
  Activity,
  Compass
} from 'lucide-react';

interface WeatherStatsProps {
  current: CurrentWeather;
  unit: TemperatureUnit;
}

export const WeatherStats: React.FC<WeatherStatsProps> = ({ current, unit }) => {
  // Calculate approximate percentage for sun arc if within sunrise and sunset
  const getSunProgressPercentage = (): number => {
    try {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      // Parse sunrise/sunset like "06:15 AM" or "18:45"
      const parseTimeToMinutes = (timeStr: string) => {
        const [timePart, modifier] = timeStr.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const riseMinutes = parseTimeToMinutes(current.sunrise);
      const setMinutes = parseTimeToMinutes(current.sunset);

      if (nowMinutes <= riseMinutes) return 0;
      if (nowMinutes >= setMinutes) return 100;
      const progress = ((nowMinutes - riseMinutes) / (setMinutes - riseMinutes)) * 100;
      return Math.min(100, Math.max(0, Math.round(progress)));
    } catch {
      return 50;
    }
  };

  const sunProgress = getSunProgressPercentage();

  return (
    <section className="w-full my-6">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3.5 flex items-center gap-2">
        <Activity className="w-4 h-4 text-sky-500" />
        Weather Details & Statistics
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Feels Like Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Feels Like</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formatTemp(current.feelsLike, unit)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {current.feelsLike > current.temp ? 'Feels warmer than actual' : current.feelsLike < current.temp ? 'Feels cooler due to wind' : 'Similar to actual temp'}
          </p>
        </div>

        {/* Humidity Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Humidity</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {current.humidity}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, current.humidity)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {current.humidity > 70 ? 'High humidity' : current.humidity < 30 ? 'Dry air' : 'Comfortable humidity'}
          </p>
        </div>

        {/* Wind Speed Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Wind Speed</span>
            <Wind className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
            <span>{current.windSpeed}</span>
            <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <Compass
              className="w-3.5 h-3.5 text-teal-500"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
            <span>Direction {current.windDirection}°</span>
          </div>
        </div>

        {/* Visibility Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Visibility</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
            <span>{current.visibility}</span>
            <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {current.visibility >= 10 ? 'Clear view' : current.visibility >= 5 ? 'Moderate visibility' : 'Fog or haze'}
          </p>
        </div>

        {/* Pressure Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pressure</span>
            <Gauge className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
            <span>{current.pressure}</span>
            <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {current.pressure > 1013 ? 'High pressure (Fair)' : 'Low pressure (Unsettled)'}
          </p>
        </div>

        {/* UV Index Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">UV Index</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>{current.uvIndex}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              current.uvIndex < 3 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                : current.uvIndex < 6 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' 
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              {current.uvLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {current.uvIndex >= 6 ? 'Sun protection required' : 'Low danger for average person'}
          </p>
        </div>

        {/* Air Quality Index Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Air Quality (AQI)</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>{current.airQuality?.aqi ?? 28}</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {current.airQuality?.label ?? 'Good'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>PM2.5: {current.airQuality?.pm25 ?? 8} µg/m³</span>
          </div>
        </div>

        {/* Sunrise & Sunset Arc Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Sun Cycle</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>

          {/* Visual Progress Line */}
          <div className="my-2">
            <div className="w-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 h-1.5 rounded-full relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full shadow-md"
                style={{ left: `calc(${sunProgress}% - 7px)` }}
                title={`Sun progress: ${sunProgress}%`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 mt-1">
            <div className="flex items-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>{current.sunrise}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-indigo-400" />
              <span>{current.sunset}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
