import React from 'react';
import { CloudSun, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 py-8 border-t border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-colors text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Attribution */}
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-sky-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Weather App
          </span>
          <span>•</span>
          <span>Powered by Open-Meteo & OpenWeatherMap</span>
        </div>

        {/* Feature Highlights */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Real-Time Radar & AQI</span>
          </span>
          <span>•</span>
          <span>Responsive Dashboard</span>
        </div>
      </div>
    </footer>
  );
};
