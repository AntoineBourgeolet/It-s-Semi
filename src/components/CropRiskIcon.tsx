import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { type Crop } from '../data';
import { type WeatherData } from '../services/weatherService';

export function CropRiskIcon({ 
  crop, 
  weatherData,
  tooltipAlign = 'left',
  placementClass = 'absolute top-2 left-2',
  tooltipPlacement = 'top'
}: { 
  crop: Crop; 
  weatherData: WeatherData | null;
  tooltipAlign?: 'left' | 'right';
  placementClass?: string;
  tooltipPlacement?: 'top' | 'bottom';
}) {
  if (!weatherData || !crop.sensitivity) return null;

  const risks: string[] = [];
  
  if (crop.sensitivity.cold && weatherData.tempMin < 5) {
    risks.push(`Froid : Température min de ${weatherData.tempMin}°C prévue (Sensible sous 5°C).`);
  }
  
  if (crop.sensitivity.heat && weatherData.tempMax > 30) {
    risks.push(`Chaleur : Température max de ${weatherData.tempMax}°C prévue (Sensible au-dessus de 30°C).`);
  }
  
  if (crop.sensitivity.wind && weatherData.windMax > 50) {
    risks.push(`Vent : Rafales à ${weatherData.windMax}km/h prévues (Sensible au vent fort).`);
  }

  if (risks.length === 0) return null;

  return (
    <div 
      className={`${placementClass || 'relative'} z-10 group/tooltip hover:z-20`}
      title={risks.join('\n')}
    >
      <div className="bg-red-500 p-1.5 rounded-full border-2 border-[#2D3436] shadow-[2px_2px_0_#2D3436] animate-pulse cursor-help">
        <AlertTriangle className="w-4 h-4 text-white" strokeWidth={3} />
      </div>
      <div className={`hidden group-hover/tooltip:block absolute ${tooltipPlacement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} ${tooltipAlign === 'right' ? 'right-0' : 'left-0'} w-48 p-2 bg-[#2D3436] text-white text-[10px] sm:text-xs rounded-xl shadow-xl z-50 pointer-events-none`}>
        <div className="font-bold border-b border-white/20 pb-1 mb-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Alerte Météo
        </div>
        {risks.map((r, i) => <div key={i} className="leading-tight mb-1 last:mb-0">{r}</div>)}
        <div className={`absolute ${tooltipPlacement === 'bottom' ? 'bottom-full border-b-[#2D3436]' : 'top-full border-t-[#2D3436]'} ${tooltipAlign === 'right' ? 'right-3' : 'left-3'} border-8 border-transparent`}></div>
      </div>
    </div>
  );
}
