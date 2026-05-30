import React from 'react';
import { type Crop } from '../data';
import { type WeatherData } from '../services/weatherService';
import { CropRiskIcon } from './CropRiskIcon';
import { CropIcon } from './CropIcon';

export interface CropButtonProps {
  crop: Crop;
  onClick: () => void;
  weatherData: WeatherData | null;
}

export const CropButton: React.FC<CropButtonProps> = ({ crop, onClick, weatherData }) => {
  return (
    <button 
      onClick={onClick} 
      aria-label={`Voir les détails pour ${crop.name}`} 
      className="bg-white p-3 rounded-2xl cartoon-border cartoon-shadow-sm hover:-translate-y-1 hover:z-20 transition-all flex flex-col items-center flex-1 min-w-[110px] relative"
    >
      <CropRiskIcon crop={crop} weatherData={weatherData} />
      <CropIcon crop={crop} className="w-12 h-12 mb-2" />
      <span className="font-bold text-xs sm:text-sm tracking-wide text-center leading-tight w-full px-1">{crop.name}</span>
    </button>
  );
};
