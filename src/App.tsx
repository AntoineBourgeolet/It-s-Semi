import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Sprout, Sun, Leaf, Info, X, ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, Bug, Heart, BookOpen, Trash2, SlidersHorizontal, Download, Upload, Copy, Check, Bell, BellOff, BellRing, Zap, Calculator } from 'lucide-react';
import { REGIONS, CROPS, MONTHS, TIPS, type ClimateRegion, type Crop, type ActionType, type Variety } from './data';
import { DEPARTMENTS } from './departmentsData';
import { type WeatherData } from './services/weatherService';
import { 
  requestNotificationPermission, 
  checkNotificationPermission, 
  triggerMonthNotification, 
  triggerWeatherAlertNotification,
  triggerTestNotification,
  notifyStatusChanged
} from './services/notificationService';

import { ClimateInfoCard } from './components/ClimateInfoCard';
import { OfflineIndicator } from './components/OfflineIndicator';

const getSeasonMonths = (season: string): number[] => {
  switch (season) {
    case 'printemps': return [2, 3, 4]; // Mars, Avril, Mai
    case 'été': return [5, 6, 7]; // Juin, Juillet, Août
    case 'automne': return [8, 9, 10]; // Septembre, Octobre, Novembre
    case 'hiver': return [11, 0, 1]; // Décembre, Janvier, Février
    default: return [];
  }
};

// --- Components ---

function CropRiskIcon({ 
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

function CropIcon({ crop, className = "" }: { crop: Crop; className?: string }) {
  const [error, setError] = React.useState(false);
  const imageSrc = (crop.image && crop.image !== '?') ? crop.image : '/pictures/inconnu.webp';

  return (
    <img 
      src={error ? '/pictures/inconnu.webp' : imageSrc} 
      alt={crop.name} 
      className={`object-contain ${className}`} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

interface CropButtonProps {
  crop: Crop;
  onClick: () => void;
  weatherData: WeatherData | null;
}

const CropButton: React.FC<CropButtonProps> = ({ crop, onClick, weatherData }) => {
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
}

function CropDetailModal({ 
  crop, 
  onClose, 
  onAddToGarden, 
  isInGarden, 
  weatherData,
  allAvailableCrops,
  biome,
  currentMonthIndex,
  onSelectCrop
}: { 
  crop: Crop; 
  onClose: () => void; 
  onAddToGarden?: (crop: Crop) => void; 
  isInGarden?: boolean; 
  weatherData: WeatherData | null;
  allAvailableCrops: (Crop & { isVariety?: boolean; varietyName?: string; baseId: string })[];
  biome: ClimateRegion;
  currentMonthIndex: number;
  onSelectCrop: (crop: Crop) => void;
}) {
  const risks: string[] = [];
  const [gardenArea, setGardenArea] = useState<string>('1');
  const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false);

  const getPlantsPerSqMeter = (cropItem: any) => {
    const id = cropItem.baseId || cropItem.id;
    if (['tomate', 'courgette', 'aubergine', 'melon', 'potiron', 'pasteque', 'patisson', 'artichaud', 'rhubarbe'].some(x => id.includes(x))) return 2;
    if (['radis', 'carotte', 'navet'].some(x => id.includes(x))) return 100;
    if (['laitue', 'mache', 'epinard', 'roquette', 'chicoré', 'bette', 'mâche', 'cresson'].some(x => id.includes(x))) return 16;
    if (['fraise', 'menthe', 'romarin', 'thym', 'sauge', 'lavande', 'basilic'].some(x => id.includes(x))) return 6;
    if (cropItem.type === 'herbe') return 8;
    if (['chou', 'brocoli', 'celerirave'].some(x => id.includes(x))) return 4;
    if (['oignon', 'ail', 'echalotte'].some(x => id.includes(x))) return 50;
    if (['poireau', 'endive'].some(x => id.includes(x))) return 30;
    if (['haricot', 'petitpois', 'feve'].some(x => id.includes(x))) return 40;
    if (['pommedeterre', 'topinambour'].some(x => id.includes(x))) return 5;
    return 10;
  };
  
  const plantsPerSqM = getPlantsPerSqMeter(crop);
  const areaValue = parseFloat(gardenArea) || 0;
  const totalPlants = Math.ceil(plantsPerSqM * areaValue);

  if (weatherData && crop.sensitivity) {
    if (crop.sensitivity.cold && weatherData.tempMin < 5) {
      risks.push(`Froid : Température min de ${weatherData.tempMin}°C prévue (Sensible sous 5°C).`);
    }
    if (crop.sensitivity.heat && weatherData.tempMax > 30) {
      risks.push(`Chaleur : Température max de ${weatherData.tempMax}°C prévue (Sensible au-dessus de 30°C).`);
    }
    if (crop.sensitivity.wind && weatherData.windMax > 50) {
      risks.push(`Vent : Rafales à ${weatherData.windMax}km/h prévues (Sensible au vent fort).`);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-crop-name"
        className="card-cartoon w-full max-w-2xl bg-[#B2CEFE] relative flex flex-col max-h-[90vh]"
      >
        {onAddToGarden && (
          <button 
            onClick={() => onAddToGarden(crop)}
            aria-label={isInGarden ? "Dans mon jardin" : "Ajouter à mon jardin"}
            className={`absolute top-4 left-4 z-10 p-2 rounded-full cartoon-border transition-colors ${isInGarden ? 'bg-red-400 hover:bg-red-500' : 'bg-white hover:bg-pink-100'}`}
          >
            <Heart className={`w-6 h-6 ${isInGarden ? 'text-white fill-white' : 'text-pink-500'}`} strokeWidth={3} />
          </button>
        )}

        <button 
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-10 p-2 bg-red-400 rounded-full cartoon-border hover:bg-red-500 transition-colors"
        >
          <X className="w-6 h-6 text-white" strokeWidth={3} />
        </button>

        <div className="p-8 overflow-y-auto">
          <div className="flex items-center gap-6 mb-6">
             <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[2rem] cartoon-border cartoon-shadow flex items-center justify-center shrink-0 overflow-hidden" aria-hidden="true">
               <CropIcon crop={crop} className="w-full h-full p-4" />
             </div>
             <div className="min-w-0">
               <div className="inline-block px-3 py-1 mb-2 text-[10px] sm:text-sm font-bold bg-white cartoon-border rounded-full uppercase tracking-wider text-green-800">
                 {crop.type}
               </div>
               <h2 id="modal-crop-name" className="text-2xl sm:text-5xl font-black text-gray-900 leading-tight break-words">{crop.name}</h2>
             </div>
          </div>

          {risks.length > 0 && (
            <div className="mb-6 p-4 bg-red-100 border-4 border-red-500 rounded-2xl flex flex-col gap-2 shadow-[4px_4px_0_#ef4444]">
              <div className="flex items-center gap-2 text-red-600 font-black uppercase text-sm">
                <AlertTriangle className="w-5 h-5 animate-pulse" strokeWidth={3} />
                Alerte Météo - Risques détectés
              </div>
              <ul className="list-disc list-inside space-y-1">
                {risks.map((risk, i) => (
                  <li key={i} className="text-red-900 font-bold text-sm leading-tight">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-lg font-medium text-gray-700 mb-8 p-4 bg-white cartoon-border rounded-2xl cartoon-shadow-sm">
            {crop.description}
          </p>

          {crop.varieties && crop.varieties.length > 0 && (
            <div className="mb-8 p-6 bg-indigo-50 border-4 border-indigo-400 rounded-3xl cartoon-shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-7 h-7 text-indigo-600" />
                <h3 className="text-2xl font-black text-indigo-900 tracking-tight">Variétés recommandées</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {crop.varieties.map((v, i) => {
                  const varietyId = `${crop.id}_v_${v.name.toLowerCase().replace(/\s+/g, '_')}`;
                  const varietyCrop = allAvailableCrops.find(c => c.id === varietyId);
                  return (
                    <button 
                      key={i} 
                      onClick={() => varietyCrop && onSelectCrop(varietyCrop)}
                      className="bg-white p-4 rounded-[1.5rem] cartoon-border cartoon-shadow-sm flex flex-col gap-1 group hover:-translate-y-1 transition-all text-left w-full"
                    >
                      <div className="font-black text-indigo-600 uppercase text-xs sm:text-sm tracking-widest flex items-center justify-between">
                        {v.name}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 leading-tight">{v.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-sky-200 p-6 rounded-3xl cartoon-border cartoon-shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Sprout className="w-6 h-6" />
                <h3 className="text-xl font-bold">Semis & Germination</h3>
              </div>
              <p className="font-medium text-sky-900">
                <span className="text-2xl mr-2">{crop.seedEmoji}</span> 
                {crop.germinationDays}
              </p>
            </div>

            <div className="bg-orange-200 p-6 rounded-3xl cartoon-border cartoon-shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Sun className="w-6 h-6" />
                <h3 className="text-xl font-bold">Conditions idéales</h3>
              </div>
              <p className="font-medium text-orange-900">{crop.conditions}</p>
            </div>

            <div className="sm:col-span-2 bg-[#F3E5F5] rounded-3xl cartoon-border cartoon-shadow-sm border-2 border-dashed border-[#2D3436] overflow-hidden">
              <button 
                onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                className="w-full flex items-center justify-between p-4 sm:p-6 focus:outline-none hover:bg-purple-50 transition-colors"
                aria-expanded={isCalculatorExpanded}
                aria-controls="calculator-content"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calculator className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 text-purple-600" />
                  <h3 className="text-lg sm:text-2xl font-black text-purple-900 tracking-tight text-left leading-none my-1">Calculateur de plants</h3>
                </div>
                <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-purple-600 transition-transform duration-300 ${isCalculatorExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isCalculatorExpanded && (
                  <motion.div 
                    id="calculator-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch p-4 pt-4 sm:p-6 sm:pt-6 border-t-2 border-purple-200 border-dashed mx-4 mt-4 mb-4 sm:mx-6 sm:mt-6 sm:mb-6">
                      <div className="w-full bg-white/60 p-4 rounded-xl sm:rounded-2xl border-2 border-purple-200 flex flex-col justify-center">
                        <label htmlFor="garden-area" className="block font-black text-purple-800 uppercase tracking-wider mb-2 text-xs sm:text-sm">
                          Surface
                        </label>
                        <div className="relative">
                          <input 
                            id="garden-area"
                            type="number" 
                            min="0.1" 
                            step="0.1"
                            value={gardenArea} 
                            onChange={(e) => setGardenArea(e.target.value)}
                            className="w-full text-base sm:text-xl font-bold p-3 sm:p-3 pr-8 sm:pr-8 bg-white border-2 border-purple-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all cartoon-shadow-sm"
                            placeholder="Ex: 2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-purple-400 text-sm sm:text-base">m²</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center shrink-0">
                        <span className="text-2xl sm:block hidden">👉</span>
                        <span className="text-2xl block sm:hidden">👇</span>
                      </div>
                      <div className="w-full bg-purple-600 text-white p-6 sm:p-6 rounded-xl sm:rounded-2xl cartoon-border cartoon-shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black leading-none">{totalPlants}</span>
                        <span className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-wider mt-2 sm:mt-1 leading-tight">
                          {crop.type === 'fleur' || crop.type === 'herbe' ? 'Plants' : (crop as any).baseId?.includes('pommedeterre') || (crop as any).baseId?.includes('ail') || crop.id.includes('pommedeterre') || crop.id.includes('ail') || crop.id.includes('oignon') || crop.id.includes('echalotte') ? 'Bulbes' : 'Graines'}
                        </span>
                        <span className="text-[10px] font-medium opacity-75 mt-1 sm:mt-2 leading-tight">Env. {plantsPerSqM}/m²</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {(crop.companions || crop.enemies) && (
              <div className="sm:col-span-2 bg-[#E1F2D1] p-6 rounded-3xl cartoon-border cartoon-shadow-sm border-2 border-dashed border-[#2D3436]">
                 <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-7 h-7 text-pink-600" />
                  <h3 className="text-xl sm:text-2xl font-black text-green-900 tracking-tight">Alliés & Ennemis</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {crop.companions && crop.companions.length > 0 && (
                    <div className="bg-white/60 p-4 rounded-2xl border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-400">
                          <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-black text-green-800 uppercase tracking-wider">Alliés</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {crop.companions.map(cId => {
                          const companion = allAvailableCrops.find(cr => !cr.isVariety && cr.id === cId);
                          return companion ? (
                            <button 
                              key={cId} 
                              onClick={() => onSelectCrop(companion)}
                              className="group flex flex-col items-center gap-2 p-2 bg-white cartoon-border rounded-xl hover:-translate-y-1 transition-all"
                            >
                              <div className="w-12 h-12 bg-white flex items-center justify-center overflow-hidden rounded-lg">
                                <CropIcon crop={companion} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform mix-blend-multiply" />
                              </div>
                              <span className="text-xs font-bold text-center leading-tight line-clamp-2">{companion.name}</span>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {crop.enemies && crop.enemies.length > 0 && (
                    <div className="bg-white/60 p-4 rounded-2xl border-2 border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-400">
                          <Zap className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-black text-red-800 uppercase tracking-wider">Ennemis</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {crop.enemies.map(eId => {
                          const enemy = allAvailableCrops.find(cr => !cr.isVariety && cr.id === eId);
                          return enemy ? (
                            <button 
                              key={eId} 
                              onClick={() => onSelectCrop(enemy)}
                              className="group flex flex-col items-center gap-2 p-2 bg-white cartoon-border rounded-xl hover:-translate-y-1 transition-all opacity-90 hover:opacity-100"
                            >
                              <div className="w-12 h-12 bg-white flex items-center justify-center overflow-hidden rounded-lg">
                                <CropIcon crop={enemy} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform grayscale-[50%] mix-blend-multiply" />
                              </div>
                              <span className="text-xs font-bold text-center leading-tight line-clamp-2 text-red-900">{enemy.name}</span>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="sm:col-span-2 bg-[#FFF9E1] p-6 rounded-3xl cartoon-border cartoon-shadow-sm border-2 border-dashed border-[#2D3436]">
               <div className="flex items-center gap-3 mb-3">
                <Leaf className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold">Quand replanter le semi ?</h3>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border-2 border-[#2D3436]/10">
                <p className="font-bold text-gray-800 leading-relaxed">{crop.repotting}</p>
              </div>
            </div>

            <div className="sm:col-span-2 bg-[#E1F5FE] p-6 rounded-3xl cartoon-border cartoon-shadow-sm border-2 border-dashed border-[#2D3436]">
               <div className="flex items-center gap-3 mb-3">
                <Sun className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold">Récolte : Quand & Comment ?</h3>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border-2 border-[#2D3436]/10">
                <p className="font-bold text-gray-800 leading-relaxed">{crop.harvestInfo}</p>
              </div>
            </div>

            <div className="sm:col-span-2 bg-white p-6 rounded-3xl cartoon-border cartoon-shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold">Calendrier de culture ({biome})</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 px-1">
                  {MONTHS.map((m, i) => <span key={m} className={i === currentMonthIndex ? "text-orange-600 font-black" : ""}>{m.charAt(0)}</span>)}
                </div>
                <div className="h-8 w-full flex items-center bg-[#F0F0F0] rounded-xl cartoon-border overflow-hidden">
                  {MONTHS.map((_, mIdx) => {
                    const sched = biome ? crop.schedule[biome] : null;
                    const hasIndoor = sched?.sow_indoor.includes(mIdx);
                    const hasOutdoor = sched?.sow_outdoor.includes(mIdx);
                    const hasRepot = sched?.repot?.includes(mIdx);
                    const hasHarvest = sched?.harvest?.includes(mIdx);
                    
                    return (
                      <div 
                        key={mIdx} 
                        className={`flex-1 h-full flex flex-col border-r-[1px] border-[#2D3436]/5 last:border-0 relative ${mIdx === currentMonthIndex ? 'ring-2 ring-inset ring-[#FFD93D] z-10' : ''}`}
                      >
                         {hasIndoor && <div className="flex-1 w-full bg-[#FFB347]" />}
                         {hasOutdoor && <div className="flex-1 w-full bg-[#A8E6CF]" />}
                         {hasRepot && <div className="flex-1 w-full bg-[#FF8A65]" />}
                         {hasHarvest && <div className="flex-1 w-full bg-[#BEF264]" />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-[10px] font-black uppercase">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFB347]"></div> Semis Int.</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#A8E6CF]"></div> Pleine Terre</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF8A65]"></div> Repiquage</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#BEF264]"></div> Récolte</div>
                </div>
              </div>
            </div>

            {crop.pests && (
              <div className="sm:col-span-2 bg-[#F8BBD0] p-6 rounded-3xl cartoon-border cartoon-shadow-sm border-2 border-dashed border-[#2D3436]">
                <div className="flex items-center gap-3 mb-3">
                  <Bug className="w-6 h-6 text-pink-700" />
                  <h3 className="text-xl font-bold">Ravageurs & Protection</h3>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl border-2 border-[#2D3436]/10">
                  <p className="font-bold text-gray-800 leading-relaxed">{crop.pests}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper to safely parse imported garden string/JSON
function importGardenData(text: string): { 
  myGarden: string[]; 
  region: string | null; 
  city: string | null; 
  cityCoords: { lat: number; lng: number } | null; 
  biome: ClimateRegion | null; 
} | null {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') return null;
    
    let gardenList: string[] = [];
    let region: string | null = null;
    let city: string | null = null;
    let cityCoords: { lat: number; lng: number } | null = null;
    let biome: ClimateRegion | null = null;

    if (Array.isArray(data)) {
      gardenList = data.filter(item => typeof item === 'string');
    } else {
      if (Array.isArray(data.myGarden)) {
        gardenList = data.myGarden.filter((item: any) => typeof item === 'string');
      }
      if (data.region && typeof data.region === 'string') {
        region = data.region;
      }
      if (data.city && typeof data.city === 'string') {
        city = data.city;
      }
      if (data.cityCoords && typeof data.cityCoords === 'object' && typeof data.cityCoords.lat === 'number' && typeof data.cityCoords.lng === 'number') {
        cityCoords = { lat: data.cityCoords.lat, lng: data.cityCoords.lng };
      }
      if (data.biome && typeof data.biome === 'string') {
        biome = data.biome as ClimateRegion;
      }
    }

    return { myGarden: gardenList, region, city, cityCoords, biome };
  } catch (e) {
    return null;
  }
}

// Modal for importing and exporting user garden configuration
function ImportExportModal({
  onClose,
  myGarden,
  region,
  city,
  cityCoords,
  biome,
  onImportSuccess
}: {
  onClose: () => void;
  myGarden: string[];
  region: string | null;
  city: string | null;
  cityCoords: { lat: number; lng: number } | null;
  biome: ClimateRegion | null;
  onImportSuccess: (data: {
    myGarden: string[];
    region: string | null;
    city: string | null;
    cityCoords: { lat: number; lng: number } | null;
    biome: ClimateRegion | null;
  }) => void;
}) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const exportDataObj = useMemo(() => {
    return {
      version: '1.0.0',
      myGarden,
      region,
      city,
      cityCoords,
      biome,
      exportedAt: new Date().toISOString()
    };
  }, [myGarden, region, city, cityCoords, biome]);

  const exportString = useMemo(() => {
    return JSON.stringify(exportDataObj, null, 2);
  }, [exportDataObj]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jardin_its_semi_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportText = () => {
    setImportError(null);
    setImportSuccessMsg(null);
    if (!pasteValue.trim()) {
      setImportError('Veuillez coller du texte ou charger un fichier JSON valide.');
      return;
    }
    const result = importGardenData(pasteValue);
    if (!result) {
      setImportError('Données de jardin invalides. Vérifiez que le texte est un JSON correct.');
      return;
    }
    
    onImportSuccess(result);
    setImportSuccessMsg(`Succès ! ${result.myGarden.length} plantes importées avec succès.`);
    setPasteValue('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = importGardenData(text);
      if (!result) {
        setImportError('Fichier JSON invalide. Vérifiez le format.');
        return;
      }
      onImportSuccess(result);
      setImportSuccessMsg(`Succès ! ${result.myGarden.length} plantes importées de "${file.name}".`);
    };
    reader.onerror = () => {
      setImportError('Erreur de lecture du fichier.');
    };
    reader.readAsText(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="card-cartoon w-full max-w-lg bg-[#FCFAEF] relative flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-10 p-2 bg-red-400 rounded-full cartoon-border hover:bg-red-500 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6 text-white" strokeWidth={3} />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] leading-tight mb-6 flex items-center gap-3 pr-8">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" /> Sauvegarder & restaurer
          </h2>

          {/* Tab buttons group */}
          <div className="flex gap-2 bg-[#F5F5F5] p-1 rounded-2xl cartoon-border mb-6">
            <button
              onClick={() => {
                setActiveTab('export');
                setImportError(null);
                setImportSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-[#FFD93D] cartoon-border shadow-[2px_2px_0px_#2D3436]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Export (Télécharger)
            </button>
            <button
              onClick={() => {
                setActiveTab('import');
                setImportError(null);
                setImportSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-[#FFD93D] cartoon-border shadow-[2px_2px_0px_#2D3436]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Import (Coller/Fichier)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'export' ? (
              <motion.div
                key="export-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-white p-4 rounded-2xl cartoon-border">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed mb-4">
                    Sauvegardez votre liste de plantes cultivées ({myGarden.length} espèces) et votre climat/localisation pour pouvoir les restaurer sur un autre appareil.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDownload}
                      className="btn-cartoon bg-[#FF8B13] hover:bg-[#FF8B13]/90 text-white font-black py-3 px-2 flex flex-col items-center justify-center gap-2 text-center text-xs sm:text-sm cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger JSON
                    </button>
                    <button
                      onClick={handleCopy}
                      className="btn-cartoon bg-[#B2EBF2] hover:bg-[#80DEEA] text-[#2D3436] font-black py-3 px-2 flex flex-col items-center justify-center gap-2 text-center text-xs sm:text-sm cursor-pointer"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-700" strokeWidth={3} /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Copié !' : 'Copier texte'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500">Code de configuration brut</label>
                  <textarea
                    readOnly
                    value={exportString}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    className="w-full h-28 p-3 text-[10px] font-mono cartoon-border rounded-xl bg-gray-50 focus:outline-none select-all custom-scrollbar"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="import-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-4 rounded-2xl cartoon-border">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed mb-4">
                    Importez votre jardin en chargeant un fichier sauvegarde JSON ou en collant le bloc de texte exporté.
                  </p>

                  <div className="relative overflow-hidden">
                    <button className="btn-cartoon bg-[#A8E6CF] text-green-900 w-full font-black py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer">
                      <Upload className="w-5 h-5" />
                      Sélectionner un fichier .json
                    </button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500">Coller le texte brut</label>
                  <textarea
                    placeholder='Collez le texte JSON exporté ici...'
                    value={pasteValue}
                    onChange={(e) => setPasteValue(e.target.value)}
                    className="w-full h-28 p-3 text-[10px] font-mono cartoon-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8B13] custom-scrollbar"
                  />
                </div>

                {importError && (
                  <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 text-xs font-black leading-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    {importError}
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-3 bg-green-100 border-2 border-green-500 rounded-xl text-green-800 text-xs font-black leading-tight flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-green-600" />
                    {importSuccessMsg}
                  </div>
                )}

                <button
                  onClick={handleImportText}
                  className="btn-cartoon bg-[#FFD93D] hover:bg-[#FFC619] text-[#2D3436] w-full py-3.5 font-black text-xs sm:text-sm uppercase cursor-pointer"
                >
                  Confirmer et importer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main App Component Shell
export default function App() {
  const [region, setRegion] = useState<string | null>(() => {
    const saved = localStorage.getItem('its-semi-region');
    return saved || null;
  });
  const [biome, setBiome] = useState<ClimateRegion | null>(() => {
    const saved = localStorage.getItem('its-semi-biome');
    return (saved as ClimateRegion) || null;
  });
  const [city, setCity] = useState<string | null>(() => {
    const saved = localStorage.getItem('its-semi-city');
    return saved || null;
  });
  const [cityCoords, setCityCoords] = useState<{lat: number, lng: number} | null>(() => {
    const saved = localStorage.getItem('its-semi-city-coords');
    return saved ? JSON.parse(saved) : null;
  });
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [view, setView] = useState<'dashboard' | 'calendar' | 'my-garden' | 'tips'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedType, setSelectedType] = useState<string>('tous');
  const [selectedSeason, setSelectedSeason] = useState<string>('toute l\'année');
  const [selectedMonthAction, setSelectedMonthAction] = useState<string>('tous');
  const [selectedSpace, setSelectedSpace] = useState<'tous' | 'balcon' | 'carre' | 'pleine_terre'>('tous');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [myGarden, setMyGarden] = useState<string[]>(() => {
    const saved = localStorage.getItem('its-semi-garden');
    return saved ? JSON.parse(saved) : [];
  });
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && scrollY > 40) return true;
        if (prev && scrollY < 10) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return checkNotificationPermission();
  });

  const [notifSettings, setNotifSettings] = useState<{
    weather: boolean;
    sowMonth: boolean;
    tips: boolean;
  }>(() => {
    const saved = localStorage.getItem('itssemi_notif_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { weather: true, sowMonth: true, tips: true };
  });

  const toggleNotifSetting = (type: 'weather' | 'sowMonth' | 'tips') => {
    setNotifSettings(prev => {
      const newValue = !prev[type];
      const updated = { ...prev, [type]: newValue };
      localStorage.setItem('itssemi_notif_settings', JSON.stringify(updated));
      
      if (newValue && checkNotificationPermission() === 'granted') {
        notifyStatusChanged(type, true);
      }
      return updated;
    });
  };

  // Automatically check permission status on window focus or load
  useEffect(() => {
    const checkPerm = () => {
      setNotificationPermission(checkNotificationPermission());
    };
    window.addEventListener('focus', checkPerm);
    return () => window.removeEventListener('focus', checkPerm);
  }, []);


  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
  };

  React.useEffect(() => {
    const handleShortcutNavigation = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const isShortcut = params.get('shortcut');

      if (path === '/semis' || isShortcut === 'semis') {
        setView('dashboard');
        setSelectedMonthAction('sow_any');
      } else if (path === '/repiquage' || isShortcut === 'repiquage') {
        setView('dashboard');
        setSelectedMonthAction('repot');
      } else if (path === '/meteo' || isShortcut === 'meteo') {
        setView('my-garden');
      }
    };

    handleShortcutNavigation();
    window.addEventListener('popstate', handleShortcutNavigation);
    return () => window.removeEventListener('popstate', handleShortcutNavigation);
  }, []);

  const handleImportSuccess = (data: {
    myGarden: string[];
    region: string | null;
    city: string | null;
    cityCoords: { lat: number; lng: number } | null;
    biome: ClimateRegion | null;
  }) => {
    setMyGarden(data.myGarden);
    localStorage.setItem('its-semi-garden', JSON.stringify(data.myGarden));

    setRegion(data.region);
    if (data.region) {
      localStorage.setItem('its-semi-region', data.region);
    } else {
      localStorage.removeItem('its-semi-region');
    }

    setCity(data.city);
    if (data.city) {
      localStorage.setItem('its-semi-city', data.city);
    } else {
      localStorage.removeItem('its-semi-city');
    }

    setCityCoords(data.cityCoords);
    if (data.cityCoords) {
      localStorage.setItem('its-semi-city-coords', JSON.stringify(data.cityCoords));
    } else {
      localStorage.removeItem('its-semi-city-coords');
    }

    setBiome(data.biome);
    if (data.biome) {
      localStorage.setItem('its-semi-biome', data.biome);
    } else {
      localStorage.removeItem('its-semi-biome');
    }
  };

  const toggleToGarden = (crop: Crop) => {
    setMyGarden(prev => {
      const next = prev.includes(crop.id) ? prev.filter(id => id !== crop.id) : [...prev, crop.id];
      localStorage.setItem('its-semi-garden', JSON.stringify(next));
      return next;
    });
  };

  const handleRegionSelect = (r: string | null) => {
    setRegion(r);
    setCity(null);
    setCityCoords(null);
    localStorage.removeItem('its-semi-city');
    localStorage.removeItem('its-semi-city-coords');
    if (r) {
      localStorage.setItem('its-semi-region', r);
      const resBiome = DEPARTMENTS[r]?.climate;
      setBiome(resBiome);
      localStorage.setItem('its-semi-biome', resBiome);
    } else {
      localStorage.removeItem('its-semi-region');
      setBiome(null);
      localStorage.removeItem('its-semi-biome');
    }
  };

  const handleCitySelect = (cityInfo: any) => {
    setCity(cityInfo.nom);
    localStorage.setItem('its-semi-city', cityInfo.nom);
    
    if (cityInfo.centre?.coordinates) {
      const coords = { lat: cityInfo.centre.coordinates[1], lng: cityInfo.centre.coordinates[0] };
      setCityCoords(coords);
      localStorage.setItem('its-semi-city-coords', JSON.stringify(coords));
    }
    
    const depCode = cityInfo.codeDepartement;
    const depKey = `dep_${depCode.padStart(2, '0')}`;
    if (DEPARTMENTS[depKey]) {
      setRegion(depKey);
      localStorage.setItem('its-semi-region', depKey);
      const resBiome = DEPARTMENTS[depKey].climate;
      setBiome(resBiome);
      localStorage.setItem('its-semi-biome', resBiome);
    }
    setCitySuggestions([]);
    setCitySearch('');
  };

  const searchCities = async (query: string) => {
    setCitySearch(query);
    if (query.length < 3) {
      setCitySuggestions([]);
      return;
    }

    setIsSearchingCity(true);
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${query}&fields=nom,code,codeDepartement,centre&limit=5`);
      const data = await response.json();
      setCitySuggestions(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleBiomeSelect = (b: ClimateRegion | null) => {
    setBiome(b);
    setRegion(null); // Clear department if biome is chosen directly
    localStorage.removeItem('its-semi-region');
    if (b) {
      localStorage.setItem('its-semi-biome', b);
    } else {
      localStorage.removeItem('its-semi-biome');
    }
  };

  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(() => {
    return new Date().getMonth();
  });

  const allAvailableCrops = useMemo(() => {
    const flattened: (Crop & { isVariety?: boolean; varietyName?: string; baseId: string })[] = [];
    CROPS.forEach(crop => {
      // Add the base crop
      flattened.push({ ...crop, baseId: crop.id });
      
      // Add each variety as a distinct entry
      if (crop.varieties) {
        crop.varieties.forEach(v => {
          flattened.push({
            ...crop,
            id: `${crop.id}_v_${v.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: `${crop.name} ${v.name}`,
            description: v.description,
            image: v.image || crop.image,
            schedule: v.schedule,
            sensitivity: v.sensitivity || crop.sensitivity,
            varieties: [], // Don't show varieties inside a variety detail
            isVariety: true,
            varietyName: v.name,
            baseId: crop.id
          });
        });
      }
    });
    return flattened;
  }, []);

  const myGardenCrops = useMemo(() => {
    return myGarden.map(id => allAvailableCrops.find(c => c.id === id)).filter((c): c is (Crop & { isVariety?: boolean; varietyName?: string; baseId: string }) => !!c);
  }, [myGarden, allAvailableCrops]);

  const gardenAlertsCount = useMemo(() => {
    if (!weatherData) return 0;
    return myGardenCrops.reduce((count, crop) => {
      if (!crop.sensitivity) return count;
      const hasRisk = (crop.sensitivity.cold && weatherData.tempMin < 5) ||
                      (crop.sensitivity.heat && weatherData.tempMax > 30) ||
                      (crop.sensitivity.wind && weatherData.windMax > 50);
      return hasRisk ? count + 1 : count;
    }, 0);
  }, [myGardenCrops, weatherData]);

  // Trigger Monthly Reminder when app mounts/month changes
  useEffect(() => {
    if (notificationPermission === 'granted') {
      const currentMonthName = MONTHS[currentMonthIndex];
      triggerMonthNotification(currentMonthName);
    }
  }, [currentMonthIndex, notificationPermission]);

  // Trigger weather warning notification when severe alerts are detected and plants are in garden
  useEffect(() => {
    if (notificationPermission === 'granted' && weatherData && gardenAlertsCount > 0) {
      const activeAlerts = weatherData.alerts.filter(a => a.type === 'danger' || a.type === 'warning');
      if (activeAlerts.length > 0) {
        triggerWeatherAlertNotification(gardenAlertsCount, activeAlerts[0].message);
      }
    }
  }, [weatherData, gardenAlertsCount, notificationPermission]);

  // Derived Data for Dashboard
  const currentClimate = biome;

  const cropsFilteredByCategory = useMemo(() => {
    return allAvailableCrops.filter(c => {
      const matchesType = selectedType === 'tous' || c.type === selectedType;
      
      let matchesSeason = true;
      if (selectedSeason !== 'toute l\'année' && currentClimate) {
        const seasonMonths = getSeasonMonths(selectedSeason);
        const sched = c.schedule[currentClimate];
        const allActiveMonths = [...sched.sow_indoor, ...sched.sow_outdoor, ...sched.repot];
        matchesSeason = seasonMonths.some(m => allActiveMonths.includes(m));
      }

      // Space suitability filtering
      let matchesSpace = true;
      if (selectedSpace === 'balcon') {
        const excludedForBalcony = [
          'pomme-de-terre', 'potiron', 'courge-butternut', 'artichaut', 
          'asperge', 'celeri', 'mais', 'melon', 'rhubarbe', 'chou-fleur', 
          'chou-bruxelles', 'brocoli', 'poireau', 'panais', 'radis-noir'
        ];
        matchesSpace = !excludedForBalcony.includes(c.baseId);
      } else if (selectedSpace === 'carre') {
        const excludedForCarre = [
          'potiron', 'courge-butternut', 'artichaut', 'rhubarbe', 
          'pomme-de-terre', 'asperge'
        ];
        matchesSpace = !excludedForCarre.includes(c.baseId);
      }

      return matchesType && matchesSeason && matchesSpace;
    });
  }, [allAvailableCrops, selectedType, selectedSeason, currentClimate, selectedSpace]);

  const filteredCrops = useMemo(() => {
    return cropsFilteredByCategory.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.type.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Apply month action filter (calendar specific)
      if (currentClimate && selectedMonthAction !== 'tous') {
        const sched = c.schedule[currentClimate];
        if (!sched) return false;

        if (selectedMonthAction === 'sow_any') {
          return sched.sow_indoor.includes(currentMonthIndex) || sched.sow_outdoor.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'sow_indoor') {
          return sched.sow_indoor.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'sow_outdoor') {
          return sched.sow_outdoor.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'repot') {
          return sched.repot.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'harvest') {
          return sched.harvest?.includes(currentMonthIndex) || false;
        }
      }

      return true;
    });
  }, [cropsFilteredByCategory, searchQuery, selectedMonthAction, currentClimate, currentMonthIndex]);

  if (!biome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FCFAEF] overflow-hidden">
        <div className="max-w-md w-full py-2">
           <motion.div 
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="text-center mb-4 sm:mb-8 flex flex-col items-center"
           >
             <div className="mb-6 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -5 }}
                  className="bg-[#FF8B13] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] border-[6px] border-[#2D3436] shadow-[8px_8px_0_#2D3436] flex items-center justify-center mb-6"
                >
                  <Sprout className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={3} />
                </motion.div>
                <h1 className="flex flex-col mb-4 items-center">
                  <span className="text-5xl sm:text-7xl font-black text-[#2D3436] uppercase leading-none tracking-tighter italic">It's</span>
                  <span className="text-6xl sm:text-8xl font-black text-[#FF8B13] uppercase leading-none tracking-tighter flex items-center justify-center gap-4 italic -mt-2">
                    Semi <span className="text-4xl sm:text-6xl not-italic">🌻</span>
                  </span>
                </h1>
             </div>
             <div className="inline-block px-6 py-2 sm:px-10 sm:py-3 bg-white border-[3px] border-[#2D3436] rounded-full shadow-[0_4px_0_#2D3436]">
               <span className="text-base sm:text-xl font-black text-[#2D3436]">Configurez votre potager</span>
             </div>
           </motion.div>
           
           <div className="relative">
              {/* Outer Device Frame */}
              <div className="bg-[#2D3436] rounded-[30px] sm:rounded-[40px] p-1.5 sm:p-2 border-4 border-[#1E1E1E] shadow-[0_8px_0_#1E1E1E] sm:shadow-[0_12px_0_#1E1E1E]">
                {/* Inner Screen */}
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 space-y-4 sm:space-y-8">
                    <div>
                      <label className="block text-base sm:text-lg font-black mb-2 sm:mb-4 text-[#2D3436] flex items-center gap-2">
                        <span className="text-lg sm:text-xl">📍</span> Département
                      </label>
                      <div className="relative group mb-4">
                        <select 
                          className="w-full h-12 sm:h-16 pl-4 sm:pl-6 pr-10 text-base sm:text-lg font-bold bg-[#F5F5F5] border-[3px] sm:border-[4px] border-[#2D3436] rounded-xl sm:rounded-2xl outline-none appearance-none cursor-pointer focus:bg-white transition-colors"
                          onChange={(e) => handleRegionSelect(e.target.value)}
                          value={region || ""}
                        >
                          <option value="">Choisir un département...</option>
                          {Object.entries(DEPARTMENTS).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, info]) => (
                            <option key={id} value={id}>{info.name} ({id.replace('dep_', '')})</option>
                          ))}
                        </select>
                        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3436] rotate-90" strokeWidth={3} />
                        </div>
                      </div>

                      <div className="relative space-y-2">
                        <label className="block text-base sm:text-lg font-black mb-2 text-[#2D3436] flex items-center gap-2">
                          <span className="text-lg sm:text-xl">🏙️</span> Ville (optionnel)
                        </label>
                        <div className="relative group">
                          <input 
                            type="text"
                            placeholder="Rechercher votre ville..."
                            value={citySearch}
                            onChange={(e) => searchCities(e.target.value)}
                            className="w-full h-12 sm:h-16 pl-4 sm:pl-6 pr-10 text-base sm:text-lg font-bold bg-[#F5F5F5] border-[3px] sm:border-[4px] border-[#2D3436] rounded-xl sm:rounded-2xl outline-none focus:bg-white transition-all shadow-[2px_2px_0_#2D3436] focus:shadow-none"
                          />
                          {isSearchingCity && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent" />
                            </div>
                          )}
                        </div>

                        <AnimatePresence>
                          {citySuggestions.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute z-50 left-0 right-0 bottom-full mb-2 sm:top-full sm:mt-2 bg-white border-[3px] sm:border-4 border-[#2D3436] rounded-xl sm:rounded-2xl shadow-[4px_4px_0_#2D3436] overflow-hidden max-h-48 overflow-y-auto"
                            >
                              {citySuggestions.map((cInfo) => (
                                <button
                                  key={cInfo.code}
                                  onClick={() => handleCitySelect(cInfo)}
                                  className="w-full p-4 text-left font-bold hover:bg-indigo-50 transition-colors border-b-2 border-[#2D3436]/10 last:border-0 flex items-center justify-between"
                                >
                                  <span>{cInfo.nom}</span>
                                  <span className="text-xs bg-[#F5F5F5] px-2 py-1 rounded-lg border border-[#2D3436]/20">{cInfo.codeDepartement}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                </div>
              </div>

              <p className="mt-4 sm:mt-8 text-center text-xs sm:text-sm font-bold text-[#2D3436] opacity-60 px-4">
                Les conseils de culture s'adapteront à votre choix.
              </p>
           </div>
        </div>
      </div>
    );
  }

  // Dashboard uses category filters but NOT search filters
  const sowIndoorToday = currentClimate ? cropsFilteredByCategory.filter(c => c.schedule[currentClimate].sow_indoor.includes(currentMonthIndex)) : [];
  const sowOutdoorToday = currentClimate ? cropsFilteredByCategory.filter(c => c.schedule[currentClimate].sow_outdoor.includes(currentMonthIndex)) : [];
  const repotToday = currentClimate ? cropsFilteredByCategory.filter(c => c.schedule[currentClimate].repot.includes(currentMonthIndex)) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAEF]">
      {/* Top Navbar */}
      <nav 
        className={`bg-white z-40 flex items-center justify-between gap-2 sm:gap-4 sticky sm:relative top-0 border-b-4 border-[#2D3436] p-2 px-3 sm:border-4 sm:shadow-[8px_8px_0_#FFD93D] sm:m-6 sm:rounded-3xl sm:p-4 sm:px-6 transition-shadow duration-300 ${
          isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:shadow-[8px_8px_0_#FFD93D]' : 'shadow-none sm:shadow-[8px_8px_0_#FFD93D]'
        }`}
      >
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 sm:gap-3 shrink-0 text-left hover:opacity-90 transition-opacity cursor-pointer text-[#2D3436]"
            aria-label="Retour à l'accueil"
          >
             <div className="bg-[#FF8B13] rounded-2xl border-4 border-[#2D3436] shadow-[4px_4px_0_#2D3436] flex items-center justify-center rotate-[-3deg] w-10 h-10 sm:w-12 sm:h-12">
               <Sprout className="text-white w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
             </div>
             <h1 className="font-black tracking-tighter uppercase italic leading-none text-xl sm:text-2xl">It's Semi</h1>
          </button>

         {/* Desktop Tabs */}
         <div className="hidden md:flex gap-3 bg-[#F5F5F5] p-1 rounded-2xl cartoon-border border-b-[4px] shrink-0" role="tablist">
            <button 
              onClick={() => setView('dashboard')}
              role="tab"
              aria-selected={view === 'dashboard'}
              className={`px-4 py-2 rounded-xl text-base font-bold transition-all whitespace-nowrap ${view === 'dashboard' ? 'bg-white cartoon-border shadow-[3px_3px_0_#2D3436]' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Aujourd'hui
            </button>
            <button 
              onClick={() => setView('calendar')}
              role="tab"
              aria-selected={view === 'calendar'}
              className={`px-4 py-2 rounded-xl text-base font-bold transition-all whitespace-nowrap ${view === 'calendar' ? 'bg-white cartoon-border shadow-[3px_3px_0_#2D3436]' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Calendrier
            </button>
            <button 
              onClick={() => setView('my-garden')}
              role="tab"
              aria-selected={view === 'my-garden'}
              className={`px-4 py-2 rounded-xl text-base font-bold transition-all whitespace-nowrap flex items-center gap-2 ${view === 'my-garden' ? 'bg-white cartoon-border shadow-[3px_3px_0_#2D3436]' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Heart className={`w-4 h-4 ${view === 'my-garden' ? 'text-pink-500 fill-pink-500' : ''}`} />
              <span>Mon Jardin</span>
            </button>
            <button 
              onClick={() => setView('tips')}
              role="tab"
              aria-selected={view === 'tips'}
              className={`px-4 py-2 rounded-xl text-base font-bold transition-all whitespace-nowrap flex items-center gap-2 ${view === 'tips' ? 'bg-white cartoon-border shadow-[3px_3px_0_#2D3436]' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Conseils</span>
            </button>
         </div>

         <button 
           onClick={() => {
             handleRegionSelect(null);
             handleBiomeSelect(null);
             setCity(null);
             localStorage.removeItem('its-semi-city');
             setView('dashboard');
           }}
           aria-label="Changer de ville ou région"
           title="Cliquez pour changer de ville ou de région"
           className="btn-cartoon bg-[#B2EBF2] py-1.5 sm:py-2 px-2.5 sm:px-4 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-[#2D3436] shrink-0 hover:bg-[#80DEEA] transition-colors"
         >
           <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D3436]" aria-hidden="true" />
           <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none font-bold">
             {city ? city : (region ? DEPARTMENTS[region]?.name.split(' ')[0] : (biome ? biome.charAt(0).toUpperCase() + biome.slice(1) : ''))}
           </span>
         </button>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-[#2D3436] flex items-center justify-around px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 w-full py-2 mx-0.5 sm:mx-1 rounded-xl transition-all border-2 ${view === 'dashboard' ? 'bg-[#FFD93D] border-[#2D3436] text-[#2D3436] shadow-[2px_2px_0px_#2D3436]' : 'border-transparent text-gray-500'}`}
        >
          <Calendar className={`w-5 sm:w-6 h-5 sm:h-6 ${view === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Aujourd'hui</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`flex flex-col items-center justify-center gap-1 w-full py-2 mx-0.5 sm:mx-1 rounded-xl transition-all border-2 ${view === 'calendar' ? 'bg-[#B2EBF2] border-[#2D3436] text-[#2D3436] shadow-[2px_2px_0px_#2D3436]' : 'border-transparent text-gray-500'}`}
        >
          <Calendar className={`w-5 sm:w-6 h-5 sm:h-6 rotate-90 ${view === 'calendar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Calendrier</span>
        </button>
        <button 
          onClick={() => setView('my-garden')}
          className={`flex flex-col items-center justify-center gap-1 w-full py-2 mx-0.5 sm:mx-1 rounded-xl transition-all border-2 ${view === 'my-garden' ? 'bg-[#F8BBD0] border-[#2D3436] text-[#2D3436] shadow-[2px_2px_0px_#2D3436]' : 'border-transparent text-gray-500'}`}
        >
          <Heart className={`w-5 sm:w-6 h-5 sm:h-6 ${view === 'my-garden' ? 'fill-[#2D3436] text-[#2D3436] stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Jardin</span>
        </button>
        <button 
          onClick={() => setView('tips')}
          className={`flex flex-col items-center justify-center gap-1 w-full py-2 mx-0.5 sm:mx-1 rounded-xl transition-all border-2 ${view === 'tips' ? 'bg-[#FFE0B2] border-[#2D3436] text-[#2D3436] shadow-[2px_2px_0px_#2D3436]' : 'border-transparent text-gray-500'}`}
        >
          <BookOpen className={`w-5 sm:w-6 h-5 sm:h-6 ${view === 'tips' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Conseils</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 pb-24 sm:pb-12 flex flex-col">
        <div className="max-w-6xl w-full mx-auto pt-4 sm:pt-0 flex flex-col flex-1">
           {/* Persistent Search Bar & Mobile Filter Trigger */}
           <div className="hidden md:flex gap-2 sm:gap-4 mb-6 pr-1.5 sm:pr-0">
              <div className="relative group flex-1">
                <div className="hidden md:flex absolute inset-y-0 left-6 items-center pointer-events-none z-10">
                  <Search className="h-6 w-6 text-gray-500 group-focus-within:text-emerald-600 transition-colors" aria-hidden="true" />
                </div>
                <label htmlFor="crop-search" className="sr-only">Rechercher une culture</label>
                {/* Desktop: standard custom input */}
                <input 
                  id="crop-search"
                  type="text" 
                  placeholder="Rechercher une culture..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 0 && view !== 'calendar' && view !== 'my-garden' && view !== 'tips') {
                      setView('calendar');
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="hidden md:block w-full pl-14 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-5 text-lg sm:text-xl bg-white border-4 border-[#2D3436] rounded-[2rem] shadow-[4px_4px_0px_#2D3436] outline-none focus:border-[#4B9C8E] transition-all placeholder:text-gray-500 font-bold"
                />

                {/* Mobile: button pretending to be a search input */}
                <button 
                  onClick={() => setIsMobileSearchExpanded(true)}
                  className="md:hidden w-full flex items-center justify-between text-left pl-5 pr-4 py-4 text-base bg-white border-4 border-[#2D3436] rounded-[2rem] shadow-[4px_4px_0px_#2D3436] font-bold text-[#2D3436]/70 relative h-[60px]"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Search className="h-5 w-5 text-gray-500 bg-transparent shrink-0" />
                    <span className="truncate pr-4">{searchQuery || "Rechercher une culture..."}</span>
                  </div>
                  {searchQuery && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="p-1 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </button>
              </div>
             <button 
                onClick={() => setShowMobileFilters(true)}
                className="bg-[#FFD93D] rounded-[2rem] border-4 border-[#2D3436] shadow-[4px_4px_0px_#2D3436] active:translate-y-1 active:shadow-none flex items-center justify-center relative w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] shrink-0"
              >
                <SlidersHorizontal className="w-6 h-6" />
                {(selectedType !== 'tous' || selectedSeason !== "toute l'année" || selectedMonthAction !== 'tous') && (
                  <span className="absolute -top-1 right-0.5 w-6 h-6 bg-red-500 border-2 border-[#2D3436] rounded-full text-[10px] text-white font-black flex items-center justify-center animate-bounce">!</span>
                )}
              </button>
           </div>
        </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isMobileSearchExpanded && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSearchExpanded(false)}
              className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="fixed inset-x-4 top-24 z-[111] max-w-md mx-auto"
            >
              <div className="card-cartoon bg-white p-6 relative">
                <button 
                  onClick={() => setIsMobileSearchExpanded(false)}
                  className="absolute top-4 right-4 p-2 bg-red-400 rounded-full cartoon-border hover:bg-red-500 transition-colors z-[112]"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </button>
                <h3 className="text-xl font-black mb-4 uppercase italic flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-700" />
                  <span>Recherche</span>
                </h3>
                <div className="relative mb-4">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Chercher une culture..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length > 0 && view !== 'calendar' && view !== 'my-garden' && view !== 'tips') {
                        setView('calendar');
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#F5F5F5] border-3 border-[#2D3436] rounded-2xl outline-none focus:bg-white transition-all font-bold placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setIsMobileSearchExpanded(false)}
                  className="w-full btn-cartoon bg-[#FFD93D] py-3 font-black uppercase text-sm"
                >
                  Valider
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[101] rounded-t-[32px] border-t-4 border-[#2D3436] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase italic">Filtres</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 bg-[#F5F5F5] rounded-full cartoon-border"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className="text-sm font-black uppercase text-gray-400 mb-3">Catégorie</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['tous', 'légume', 'fruit', 'herbe', 'fleur'].map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          if (view === 'dashboard') setView('calendar');
                        }}
                        className={`py-3 rounded-2xl text-[10px] font-black transition-all border-2 border-[#2D3436] flex flex-col items-center gap-1 shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none ${selectedType === type ? 'bg-[#FF8B13] text-white' : 'bg-white text-[#2D3436]'}`}
                      >
                        <span className="text-lg">{type === 'légume' ? '🥦' : type === 'fruit' ? '🍎' : type === 'herbe' ? '🌿' : type === 'fleur' ? '🌼' : '✨'}</span>
                        <span>{type.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-black uppercase text-gray-400 mb-3">Saison</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["toute l'année", 'printemps', 'été', 'automne', 'hiver'].map(season => (
                      <button
                        key={season}
                        onClick={() => {
                          setSelectedSeason(season);
                          if (view === 'dashboard') setView('calendar');
                        }}
                        className={`py-3 px-4 rounded-2xl text-[10px] font-black transition-all border-2 border-[#2D3436] shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none ${selectedSeason === season ? 'bg-[#A8E6CF] text-[#2D3436]' : 'bg-white text-[#2D3436]'}`}
                      >
                        {season.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-black uppercase text-gray-400 mb-3">Sélectionné pour {MONTHS[currentMonthIndex]}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tous', label: 'Tout' },
                      { id: 'sow_any', label: '🌱 Semis ce mois-ci' },
                      { id: 'sow_indoor', label: '🏠 Semis sous Abri' },
                      { id: 'sow_outdoor', label: '🏡 Semis Pleine Terre' },
                      { id: 'repot', label: '🪴 Repiquage' },
                      { id: 'harvest', label: '🧺 Récolte' }
                    ].map(action => (
                      <button
                        key={action.id}
                        onClick={() => {
                          setSelectedMonthAction(action.id);
                          if (view === 'dashboard') setView('calendar');
                        }}
                        className={`py-3 px-3 rounded-2xl text-[10px] font-black transition-all border-2 border-[#2D3436] shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none ${selectedMonthAction === action.id ? 'bg-[#FFD93D] text-[#2D3436]' : 'bg-white text-[#2D3436]'}`}
                      >
                        {action.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>

                <button 
                  onClick={() => {
                    setShowMobileFilters(false);
                    if (view === 'dashboard') setView('calendar');
                  }}
                  className="w-full btn-cartoon bg-[#FFD93D] py-4 text-sm font-black uppercase mt-4"
                >
                  Appliquer les filtres
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
               {/* Climate Info Card */}
               {biome && <ClimateInfoCard biome={biome} departmentId={region} cityName={city} cityCoords={cityCoords} onWeatherDataUpdate={setWeatherData} />}

               {/* Today's actions grids */}
               <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 text-[#2D3436]">
                      <div className="bg-[#FFD93D] p-2 rounded-xl cartoon-border shadow-[4px_4px_0px_#2D3436]">
                        <Calendar className="w-6 h-6 text-[#2D3436]" strokeWidth={3} />
                      </div> 
                      <span>Prévisions de culture</span>
                   </h2>

                   {/* Interactive Month Navigation Controls */}
                   <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl cartoon-border border-b-[4px] self-start md:self-auto w-full sm:w-auto">
                     <button 
                       onClick={() => setCurrentMonthIndex(prev => (prev === 0 ? 11 : prev - 1))}
                       title="Mois précédent"
                       className="p-1.5 sm:p-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-xl transition-all cursor-pointer text-[#2D3436] cartoon-border-sm"
                     >
                       <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D3436]" strokeWidth={3} />
                     </button>

                     <div className="relative flex-1 sm:flex-initial">
                       <select
                         value={currentMonthIndex}
                         onChange={(e) => setCurrentMonthIndex(parseInt(e.target.value))}
                         className="w-full sm:w-44 bg-[#F5F5F5] font-black text-xs sm:text-sm text-[#2D3436] py-1.5 pl-3 pr-8 rounded-xl border-2 border-[#2D3436] outline-none cursor-pointer appearance-none text-center shadow-[2px_2px_0_#2D3436] focus:shadow-none transition-all"
                       >
                         {MONTHS.map((month, idx) => (
                           <option key={month} value={idx}>
                             {month} {idx === new Date().getMonth() ? " (Actuel)" : ""}
                           </option>
                         ))}
                       </select>
                       <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center pr-1 text-[#2D3436]">
                         <span className="text-[10px]">▼</span>
                       </div>
                     </div>

                     <button 
                       onClick={() => setCurrentMonthIndex(prev => (prev === 11 ? 0 : prev + 1))}
                       title="Mois suivant"
                       className="p-1.5 sm:p-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-xl transition-all cursor-pointer text-[#2D3436] cartoon-border-sm"
                     >
                       <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D3436]" strokeWidth={3} />
                     </button>

                     {currentMonthIndex !== new Date().getMonth() && (
                       <button
                         onClick={() => setCurrentMonthIndex(new Date().getMonth())}
                         className="text-xs font-black bg-[#B2EBF2] hover:bg-[#80DEEA] text-[#2D3436] border-2 border-[#2D3436] px-2.5 py-1.5 rounded-xl transition-all shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none shrink-0"
                         title="Revenir au mois en cours"
                       >
                         Mois actuel
                       </button>
                     )}
                   </div>
                 </div>

                 {/* Cultivation Space Quick Filters */}
                 <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border-4 border-[#2D3436] shadow-[4px_4px_0_#2D3436]">
                   <span className="text-xs sm:text-sm font-black text-[#2D3436] uppercase tracking-wider flex items-center gap-2 shrink-0">
                     <span>🪴</span> Espace de culture :
                   </span>
                   <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                     <button
                       onClick={() => setSelectedSpace(selectedSpace === 'balcon' ? 'tous' : 'balcon')}
                       className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 border-[#2D3436] whitespace-nowrap shadow-[3px_3px_0_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer hover:bg-gray-50 flex-1 sm:flex-initial ${
                         selectedSpace === 'balcon' 
                           ? 'bg-[#FFD93D] text-[#2D3436] border-[3px] -translate-y-0.5' 
                           : 'bg-white text-[#2D3436]'
                       }`}
                     >
                       🏢 Balcon / Pot
                     </button>
                     
                     <button
                       onClick={() => setSelectedSpace(selectedSpace === 'carre' ? 'tous' : 'carre')}
                       className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 border-[#2D3436] whitespace-nowrap shadow-[3px_3px_0_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer hover:bg-gray-50 flex-1 sm:flex-initial ${
                         selectedSpace === 'carre' 
                           ? 'bg-[#A8E6CF] text-[#2D3436] border-[3px] -translate-y-0.5' 
                           : 'bg-white text-[#2D3436]'
                       }`}
                     >
                       📦 Petit Carré / Bac
                     </button>
                     
                     <button
                       onClick={() => setSelectedSpace('tous')}
                       className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 border-[#2D3436] whitespace-nowrap shadow-[3px_3px_0_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer hover:bg-gray-50 flex-1 sm:flex-initial ${
                         selectedSpace === 'tous' || selectedSpace === 'pleine_terre'
                           ? 'bg-[#B2EBF2] text-[#2D3436] border-[3px] -translate-y-0.5' 
                           : 'bg-white text-[#2D3436]'
                       }`}
                     >
                       🌍 Pleine Terre
                     </button>
                   </div>

                   {selectedSpace !== 'tous' && (
                     <span className="text-[10px] sm:text-xs font-bold text-gray-500 italic sm:ml-auto block mt-1 sm:mt-0">
                       {selectedSpace === 'balcon' 
                         ? "Filtre actif : Seuls les aromates, petits fruits et petites feuilles adaptés aux pots sont affichés."
                         : "Filtre actif : Pas de place pour les courges géantes, pommes de terre ou artichauts."
                       }
                     </span>
                   )}
                 </div>

                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Indoor Sowing */}
                    <div className="card-cartoon bg-[#FFD93D]">
                      <div className="p-4 border-b-4 border-[#2D3436] flex items-center justify-between">
                         <h3 className="text-xl font-black flex items-center gap-2">
                           <Sprout className="w-6 h-6" /> Semis Intérieur
                         </h3>
                         <span className="bg-white px-3 py-1 rounded-full text-sm font-black cartoon-border">{sowIndoorToday.length}</span>
                      </div>
                      <div className="p-4 flex gap-3 flex-wrap">
                        {sowIndoorToday.length > 0 ? sowIndoorToday.map(crop => (
                          <CropButton key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} weatherData={weatherData} />
                        )) : <div className="p-4 text-center w-full font-bold text-[#2D3436] bg-[#FFF9E1] rounded-2xl border-2 border-dashed border-[#2D3436]">Rien à semer à l'intérieur en ce moment.</div>}
                      </div>
                    </div>

                    {/* Outdoor Sowing */}
                    <div className="card-cartoon bg-[#C1E1C1]">
                      <div className="p-4 border-b-4 border-[#2D3436] flex items-center justify-between">
                         <h3 className="text-xl font-black flex items-center gap-2">
                           <Leaf className="w-6 h-6" /> Semis Pleine Terre
                         </h3>
                         <span className="bg-white px-3 py-1 rounded-full text-sm font-black cartoon-border">{sowOutdoorToday.length}</span>
                      </div>
                      <div className="p-4 flex gap-3 flex-wrap">
                        {sowOutdoorToday.length > 0 ? sowOutdoorToday.map(crop => (
                          <CropButton key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} weatherData={weatherData} />
                        )) : <div className="p-4 text-center w-full font-bold text-[#2D3436] bg-[#FFF9E1] rounded-2xl border-2 border-dashed border-[#2D3436]">Rien à semer dehors en ce moment.</div>}
                      </div>
                    </div>

                    {/* Repotting/Transplanting */}
                    <div className="card-cartoon bg-[#FFCCBC] md:col-span-2 lg:col-span-1">
                      <div className="p-4 border-b-4 border-[#2D3436] flex items-center justify-between">
                         <h3 className="text-xl font-black flex items-center gap-2">
                           <Leaf className="w-6 h-6 text-orange-700" /> Repiquage
                         </h3>
                         <span className="bg-white px-3 py-1 rounded-full text-sm font-black cartoon-border">{repotToday.length}</span>
                      </div>
                      <div className="p-4 flex gap-3 flex-wrap">
                        {repotToday.length > 0 ? repotToday.map(crop => (
                          <CropButton key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} weatherData={weatherData} />
                        )) : <div className="p-4 text-center w-full font-bold text-[#2D3436] bg-[#FFF9E1] rounded-2xl border-2 border-dashed border-[#2D3436]">Aucun repiquage ce mois-ci.</div>}
                      </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          ) : view === 'calendar' ? (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto w-full px-2 sm:px-0 flex-1 flex flex-col min-h-0"
            >
              <div className="card-cartoon bg-white flex flex-col flex-1 overflow-hidden min-h-0 md:h-[calc(100dvh-250px)] lg:h-[calc(100dvh-210px)]">
                 <div className="p-3 sm:p-6 border-b-4 border-[#2D3436] bg-[#F5F5F5] space-y-3 sm:space-y-4 z-20">
                               {/* Mobile: Simple title and legend */}
                     <div className="flex flex-col gap-3 md:hidden">
                       <div className="flex items-center justify-between">
                          <h2 className="text-xl font-black flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#2D3436]" /> 
                            <span>Calendrier</span>
                          </h2>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsMobileSearchExpanded(true)}
                              className="bg-white rounded-xl border-[3px] border-[#2D3436] shadow-[2px_2px_0px_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center justify-center relative w-10 h-10 shrink-0"
                            >
                              <Search className="w-5 h-5 text-[#2D3436]" />
                              {searchQuery && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 border-[2px] border-[#2D3436] rounded-full"></span>
                              )}
                            </button>
                            <button
                              onClick={() => setShowMobileFilters(true)}
                              className="bg-[#FFD93D] rounded-xl border-[3px] border-[#2D3436] shadow-[2px_2px_0px_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center justify-center relative w-10 h-10 shrink-0"
                            >
                              <SlidersHorizontal className="w-5 h-5 text-[#2D3436]" />
                              {(selectedType !== 'tous' || selectedSeason !== "toute l'année" || selectedMonthAction !== 'tous') && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-[2px] border-[#2D3436] rounded-full animate-bounce"></span>
                              )}
                            </button>
                          </div>
                       </div>
                       
                       <div className="flex justify-between gap-2 text-[8px] font-black uppercase bg-white px-3 py-2 rounded-xl border-2 border-[#2D3436]">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFB347] border-2 border-[#2D3436]"></div> Semis</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#A8E6CF] border-2 border-[#2D3436]"></div> Terre</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF8A65] border-2 border-[#2D3436]"></div> Repik</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#BEF264] border-2 border-[#2D3436]"></div> Récolte</div>
                       </div>
                     </div>

                     {/* Desktop: Single line header */}
                     <div className="hidden md:flex items-center justify-between gap-4">
                       <h2 className="text-2xl font-black flex items-center gap-3">
                         <Calendar className="w-6 h-6" /> 
                         <span>Calendrier</span>
                       </h2>
                       
                       <div className="flex gap-4 text-sm font-black uppercase bg-white px-4 py-2 rounded-full border-2 border-[#2D3436]">
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FFB347] border-2 border-[#2D3436]"></div> Semis Intérieur</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#A8E6CF] border-2 border-[#2D3436]"></div> Pleine Terre</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF8A65] border-2 border-[#2D3436]"></div> Repiquage</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#BEF264] border-2 border-[#2D3436]"></div> Récolte</div>
                       </div>
                     </div>

                    {/* Desktop Filters Only */}
                    <div className="hidden md:flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {['tous', 'légume', 'fruit', 'herbe', 'fleur'].map(type => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 border-[#2D3436] whitespace-nowrap shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none ${selectedType === type ? 'bg-[#FF8B13] text-white -translate-y-0.5' : 'bg-white text-[#2D3436]'}`}
                          >
                            {type === 'légume' ? '🥦 Légumes' : type === 'fruit' ? '🍎 Fruits' : type === 'herbe' ? '🌿 Herbes' : type === 'fleur' ? '🌼 Fleurs' : 'Tout'}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                         {["toute l'année", 'printemps', 'été', 'automne', 'hiver'].map(season => (
                           <button
                             key={season}
                             onClick={() => setSelectedSeason(season)}
                             className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 border-[#2D3436] whitespace-nowrap shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none ${selectedSeason === season ? 'bg-[#A8E6CF] text-[#2D3436] -translate-y-0.5' : 'bg-white text-[#2D3436]'}`}
                           >
                             {season.charAt(0).toUpperCase() + season.slice(1)}
                           </button>
                         ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs font-black uppercase text-gray-400 mr-2">Pour {MONTHS[currentMonthIndex]} :</span>
                        {[
                          { id: 'tous', label: 'Tout' },
                          { id: 'sow_any', label: '🌱 Semis ce mois-ci' },
                          { id: 'sow_indoor', label: '🏠 Semis sous Abri' },
                          { id: 'sow_outdoor', label: '🏡 Semis Pleine Terre' },
                          { id: 'repot', label: '🪴 Repiquage' },
                          { id: 'harvest', label: '🧺 Récolte' }
                        ].map(action => (
                          <button
                            key={action.id}
                            onClick={() => setSelectedMonthAction(action.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 border-[#2D3436] whitespace-nowrap shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none ${selectedMonthAction === action.id ? 'bg-[#FFD93D] text-[#2D3436] -translate-y-0.5' : 'bg-white text-[#2D3436]'}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                 {/* Table Body - Mobile optimized */}
                <div className="flex-1 overflow-auto relative custom-scrollbar bg-[#FAFAFA]">
                    {/* Desktop View Table */}
                    <div className="hidden md:block">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-20 bg-[#F0F0F0]/90 backdrop-blur-md">
                          <tr>
                            <th className="p-4 border-b-2 border-r-2 border-[#2D3436] sticky left-0 z-30 bg-[#F0F0F0] w-48 text-center font-black uppercase italic">Variété</th>
                            {MONTHS.map(m => (
                              <th key={m} className="p-3 border-b-2 border-r-2 border-[#2D3436] text-center font-black text-xs uppercase">
                                {m.substring(0, 3)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                           {filteredCrops.map((crop) => (
                             <tr key={crop.id} className="hover:bg-[#F5F5F5] transition-colors group">
                                <td className="p-2 border-b-2 border-r-2 border-[#2D3436] sticky left-0 z-10 bg-white group-hover:bg-orange-50 group-hover:z-20">
                                   <div className="relative">
                                     <button 
                                       onClick={() => setSelectedCrop(crop)}
                                       className="flex items-center gap-2 w-full p-2 hover:bg-[#F0F0F0] rounded-xl transition-colors text-left"
                                     >
                                        <div className="w-10 h-10 bg-white cartoon-border rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                           <CropIcon crop={crop} className="w-full h-full p-2" />
                                        </div>
                                        <span className="font-bold text-sm leading-tight">{crop.name}</span>
                                     </button>
                                     <div className="absolute top-0 right-0 z-10 hover:z-20">
                                        <CropRiskIcon crop={crop} weatherData={weatherData} placementClass="" tooltipAlign="right" tooltipPlacement="bottom" />
                                     </div>
                                   </div>
                                </td>
                                {MONTHS.map((_, mIdx) => {
                                  const sched = currentClimate ? crop.schedule[currentClimate] : { sow_indoor: [], sow_outdoor: [], repot: [], harvest: [] };
                                  const hasIndoor = sched.sow_indoor.includes(mIdx);
                                  const hasOutdoor = sched.sow_outdoor.includes(mIdx);
                                  const hasRepot = sched.repot?.includes(mIdx);
                                  const hasHarvest = sched.harvest?.includes(mIdx);

                                  return (
                                    <td key={mIdx} className={`border-b-2 border-r-2 border-[#2D3436] p-1 relative min-h-[60px] align-top transition-colors ${mIdx === currentMonthIndex ? 'bg-yellow-50/50' : 'bg-white'}`}>
                                      <div className="flex flex-col gap-1 w-full h-full justify-center">
                                         {hasIndoor && <div className="h-3 w-full bg-[#FFB347] rounded-full border-2 border-[#2D3436] shadow-[1px_1px_0_#2D3436]"></div>}
                                         {hasOutdoor && <div className="h-3 w-full bg-[#A8E6CF] rounded-full border-2 border-[#2D3436] shadow-[1px_1px_0_#2D3436]"></div>}
                                         {hasRepot && <div className="h-3 w-full bg-[#FF8A65] rounded-full border-2 border-[#2D3436] shadow-[1px_1px_0_#2D3436]"></div>}
                                         {hasHarvest && <div className="h-3 w-full bg-[#BEF264] rounded-full border-2 border-[#2D3436] shadow-[1px_1px_0_#2D3436]"></div>}
                                      </div>
                                    </td>
                                  );
                                })}
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View List */}
                    <div className="md:hidden divide-y-2 divide-[#2D3436]/10">
                       {filteredCrops.map((crop) => {
                         const sched = currentClimate ? crop.schedule[currentClimate] : null;
                         return (
                           <div key={crop.id} className="p-3 bg-white flex flex-col gap-2 relative hover:z-20">
                              <div className="flex items-center justify-between relative z-20">
                                <button 
                                  onClick={() => setSelectedCrop(crop)}
                                  className="flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 bg-white cartoon-border rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                    <CropIcon crop={crop} className="w-full h-full p-2" />
                                  </div>
                                  <div className="flex flex-col items-start leading-tight">
                                    <span className="font-bold text-base">{crop.name}</span>
                                    <span className="text-[9px] font-black uppercase text-gray-400">{crop.type}</span>
                                  </div>
                                </button>
                                <div className="relative flex items-center justify-center z-10 hover:z-20">
                                  <CropRiskIcon crop={crop} weatherData={weatherData} placementClass="" tooltipAlign="right" tooltipPlacement="bottom" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 px-1">
                                   {MONTHS.map((m, i) => <span key={m} className={i === currentMonthIndex ? "text-orange-600 font-black" : ""}>{m.charAt(0)}</span>)}
                                 </div>
                                 <div className="h-6 w-full flex items-center bg-[#F0F0F0] rounded-lg cartoon-border overflow-hidden">
                                    {MONTHS.map((_, mIdx) => {
                                      const hasIndoor = sched?.sow_indoor.includes(mIdx);
                                      const hasOutdoor = sched?.sow_outdoor.includes(mIdx);
                                      const hasRepot = sched?.repot.includes(mIdx);
                                      const hasHarvest = sched?.harvest.includes(mIdx);
                                      
                                      return (
                                        <div 
                                          key={mIdx} 
                                          className={`flex-1 h-full flex flex-col border-r-[1px] border-[#2D3436]/5 last:border-0 relative`}
                                        >
                                           {hasIndoor && <div className="flex-1 w-full bg-[#FFB347]" />}
                                           {hasOutdoor && <div className="flex-1 w-full bg-[#A8E6CF]" />}
                                           {hasRepot && <div className="flex-1 w-full bg-[#FF8A65]" />}
                                           {hasHarvest && <div className="flex-1 w-full bg-[#BEF264]" />}
                                           {mIdx === currentMonthIndex && (
                                             <div className="absolute inset-0 ring-2 ring-inset ring-[#FFD93D] z-10 pointer-events-none" />
                                           )}
                                        </div>
                                      );
                                    })}
                                 </div>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
               </div>
            </motion.div>
          ) : view === 'my-garden' ? (
            <motion.div 
              key="my-garden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
                  <h2 className="text-3xl font-black flex items-center gap-3 text-[#2D3436]">
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500" /> Mon Jardin
                  </h2>
                  <div className="text-sm font-black bg-white px-4 py-2 rounded-full border-4 border-[#2D3436] shadow-[4px_4px_0_#2D3436] italic whitespace-nowrap">
                    {myGarden.length} Variétés sauvegardées
                  </div>
                </div>
                
                <button
                  onClick={() => setShowImportExportModal(true)}
                  className="btn-cartoon bg-[#FFD93D] text-[#2D3436] hover:bg-[#FFC619] text-sm py-2 px-4 flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Sauvegarder &amp; Restaurer</span>
                </button>
              </div>

              {/* PWA Notifications Settings Panel */}
              <div className="bg-[#E8F5E9] rounded-3xl p-4 sm:p-6 border-4 border-[#2D3436] shadow-[4px_4px_0_#2D3436] mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#4CAF50] p-3 rounded-2xl border-4 border-[#2D3436] text-white shrink-0 shadow-[2px_2px_0_#2D3436]">
                      <Bell className="w-6 h-6 animate-bounce" strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#2D3436] uppercase italic">Alertes de culture &amp; Météo</h3>
                      <p className="text-sm font-bold text-gray-700 leading-tight mt-1">
                        {notificationPermission === 'granted' 
                          ? "Vos notifications sont activées ! Vous recevrez des alertes météo locales et des conseils de semis chaque mois."
                          : notificationPermission === 'denied'
                          ? "Les notifications de votre navigateur sont refusées. Veuillez les réactiver dans vos paramètres pour recevoir les alertes météo."
                          : "Soyez prévenu dès qu'un coup de gel menace vos plantations ou lorsqu'un nouveau mois de cycle de culture commence !"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                    {notificationPermission === 'default' && (
                      <button
                        onClick={handleRequestPermission}
                        className="px-5 py-3 bg-[#FF9800] hover:bg-[#F57C00] text-white font-black text-sm rounded-2xl border-4 border-[#2D3436] shadow-[3px_3px_0_#2D3436] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center w-full sm:w-auto cursor-pointer"
                      >
                        Activer les alertes 🔔
                      </button>
                    )}

                    {notificationPermission === 'granted' && (
                      <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                        <span className="bg-white text-[#4CAF50] text-xs font-black px-3 py-2 rounded-xl border-2 border-[#2D3436] flex items-center gap-1.5 self-start sm:self-auto shadow-[2px_2px_0_#2D3436]">
                          <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-ping" />
                          Actif 🔔
                        </span>
                        
                        {/* Notification Preferences Toggles */}
                        <div className="flex flex-col gap-1.5 text-left shrink-0">
                          <span className="text-[10px] font-black uppercase text-gray-500 block">
                            Canaux d'alertes :
                          </span>
                          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                            <button
                               onClick={() => toggleNotifSetting('weather')}
                               className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#2D3436] shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer ${
                                 notifSettings.weather 
                                   ? 'bg-[#B2EBF2] text-[#2D3436] -translate-y-0.5' 
                                   : 'bg-white text-gray-400 border-gray-300 shadow-[1px_1px_0_#cccccc]'
                               }`}
                               title={notifSettings.weather ? "Désactiver les alertes météo" : "Activer les alertes météo"}
                            >
                               <span className="text-xs">{notifSettings.weather ? '🔔' : '🔕'}</span>
                               <span>Meteo ❄️</span>
                            </button>
                            <button
                               onClick={() => toggleNotifSetting('sowMonth')}
                               className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#2D3436] shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer ${
                                 notifSettings.sowMonth 
                                   ? 'bg-[#C8E6C9] text-[#2D3436] -translate-y-0.5' 
                                   : 'bg-white text-gray-400 border-gray-300 shadow-[1px_1px_0_#cccccc]'
                               }`}
                               title={notifSettings.sowMonth ? "Désactiver les rappels de semis" : "Activer les rappels de semis"}
                            >
                               <span className="text-xs">{notifSettings.sowMonth ? '🔔' : '🔕'}</span>
                               <span>Semis 🌱</span>
                            </button>
                            <button
                               onClick={() => toggleNotifSetting('tips')}
                               className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#2D3436] shadow-[2px_2px_0_#2D3436] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer ${
                                 notifSettings.tips 
                                   ? 'bg-[#FFE082] text-[#2D3436] -translate-y-0.5' 
                                   : 'bg-white text-gray-400 border-gray-300 shadow-[1px_1px_0_#cccccc]'
                               }`}
                               title={notifSettings.tips ? "Désactiver les conseils et astuces" : "Activer les conseils et astuces"}
                            >
                               <span className="text-xs">{notifSettings.tips ? '🔔' : '🔕'}</span>
                               <span>Conseils 💡</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {notificationPermission === 'denied' && (
                      <div className="text-xs font-bold text-[#E53935] bg-white border-2 border-[#E53935] px-3 py-2 rounded-xl">
                        ⚠️ Notifs désactivées
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {weatherData && gardenAlertsCount > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-[#EF4444] rounded-[40px] p-2 border-4 border-[#2D3436] shadow-[0_8px_0_#2D3436] mb-8"
                >
                  <div className="bg-white rounded-[32px] p-6 flex flex-col items-center text-center">
                    <div className="bg-white p-3 rounded-2xl border-4 border-[#EF4444] mb-4 shadow-[4px_4px_0_#EF4444] animate-pulse">
                      <AlertTriangle className="w-10 h-10 text-[#EF4444]" strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#EF4444] uppercase italic mb-2">Alerte Protection !</h3>
                      <p className="font-black text-[#2D3436] leading-tight text-sm sm:text-base">
                        {gardenAlertsCount === 1 
                          ? "1 de vos cultures risque de souffrir des conditions météo actuelles."
                          : `${gardenAlertsCount} de vos cultures risquent de souffrir des conditions météo actuelles.`}
                        <br/>
                        Vérifiez les icônes d'alerte sur vos plantes ci-dessous.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {myGarden.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myGarden.map(cropId => {
                    const crop = allAvailableCrops.find(c => c.id === cropId);
                    if (!crop) return null;
                    const sched = currentClimate ? crop.schedule[currentClimate] : null;
                    const isHarvestMonth = sched?.harvest.includes(currentMonthIndex);
                    const isSowMonth = sched ? [...sched.sow_indoor, ...sched.sow_outdoor].includes(currentMonthIndex) : false;

                    return (
                      <motion.div 
                        layout 
                        key={cropId} 
                        className="card-cartoon bg-white p-6 relative group hover:z-20"
                      >
                         <CropRiskIcon crop={crop} weatherData={weatherData} />
                         <button 
                           onClick={() => toggleToGarden(crop)}
                           className="absolute top-4 right-4 p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 className="w-4 h-4 text-red-600" />
                         </button>

                         <div onClick={() => setSelectedCrop(crop)} className="cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                               <div className="w-16 h-16 bg-white cartoon-border rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                                 <CropIcon crop={crop} className="w-full h-full p-2" />
                               </div>
                               <div>
                                 <h3 className="font-black text-xl leading-tight">{crop.name}</h3>
                                 <span className="text-xs font-bold uppercase text-gray-500">{crop.type}</span>
                               </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className={`p-2 rounded-xl cartoon-border border-b-2 flex flex-col items-center justify-center text-center ${isSowMonth ? 'bg-orange-100 border-orange-800' : 'bg-gray-50'}`}>
                                    <span className="text-[10px] font-black uppercase">Semis</span>
                                    <span className="text-[10px] font-bold">{isSowMonth ? 'C\'est l\'heure !' : 'Plus tard'}</span>
                                  </div>
                                  <div className={`p-2 rounded-xl cartoon-border border-b-2 flex flex-col items-center justify-center text-center ${isHarvestMonth ? 'bg-green-100 border-green-800' : 'bg-gray-50'}`}>
                                    <span className="text-[10px] font-black uppercase">Récolte</span>
                                    <span className="text-[10px] font-bold">{isHarvestMonth ? 'En cours ! ✨' : 'Attendre...'}</span>
                                  </div>
                                </div>

                               <div className="text-xs font-medium text-gray-600 italic line-clamp-2">
                                 {crop.description}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-white cartoon-border rounded-[3rem] border-dashed border-4 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-4xl">🌵</div>
                  <h3 className="text-2xl font-black">Votre jardin est vide</h3>
                  <p className="font-medium text-gray-600 max-w-sm">
                    Ajoutez vos cultures préférées depuis les fiches de détail pour les retrouver ici facilement.
                  </p>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="btn-cartoon bg-[#FFD93D] px-8 py-3 font-black"
                  >
                    Découvrir des cultures
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
               <h2 className="text-3xl font-black flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-500" /> Guide du Jardinier
               </h2>

               <div className="grid gap-6">
                 {TIPS.map((tip, i) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                     key={tip.title} 
                     className="card-cartoon bg-white p-6 sm:p-8 flex gap-6 hover:-translate-y-1 transition-transform"
                   >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F5F5] cartoon-border rounded-3xl flex items-center justify-center text-4xl shrink-0">
                        {tip.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black mb-2">{tip.title}</h3>
                        <p className="text-gray-700 font-medium leading-relaxed">{tip.content}</p>
                      </div>
                   </motion.div>
                 ))}
               </div>

               <div className="card-cartoon bg-emerald-100 p-8 border-dashed">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Le saviez-vous ?
                  </h3>
                  <p className="font-medium text-emerald-900 italic">
                    "Les vers de terre sont les meilleurs amis du jardinier : ils aèrent le sol et transforment la matière organique en nutriments directement utilisables par vos plantes."
                  </p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center pb-24 sm:pb-8 pt-4">
        <a href="/privacy" className="text-xs font-bold text-gray-500 hover:text-[#2D3436] underline decoration-2 underline-offset-2 transition-colors">
          Règles de confidentialité
        </a>
      </footer>

      <AnimatePresence>
        {selectedCrop && biome && (
          <CropDetailModal 
            crop={selectedCrop} 
            onClose={() => setSelectedCrop(null)} 
            onAddToGarden={toggleToGarden}
            isInGarden={myGarden.includes(selectedCrop.id)}
            weatherData={weatherData}
            allAvailableCrops={allAvailableCrops}
            biome={biome}
            currentMonthIndex={currentMonthIndex}
            onSelectCrop={setSelectedCrop}
          />
        )}
        {showImportExportModal && (
          <ImportExportModal
            onClose={() => setShowImportExportModal(false)}
            myGarden={myGarden}
            region={region}
            city={city}
            cityCoords={cityCoords}
            biome={biome}
            onImportSuccess={handleImportSuccess}
          />
        )}
      </AnimatePresence>
      <OfflineIndicator />
    </div>
  );
}
