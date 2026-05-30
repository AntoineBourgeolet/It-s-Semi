import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Info } from 'lucide-react';
import { TIPS } from '../../data';

export function TipsView() {
  return (
    <motion.div 
      key="tips"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="max-w-4xl mx-auto space-y-8"
    >
       <h2 className="text-3xl font-black flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-500" /> Guide du Jardinier
       </h2>

       <div className="grid gap-6">
         {TIPS.map((tip, i) => (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
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
  );
}
