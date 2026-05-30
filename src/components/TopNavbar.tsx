import React from 'react';
import { Sprout, Heart, BookOpen, MapPin } from 'lucide-react';
import { DEPARTMENTS } from '../departmentsData';
import { type ClimateRegion } from '../data';

export function TopNavbar({
  view,
  setView,
  region,
  city,
  biome,
  isScrolled,
  handleRegionSelect,
  handleBiomeSelect,
  setCity
}: {
  view: 'dashboard' | 'calendar' | 'my-garden' | 'tips';
  setView: (v: 'dashboard' | 'calendar' | 'my-garden' | 'tips') => void;
  region: string | null;
  city: string | null;
  biome: ClimateRegion | null;
  isScrolled: boolean;
  handleRegionSelect: (r: string | null) => void;
  handleBiomeSelect: (b: ClimateRegion | null) => void;
  setCity: (c: string | null) => void;
}) {
  return (
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
  );
}
