import React, { useMemo } from 'react';
import { WeatherConditionType } from '../types';

interface WeatherBackgroundProps {
  condition: WeatherConditionType;
  isDarkTheme: boolean;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition, isDarkTheme }) => {
  // Generate random particles for rain/snow/stars
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 1.5 + Math.random() * 2.5,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  const getThemeBackground = () => {
    switch (condition) {
      case 'clear':
        return isDarkTheme
          ? 'from-sky-950 via-slate-900 to-amber-950/40'
          : 'from-sky-400 via-sky-200 to-amber-100/60';
      case 'clouds':
        return isDarkTheme
          ? 'from-slate-900 via-gray-900 to-slate-950'
          : 'from-slate-300 via-sky-200 to-slate-100';
      case 'rain':
        return isDarkTheme
          ? 'from-slate-950 via-cyan-950 to-slate-900'
          : 'from-slate-500 via-sky-400 to-slate-300';
      case 'storm':
        return isDarkTheme
          ? 'from-gray-950 via-purple-950/80 to-slate-950'
          : 'from-slate-700 via-indigo-900 to-slate-800';
      case 'snow':
        return isDarkTheme
          ? 'from-slate-900 via-indigo-950 to-sky-950'
          : 'from-sky-200 via-slate-100 to-sky-50';
      case 'fog':
        return isDarkTheme
          ? 'from-slate-900 via-zinc-900 to-stone-900'
          : 'from-slate-300 via-stone-200 to-slate-200';
      case 'night':
      default:
        return 'from-slate-950 via-indigo-950 to-slate-900';
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000 bg-gradient-to-b ${getThemeBackground()} overflow-hidden`}>
      {/* Sunny Ray Ambient Glow */}
      {condition === 'clear' && (
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
      )}

      {/* Night Moon Glow */}
      {condition === 'night' && (
        <>
          <div className="absolute top-12 right-16 w-48 h-48 rounded-full bg-indigo-300/15 blur-2xl" />
          {/* Twinkling Stars */}
          {particles.slice(0, 25).map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white animate-ping"
              style={{
                left: `${p.left}%`,
                top: `${p.top * 0.7}%`,
                width: `${Math.max(1.5, p.size * 0.5)}px`,
                height: `${Math.max(1.5, p.size * 0.5)}px`,
                opacity: p.opacity,
                animationDuration: `${2 + p.delay}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Falling Rain drops */}
      {condition === 'rain' && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-0.5 bg-gradient-to-b from-transparent to-sky-300 rounded-full animate-rainfall"
              style={{
                left: `${p.left}%`,
                top: `-20px`,
                height: `${12 + p.size * 3}px`,
                opacity: p.opacity,
                animationDuration: `${0.8 + p.delay * 0.3}s`,
                animationDelay: `${p.delay * 0.4}s`,
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Drifting Snow flakes */}
      {condition === 'snow' && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/80 animate-snowfall blur-[0.5px]"
              style={{
                left: `${p.left}%`,
                top: `-10px`,
                width: `${p.size + 2}px`,
                height: `${p.size + 2}px`,
                opacity: p.opacity,
                animationDuration: `${3 + p.duration}s`,
                animationDelay: `${p.delay * 0.6}s`,
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Thunderstorm Ambient Glow Flash */}
      {condition === 'storm' && (
        <>
          <div className="absolute top-0 inset-x-0 h-96 bg-purple-500/10 blur-3xl animate-pulse" />
          <div className="absolute inset-0">
            {particles.slice(0, 25).map((p) => (
              <div
                key={p.id}
                className="absolute w-0.5 bg-gradient-to-b from-transparent to-cyan-200 rounded-full animate-rainfall"
                style={{
                  left: `${p.left}%`,
                  top: `-20px`,
                  height: `${18 + p.size * 4}px`,
                  opacity: 0.8,
                  animationDuration: `${0.6 + p.delay * 0.2}s`,
                  animationDelay: `${p.delay * 0.3}s`,
                  animationIterationCount: 'infinite',
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Fog / Mist Layers */}
      {condition === 'fog' && (
        <div className="absolute inset-0">
          <div className="absolute -bottom-10 inset-x-0 h-64 bg-slate-300/30 dark:bg-slate-700/30 blur-2xl animate-pulse" />
          <div className="absolute top-1/3 inset-x-0 h-48 bg-stone-200/20 dark:bg-stone-800/20 blur-3xl" />
        </div>
      )}

      {/* Clouds Overcast Drift */}
      {condition === 'clouds' && (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-8 left-10 w-96 h-40 rounded-full bg-white/30 dark:bg-slate-700/30 blur-3xl animate-pulse" />
          <div className="absolute top-28 right-12 w-80 h-36 rounded-full bg-slate-100/40 dark:bg-slate-600/20 blur-3xl" />
        </div>
      )}

      {/* Overlay noise / subtle vignette */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/25" />
    </div>
  );
};
