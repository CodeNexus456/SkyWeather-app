import React from 'react';
import { DailyForecast, TemperatureUnit } from '../types';
import { formatTemp } from '../services/weatherService';
import { WeatherIcon } from './WeatherIcon';
import { Calendar, Droplets, ArrowUp, ArrowDown } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecast[];
  unit: TemperatureUnit;
}

export const DailyForecastSection: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  if (!daily || daily.length === 0) return null;

  // Global min and max across all 5 days to normalize visual bars
  const minOfWeek = Math.min(...daily.map(d => d.tempMin));
  const maxOfWeek = Math.max(...daily.map(d => d.tempMax));
  const tempRange = Math.max(1, maxOfWeek - minOfWeek);

  return (
    <section className="w-full my-6">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3.5 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-sky-500" />
        5-Day Extended Forecast
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {daily.map((dayItem, idx) => {
          // Calculate bar fill offsets
          const leftPercent = Math.max(0, ((dayItem.tempMin - minOfWeek) / tempRange) * 100);
          const rightPercent = Math.min(100, ((dayItem.tempMax - minOfWeek) / tempRange) * 100);
          const barWidth = Math.max(15, rightPercent - leftPercent);

          return (
            <div
              key={`${dayItem.date}-${idx}`}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
            >
              {/* Header: Day & Date */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                    {dayItem.day}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {dayItem.formattedDate}
                  </span>
                </div>

                {/* Weather icon */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 group-hover:scale-110 transition-transform">
                  <WeatherIcon
                    type={dayItem.conditionType}
                    isDay={true}
                    className="w-6 h-6"
                  />
                </div>
              </div>

              {/* Condition text */}
              <div className="my-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  {dayItem.condition}
                </span>

                {/* Rain probability */}
                <div className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 mt-1">
                  <Droplets className="w-3 h-3" />
                  <span>{dayItem.precipitationProb}% rain</span>
                </div>
              </div>

              {/* High & Low Temp Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center text-sky-500">
                    <ArrowDown className="w-3 h-3 mr-0.5" />
                    {formatTemp(dayItem.tempMin, unit)}
                  </span>
                  <span className="flex items-center text-rose-500">
                    <ArrowUp className="w-3 h-3 mr-0.5" />
                    {formatTemp(dayItem.tempMax, unit)}
                  </span>
                </div>

                {/* Normalized visual temperature range bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full relative overflow-hidden">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
