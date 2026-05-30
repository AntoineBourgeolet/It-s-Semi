import React from 'react';
import { motion } from 'motion/react';
import { Heart, Download, Bell, AlertTriangle, Trash2 } from 'lucide-react';
import { type Crop, type ClimateRegion } from '../../data';
import { type WeatherData } from '../../services/weatherService';
import { CropIcon } from '../CropIcon';
import { CropRiskIcon } from '../CropRiskIcon';

export function MyGardenView({
  myGarden,
  allAvailableCrops,
  currentClimate,
  currentMonthIndex,
  weatherData,
  gardenAlertsCount,
  setShowImportExportModal,
  notificationPermission,
  handleRequestPermission,
  toggleNotifSetting,
  notifSettings,
  toggleToGarden,
  setSelectedCrop,
  setView
}: {
  myGarden: string[];
  allAvailableCrops: (Crop & { isVariety?: boolean; varietyName?: string; baseId: string })[];
  currentClimate: ClimateRegion | null;
  currentMonthIndex: number;
  weatherData: WeatherData | null;
  gardenAlertsCount: number;
  setShowImportExportModal: (show: boolean) => void;
  notificationPermission: NotificationPermission;
  handleRequestPermission: () => void;
  toggleNotifSetting: (type: 'weather' | 'sowMonth' | 'tips') => void;
  notifSettings: { weather: boolean; sowMonth: boolean; tips: boolean };
  toggleToGarden: (crop: Crop) => void;
  setSelectedCrop: (crop: Crop) => void;
  setView: (v: 'dashboard' | 'calendar' | 'my-garden' | 'tips') => void;
}) {
  return (
    <motion.div 
      key="my-garden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
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
            const isHarvestMonth = sched?.harvest?.includes(currentMonthIndex) ?? false;
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
                   className="absolute top-4 right-4 p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 z-10"
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
  );
}
