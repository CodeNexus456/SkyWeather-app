import React from 'react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudSun, 
  CloudMoon, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog, 
  CloudDrizzle,
  Wind
} from 'lucide-react';
import { WeatherConditionType } from '../types';

interface WeatherIconProps {
  type: WeatherConditionType;
  conditionCode?: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  type, 
  conditionCode, 
  isDay = true, 
  className = 'w-6 h-6',
  size 
}) => {
  const iconProps = {
    className,
    ...(size ? { size } : {})
  };

  if (type === 'storm') {
    return <CloudLightning {...iconProps} className={`${className} text-amber-400`} />;
  }
  
  if (type === 'snow') {
    return <CloudSnow {...iconProps} className={`${className} text-sky-200`} />;
  }

  if (type === 'fog') {
    return <CloudFog {...iconProps} className={`${className} text-slate-300`} />;
  }

  if (type === 'rain') {
    if (conditionCode && conditionCode >= 51 && conditionCode <= 55) {
      return <CloudDrizzle {...iconProps} className={`${className} text-cyan-400`} />;
    }
    return <CloudRain {...iconProps} className={`${className} text-sky-400`} />;
  }

  if (type === 'clouds') {
    if (isDay) {
      return <CloudSun {...iconProps} className={`${className} text-amber-300`} />;
    }
    return <CloudMoon {...iconProps} className={`${className} text-indigo-300`} />;
  }

  if (type === 'night') {
    return <Moon {...iconProps} className={`${className} text-amber-200`} />;
  }

  // Clear / Sunny
  return <Sun {...iconProps} className={`${className} text-amber-400`} />;
};
