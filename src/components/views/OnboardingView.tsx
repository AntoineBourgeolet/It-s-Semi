import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, ChevronRight } from 'lucide-react';
import { DEPARTMENTS } from '../../departmentsData';

export function OnboardingView({
  region,
  handleRegionSelect,
  citySearch,
  searchCities,
  isSearchingCity,
  citySuggestions,
  handleCitySelect
}: {
  region: string | null;
  handleRegionSelect: (r: string | null) => void;
  citySearch: string;
  searchCities: (query: string) => void;
  isSearchingCity: boolean;
  citySuggestions: any[];
  handleCitySelect: (cityInfo: any) => void;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-[#FCFAEF] overflow-hidden">
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
            <div className="bg-[#2D3436] rounded-[30px] sm:rounded-[40px] p-1.5 sm:p-2 border-4 border-[#1E1E1E] shadow-[0_8px_0_#1E1E1E] sm:shadow-[0_12px_0_#1E1E1E]">
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
                            className="absolute z-50 left-0 right-0 bottom-full mb-2 sm:bottom-auto sm:mb-0 sm:top-full sm:mt-2 bg-white border-[3px] sm:border-4 border-[#2D3436] rounded-xl sm:rounded-2xl shadow-[4px_4px_0_#2D3436] overflow-hidden max-h-48 overflow-y-auto"
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
