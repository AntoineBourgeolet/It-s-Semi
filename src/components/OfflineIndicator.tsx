import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50, x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.9, y: 50, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 z-50 w-[92%] max-w-md"
        >
          <div className="card-cartoon bg-[#FFEB3B] text-[#2D3436] p-4 flex items-center gap-3 border-4 border-[#2D3436] shadow-[4px_4px_0px_#2D3436] rounded-2xl">
            <div className="bg-[#FF8B13] p-2.5 rounded-xl border-2 border-[#2D3436] shrink-0 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            
            <div className="flex-1 text-left">
              <h4 className="font-black text-sm uppercase tracking-tight text-[#2D3436]">
                Mode hors-ligne actif
              </h4>
              <p className="text-xs font-bold text-gray-800 leading-tight">
                Vos fiches et outils de jardinage restent 100% accessibles sans réseau.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
