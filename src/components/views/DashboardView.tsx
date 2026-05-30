import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, Sprout, Leaf } from 'lucide-react';
import { MONTHS, type Crop, type ClimateRegion } from '../../data';
import { type WeatherData } from '../../services/weatherService';
import { ClimateInfoCard } from '../ClimateInfoCard';
import { CropButton } from '../CropButton';

export function DashboardView({
  biome,
  region,
  city,
  cityCoords,
  setWeatherData,
  setCurrentMonthIndex,
  currentMonthIndex,
  setSelectedSpace,
  selectedSpace,
  sowIndoorToday,
  sowOutdoorToday,
  repotToday,
  setSelectedCrop,
  weatherData
}: {
  biome: ClimateRegion | null;
  region: string | null;
  city: string | null;
  cityCoords: { lat: number; lng: number } | null;
  setWeatherData: (data: WeatherData | null) => void;
  setCurrentMonthIndex: React.Dispatch<React.SetStateAction<number>>;
  currentMonthIndex: number;
  setSelectedSpace: (space: 'tous' | 'balcon' | 'carre' | 'pleine_terre') => void;
  selectedSpace: 'tous' | 'balcon' | 'carre' | 'pleine_terre';
  sowIndoorToday: Crop[];
  sowOutdoorToday: Crop[];
  repotToday: Crop[];
  setSelectedCrop: (crop: Crop | null) => void;
  weatherData: WeatherData | null;
}) {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
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
  );
}
