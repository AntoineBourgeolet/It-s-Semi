import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Search, SlidersHorizontal } from 'lucide-react';
import { MONTHS, type Crop, type ClimateRegion } from '../../data';
import { type WeatherData } from '../../services/weatherService';
import { CropIcon } from '../CropIcon';
import { CropRiskIcon } from '../CropRiskIcon';

export function CalendarView({
  searchQuery,
  setSearchQuery,
  setView,
  setIsMobileSearchExpanded,
  setShowMobileFilters,
  selectedType,
  selectedSeason,
  selectedMonthAction,
  filteredCrops,
  setSelectedCrop,
  weatherData,
  currentClimate,
  currentMonthIndex
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setView: (v: 'dashboard' | 'calendar' | 'my-garden' | 'tips') => void;
  setIsMobileSearchExpanded: (expanded: boolean) => void;
  setShowMobileFilters: (show: boolean) => void;
  selectedType: string;
  selectedSeason: string;
  selectedMonthAction: string;
  filteredCrops: (Crop & { isVariety?: boolean; varietyName?: string; baseId: string })[];
  setSelectedCrop: (crop: Crop) => void;
  weatherData: WeatherData | null;
  currentClimate: ClimateRegion | null;
  currentMonthIndex: number;
}) {
  return (
    <motion.div 
      key="calendar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="max-w-7xl mx-auto w-full px-2 sm:px-0 md:flex-1 md:flex md:flex-col md:min-h-0"
    >
      <div className="card-cartoon bg-white flex flex-col md:flex-1 md:overflow-hidden md:min-h-0 md:h-[calc(100dvh-250px)] lg:h-[calc(100dvh-210px)]">
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
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 font-bold mb-2">
              <span>Filtres actifs :</span>
              {selectedType !== 'tous' && <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md border border-orange-200">Catégorie : {selectedType}</span>}
              {selectedSeason !== "toute l'année" && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-md border border-green-200">Saison : {selectedSeason}</span>}
              {selectedMonthAction !== 'tous' && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">Action du mois : {selectedMonthAction}</span>}
              {selectedType === 'tous' && selectedSeason === "toute l'année" && selectedMonthAction === 'tous' && <span>Aucun filtre</span>}
            </div>
          </div>
         </div>

         {/* Table Body */}
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
                              const hasHarvest = sched?.harvest?.includes(mIdx);
                              
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
  );
}
