import React from 'react';
import { Calendar, Heart, BookOpen } from 'lucide-react';

export function MobileBottomNav({
  view,
  setView
}: {
  view: 'dashboard' | 'calendar' | 'my-garden' | 'tips';
  setView: (v: 'dashboard' | 'calendar' | 'my-garden' | 'tips') => void;
}) {
  return (
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
  );
}
