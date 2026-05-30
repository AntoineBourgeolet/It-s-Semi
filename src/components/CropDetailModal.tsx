import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, AlertTriangle, BookOpen, ChevronRight, Sprout, Sun, Calculator, ChevronDown, Leaf, Zap, Bug, Calendar } from 'lucide-react';
import { MONTHS, type Crop, type ClimateRegion } from '../data';
import { type WeatherData } from '../services/weatherService';
import { CropIcon } from './CropIcon';

export function CropDetailModal({ 
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
  biome: ClimateRegion | null;
  currentMonthIndex: number;
  onSelectCrop: (crop: Crop) => void;
}) {
  const risks: string[] = [];
  const [gardenArea, setGardenArea] = useState<string>('1');
  const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false);

  const getPlantsPerSqMeter = (cropItem: any) => {
    const id = cropItem.baseId || cropItem.id;
    if (['tomate', 'courgette', 'aubergine', 'melon', 'potiron', 'pasteque', 'patisson', 'artichaud', 'rhubarbe'].some((x: string) => id.includes(x))) return 2;
    if (['radis', 'carotte', 'navet'].some((x: string) => id.includes(x))) return 100;
    if (['laitue', 'mache', 'epinard', 'roquette', 'chicoré', 'bette', 'mâche', 'cresson'].some((x: string) => id.includes(x))) return 16;
    if (['fraise', 'menthe', 'romarin', 'thym', 'sauge', 'lavande', 'basilic'].some((x: string) => id.includes(x))) return 6;
    if (cropItem.type === 'herbe') return 8;
    if (['chou', 'brocoli', 'celerirave'].some((x: string) => id.includes(x))) return 4;
    if (['oignon', 'ail', 'echalotte'].some((x: string) => id.includes(x))) return 50;
    if (['poireau', 'endive'].some((x: string) => id.includes(x))) return 30;
    if (['haricot', 'petitpois', 'feve'].some((x: string) => id.includes(x))) return 40;
    if (['pommedeterre', 'topinambour'].some((x: string) => id.includes(x))) return 5;
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
