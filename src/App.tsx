import React, { useState, useEffect, useCallback } from 'react';
import { 
  WeatherData, 
  WeatherLocation, 
  TemperatureUnit, 
  SearchHistoryItem, 
  FavoriteItem 
} from './types';
import { 
  fetchWeatherByCoords, 
  reverseGeocode, 
  formatTemp 
} from './services/weatherService';
import { WeatherBackground } from './components/WeatherBackground';
import { Navbar } from './components/Navbar';
import { SearchSection } from './components/SearchSection';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherStats } from './components/WeatherStats';
import { HourlyForecastStrip } from './components/HourlyForecast';
import { DailyForecastSection } from './components/DailyForecast';
import { FavoritesModal } from './components/FavoritesModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Footer } from './components/Footer';
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const DEFAULT_LOCATION: WeatherLocation = {
  name: 'London',
  country: 'United Kingdom',
  admin: 'England',
  latitude: 51.5085,
  longitude: -0.1257,
};

const STORAGE_KEYS = {
  UNIT: 'weather_app_unit',
  THEME: 'weather_app_theme',
  RECENTS: 'weather_app_recent_searches',
  FAVORITES: 'weather_app_favorites',
  API_KEY: 'weather_app_api_key',
  LAST_LOC: 'weather_app_last_location',
};

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings & Preferences
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem(STORAGE_KEYS.UNIT) as TemperatureUnit) || 'C';
  });

  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  });

  // Modals
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  // Sync Dark class to <html>
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Persist Unit
  const handleToggleUnit = () => {
    setUnit(prev => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem(STORAGE_KEYS.UNIT, next);
      return next;
    });
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3000);
  };

  // Add to Recent Searches
  const saveRecentSearch = useCallback((loc: WeatherLocation, currentTemp?: number, conditionType?: any) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => 
        item.name.toLowerCase() !== loc.name.toLowerCase() ||
        Math.abs(item.latitude - loc.latitude) > 0.05
      );
      const newItem: SearchHistoryItem = {
        id: `${loc.name}-${Date.now()}`,
        name: loc.name,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        temp: currentTemp,
        conditionType,
        timestamp: Date.now(),
      };
      const updated = [newItem, ...filtered].slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fetch Weather Data for a location
  const loadWeatherForLocation = useCallback(async (location: WeatherLocation, isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const data = await fetchWeatherByCoords(location);
      setWeather(data);
      saveRecentSearch(location, data.current.temp, data.current.conditionType);
      localStorage.setItem(STORAGE_KEYS.LAST_LOC, JSON.stringify(location));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve weather data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [saveRecentSearch]);

  // Use My Location (Geolocation)
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const loc = await reverseGeocode(latitude, longitude);
          await loadWeatherForLocation(loc);
          showToast(`Weather updated for your current location (${loc.name})!`);
        } catch {
          setErrorMessage('Could not determine city name for your coordinates.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (geoError) => {
        setIsLoadingLocation(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setErrorMessage('Location permission was denied. You can still search for any city.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is currently unavailable.');
            break;
          case geoError.TIMEOUT:
            setErrorMessage('Location request timed out. Please try again or search manually.');
            break;
          default:
            setErrorMessage('An unexpected location error occurred.');
            break;
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [loadWeatherForLocation]);

  // Initial Boot: Check last stored location, or default
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem(STORAGE_KEYS.LAST_LOC);
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        loadWeatherForLocation(parsed);
        return;
      }
    } catch {
      // ignore
    }
    // Fallback to default
    loadWeatherForLocation(DEFAULT_LOCATION);
  }, [loadWeatherForLocation]);

  // Toggle Favorite for currently viewed location
  const handleToggleFavorite = () => {
    if (!weather) return;
    const { location } = weather;
    const isAlreadyFav = favorites.some(f => f.name.toLowerCase() === location.name.toLowerCase());

    if (isAlreadyFav) {
      const updated = favorites.filter(f => f.name.toLowerCase() !== location.name.toLowerCase());
      setFavorites(updated);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      showToast(`Removed ${location.name} from favorites.`);
    } else {
      const newFav: FavoriteItem = {
        id: `${location.name}-${Date.now()}`,
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      showToast(`Saved ${location.name} to favorites!`);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  };

  // Remove individual recent search
  const handleRemoveRecent = (id: string) => {
    const updated = recentSearches.filter(r => r.id !== id);
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
  };

  // Clear all recents
  const handleClearAllRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEYS.RECENTS);
    showToast('Search history cleared.');
  };

  // Share Weather
  const handleShareWeather = async () => {
    if (!weather) return;
    const text = `Current weather in ${weather.location.name}, ${weather.location.country}: ${formatTemp(weather.current.temp, unit)}, ${weather.current.condition}. Feels like ${formatTemp(weather.current.feelsLike, unit)}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${weather.location.name}`,
          text,
          url: window.location.href,
        });
        showToast('Shared successfully!');
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('Weather info copied to clipboard!');
    } catch {
      showToast('Could not copy to clipboard.');
    }
  };

  // Save API key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
      showToast('Custom API Key saved.');
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
      showToast('Switched to default Open-Meteo API.');
    }
  };

  const currentConditionType = weather?.current.conditionType || 'clear';

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 relative font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Dynamic Atmospheric Animated Background */}
      <WeatherBackground condition={currentConditionType} isDarkTheme={isDarkTheme} />

      {/* Navbar / Header */}
      <Navbar
        unit={unit}
        onToggleUnit={handleToggleUnit}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme(prev => !prev)}
        onUseLocation={handleUseMyLocation}
        isLoadingLocation={isLoadingLocation}
        onRefresh={() => weather && loadWeatherForLocation(weather.location, true)}
        isRefreshing={isRefreshing}
        onShare={handleShareWeather}
        onOpenSettings={() => setIsApiKeyOpen(true)}
        onToggleFavoritesDrawer={() => setIsFavoritesOpen(true)}
        favoriteCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* Search Bar, Suggestions & Recent Chips */}
        <SearchSection
          onSelectLocation={(loc) => loadWeatherForLocation(loc)}
          onUseMyLocation={handleUseMyLocation}
          isLoading={isLoading}
          isLoadingLocation={isLoadingLocation}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          recentSearches={recentSearches}
          onRemoveRecent={handleRemoveRecent}
          onClearAllRecents={handleClearAllRecents}
        />

        {/* Loading Spinner */}
        {isLoading && !weather && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Fetching real-time weather data...</p>
          </div>
        )}

        {/* Weather Dashboard View */}
        {weather && (
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {/* Primary Current Weather Card */}
            <CurrentWeatherCard
              weather={weather}
              unit={unit}
              isFavorite={favorites.some(f => f.name.toLowerCase() === weather.location.name.toLowerCase())}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* 24-Hour Hourly Forecast Strip */}
            <HourlyForecastStrip
              hourly={weather.hourly}
              unit={unit}
            />

            {/* Detailed Weather Statistics Grid */}
            <WeatherStats
              current={weather.current}
              unit={unit}
            />

            {/* 5-Day Extended Forecast Cards */}
            <DailyForecastSection
              daily={weather.daily}
              unit={unit}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Saved Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectFavorite={(fav) => loadWeatherForLocation(fav)}
        onRemoveFavorite={handleRemoveFavorite}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-slideUp border border-white/10 dark:border-slate-800"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
