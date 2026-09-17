import React, { useRef } from 'react';
import { HourlyForecast, TemperatureUnit } from '../types';
import { formatTemp } from '../services/weatherService';
import { WeatherIcon } from './WeatherIcon';
import { Clock, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';

interface HourlyForecastStripProps {
  hourly: HourlyForecast[];
  unit: TemperatureUnit;
}

export const HourlyForecastStrip: React.FC<HourlyForecastStripProps> = ({ hourly, unit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!hourly || hourly.length === 0) return null;

  return (
    <section className="w-full my-6">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          Hourly Forecast (24 Hours)
        </h2>

        {/* Scroll navigation arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Scroll left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Scroll right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Strip */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
      >
        {hourly.map((h, idx) => (
          <div
            key={`${h.time}-${idx}`}
            className="flex flex-col items-center justify-between min-w-[84px] py-3.5 px-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all shrink-0"
          >
            {/* Time label */}
            <span className={`text-xs font-semibold ${idx === 0 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {h.time}
            </span>

            {/* Weather icon */}
            <div className="my-2.5">
              <WeatherIcon
                type={h.conditionType}
                isDay={h.isDay}
                className="w-7 h-7"
              />
            </div>

            {/* Temp */}
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatTemp(h.temp, unit)}
            </span>

            {/* Precipitation % */}
            <div className="flex items-center gap-0.5 mt-2 text-[10px] text-sky-600 dark:text-sky-400 font-medium">
              <Droplets className="w-2.5 h-2.5" />
              <span>{h.precipitationProb}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
