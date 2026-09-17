import React from 'react';
import { 
  CloudSun, 
  MapPin, 
  Moon, 
  Sun, 
  Share2, 
  Key, 
  RefreshCw,
  Bookmark
} from 'lucide-react';
import { TemperatureUnit } from '../types';

interface NavbarProps {
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onUseLocation: () => void;
  isLoadingLocation: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onShare: () => void;
  onOpenSettings: () => void;
  onToggleFavoritesDrawer: () => void;
  favoriteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  unit,
  onToggleUnit,
  isDarkTheme,
  onToggleTheme,
  onUseLocation,
  isLoadingLocation,
  onRefresh,
  isRefreshing,
  onShare,
  onOpenSettings,
  onToggleFavoritesDrawer,
  favoriteCount,
}) => {
  return (
    <header className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Weather App
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Real-time forecast & radar
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location Quick Button */}
          <button
            id="navbar-use-location-btn"
            onClick={onUseLocation}
            disabled={isLoadingLocation}
            title="Use current location"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <MapPin className={`w-3.5 h-3.5 text-sky-500 ${isLoadingLocation ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">My Location</span>
          </button>

          {/* Refresh button */}
          <button
            id="navbar-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh weather data"
            aria-label="Refresh weather data"
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </button>

          {/* Favorites quick toggle */}
          <button
            id="navbar-favorites-btn"
            onClick={onToggleFavoritesDrawer}
            title="Saved Cities"
            aria-label="Saved Cities"
            className="relative p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Temperature Unit Toggle (°C / °F) */}
          <button
            id="navbar-unit-toggle"
            onClick={onToggleUnit}
            title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <span className={unit === 'C' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'}>°C</span>
            <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
            <span className={unit === 'F' ? 'text-sky-600 dark:text-sky-400 font-extrabold' : 'text-slate-400'}>°F</span>
          </button>

          {/* Share Button */}
          <button
            id="navbar-share-btn"
            onClick={onShare}
            title="Share Weather"
            aria-label="Share Weather"
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer hidden sm:flex"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            id="navbar-theme-btn"
            onClick={onToggleTheme}
            title={isDarkTheme ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* API Key Modal Button */}
          <button
            id="navbar-api-key-btn"
            onClick={onOpenSettings}
            title="API Key Configuration"
            aria-label="API Key Configuration"
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Key className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
