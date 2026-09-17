import React from 'react';
import { 
  WeatherData, 
  TemperatureUnit 
} from '../types';
import { formatTemp } from '../services/weatherService';
import { WeatherIcon } from './WeatherIcon';
import { 
  MapPin, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  Droplets, 
  Wind, 
  Compass, 
  CloudRain,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  unit: TemperatureUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  unit,
  isFavorite,
  onToggleFavorite,
}) => {
  const { location, current, daily, lastUpdated } = weather;
  const todayForecast = daily[0];

  return (
    <div 
      id="current-weather-card"
      className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-900/5 transition-all relative overflow-hidden"
    >
      {/* Subtle top decoration badge */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          <MapPin className="w-4 h-4 text-sky-500" />
          <span className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
            {location.name}
          </span>
          {location.admin && (
            <span className="hidden sm:inline text-slate-400">
              {location.admin},
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs">
            {location.country || 'Global'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mr-1 hidden sm:flex">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {lastUpdated}</span>
          </div>

          <button
            id="toggle-favorite-btn"
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            aria-label="Toggle favorite"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isFavorite
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-500 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-amber-500'
            }`}
          >
            {isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Temperature & Weather Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-4">
        {/* Left: Temperature & Conditions */}
        <div className="flex items-baseline gap-4 sm:gap-6">
          <div className="relative">
            <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white">
              {formatTemp(current.temp, unit).replace(`°${unit}`, '')}
            </span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-light text-sky-600 dark:text-sky-400 align-top ml-1">
              °{unit}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
              {current.condition}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Feels like <span className="font-semibold text-slate-700 dark:text-slate-200">{formatTemp(current.feelsLike, unit)}</span>
            </div>
            {todayForecast && (
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center text-rose-500">
                  <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                  {formatTemp(todayForecast.tempMax, unit)}
                </span>
                <span className="flex items-center text-sky-500">
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                  {formatTemp(todayForecast.tempMin, unit)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Condition Icon & Quick Highlight Badges */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-start md:justify-end gap-5">
          {/* Animated Condition Icon */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 flex items-center justify-center shadow-inner shrink-0">
            <WeatherIcon
              type={current.conditionType}
              conditionCode={current.conditionCode}
              isDay={current.isDay}
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-700/50">
              <Droplets className="w-4 h-4 text-sky-500" />
              <div>
                <div className="text-[11px] text-slate-400 leading-none">Humidity</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{current.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-700/50">
              <Wind className="w-4 h-4 text-teal-500" />
              <div>
                <div className="text-[11px] text-slate-400 leading-none">Wind</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{current.windSpeed} km/h</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-700/50">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-[11px] text-slate-400 leading-none">Precipitation</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{current.rainProbability}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-700/50">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-[11px] text-slate-400 leading-none">UV Index</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{current.uvIndex} ({current.uvLabel})</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
