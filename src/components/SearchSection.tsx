import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  X, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { WeatherLocation, SearchHistoryItem } from '../types';
import { searchLocations } from '../services/weatherService';

interface SearchSectionProps {
  onSelectLocation: (loc: WeatherLocation) => void;
  onUseMyLocation: () => void;
  isLoading: boolean;
  isLoadingLocation: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  recentSearches: SearchHistoryItem[];
  onRemoveRecent: (id: string) => void;
  onClearAllRecents: () => void;
}

const POPULAR_CITIES: WeatherLocation[] = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5085, longitude: -0.1257 },
  { name: 'New York', country: 'United States', latitude: 40.7143, longitude: -74.006 },
  { name: 'Paris', country: 'France', latitude: 48.8534, longitude: 2.3488 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8678, longitude: 151.2073 },
];

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSelectLocation,
  onUseMyLocation,
  isLoading,
  isLoadingLocation,
  errorMessage,
  onClearError,
  recentSearches,
  onRemoveRecent,
  onClearAllRecents,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<WeatherLocation[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions dropdown
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpenSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const results = await searchLocations(query);
        setSuggestions(results);
        setIsOpenSuggestions(true);
      } catch {
        // quiet error for auto-suggestions
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpenSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    onClearError();
    setIsSearchingSuggestions(true);
    try {
      const results = await searchLocations(trimmed);
      if (results.length > 0) {
        onSelectLocation(results[0]);
        setIsOpenSuggestions(false);
        setQuery('');
      } else {
        // Fallback location for exact search or trigger error
        throw new Error(`City "${trimmed}" not found. Please check spelling or try another city.`);
      }
    } catch (err: any) {
      // Pass error up
      onClearError();
      setTimeout(() => {
        // Handled via parent error state
      }, 50);
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (loc: WeatherLocation) => {
    onSelectLocation(loc);
    setIsOpenSuggestions(false);
    setQuery('');
  };

  return (
    <section className="w-full max-w-4xl mx-auto mb-6">
      {/* Search Input Bar */}
      <div className="relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
            <input
              id="city-search-input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMessage) onClearError();
              }}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpenSuggestions(true);
              }}
              placeholder="Search for a city or country (e.g. Tokyo, Paris, Chicago)..."
              disabled={isLoading}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 shadow-sm transition-all disabled:opacity-60"
            />
            {query && (
              <button
                type="button"
                id="search-clear-btn"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setIsOpenSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            id="search-submit-btn"
            disabled={isLoading || isSearchingSuggestions || !query.trim()}
            className="px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm sm:text-base shadow-sm hover:shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isSearchingSuggestions ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Location button */}
          <button
            type="button"
            id="use-my-location-btn"
            onClick={onUseMyLocation}
            disabled={isLoadingLocation}
            title="Use My Location"
            className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <MapPin className={`w-5 h-5 text-sky-500 ${isLoadingLocation ? 'animate-bounce' : ''}`} />
          </button>
        </form>

        {/* Live Search Suggestions Dropdown */}
        {isOpenSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-40 overflow-hidden">
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Suggestions
            </div>
            {suggestions.map((loc, idx) => (
              <button
                key={`${loc.name}-${loc.latitude}-${idx}`}
                id={`suggestion-item-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(loc)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-sky-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {loc.name}
                    </span>
                    {loc.admin && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                        {loc.admin},
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      {loc.country}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Select</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div
          id="search-error-banner"
          className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-sm shadow-sm animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onClearError}
            className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent Searches & Popular Quick Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 text-slate-400 font-medium mr-1">
              <Clock className="w-3.5 h-3.5" /> Recent:
            </span>
            {recentSearches.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="group inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-white/70 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => onSelectLocation({
                    name: item.name,
                    country: item.country,
                    latitude: item.latitude,
                    longitude: item.longitude,
                  })}
                  className="font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 cursor-pointer"
                >
                  {item.name}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecent(item.id);
                  }}
                  title="Remove from recents"
                  className="p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 cursor-pointer opacity-70 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {recentSearches.length > 1 && (
              <button
                type="button"
                onClick={onClearAllRecents}
                className="text-[11px] text-slate-400 hover:text-rose-500 underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Popular Cities Quick Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs ml-auto">
          <span className="text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Popular:
          </span>
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectLocation(city)}
              className="px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 text-slate-600 dark:text-slate-300 font-medium transition-colors cursor-pointer"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
