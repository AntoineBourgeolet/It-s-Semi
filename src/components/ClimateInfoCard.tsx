import React, { useEffect, useState } from 'react';
import { Thermometer, CloudRain, Droplets, Wind, Info, Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchClimateStats, type WeatherData } from '../services/weatherService';
import { REGIONS, type ClimateRegion } from '../data';
import { DEPARTMENTS } from '../departmentsData';
import { motion } from 'motion/react';

interface ClimateInfoCardProps {
  biome: ClimateRegion;
  departmentId?: string | null;
  cityName?: string | null;
  cityCoords?: { lat: number, lng: number } | null;
  onWeatherDataUpdate?: (data: WeatherData | null) => void;
}

export function ClimateInfoCard({ biome, departmentId, cityName, cityCoords, onWeatherDataUpdate }: ClimateInfoCardProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const regionInfo = REGIONS.find(r => r.id === biome);
  const departmentInfo = departmentId ? DEPARTMENTS[departmentId] : null;

  useEffect(() => {
    let lat: number, lng: number, city: string;

    if (cityCoords && cityName) {
      lat = cityCoords.lat;
      lng = cityCoords.lng;
      city = cityName;
    } else if (departmentInfo) {
      lat = departmentInfo.lat;
      lng = departmentInfo.lng;
      city = departmentInfo.city;
    } else if (regionInfo) {
      lat = regionInfo.lat;
      lng = regionInfo.lng;
      city = regionInfo.city;
    } else {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchClimateStats(lat, lng, city)
      .then(stats => {
        if (isMounted) {
          setData(stats);
          onWeatherDataUpdate?.(stats);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError('Erreur de chargement des données météo');
          onWeatherDataUpdate?.(null);
          setLoading(false);
          console.error(err);
        }
      });

    return () => { isMounted = false; };
  }, [biome, departmentId, cityName, cityCoords, regionInfo, departmentInfo, onWeatherDataUpdate]);

  if (loading) {
    return (
      <div className="card-cartoon bg-white p-8 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="font-bold text-[#2D3436]">Chargement de la météo des 3 prochains jours...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-cartoon bg-red-50 p-6 flex items-center gap-4 border-red-200">
        <Info className="text-red-500 w-10 h-10" />
        <p className="font-bold text-red-800">{error || 'Données indisponibles'}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card-cartoon overflow-hidden bg-white`}
    >
      <div className={`p-2 sm:p-4 border-b-4 border-[#2D3436] ${regionInfo?.color} flex items-center justify-between gap-2`}>
        <h3 className="text-xs sm:text-xl font-black flex items-center gap-1 sm:gap-2 min-w-0">
           {regionInfo?.icon} <span className="text-[#2D3436] truncate">Météo des 3 prochains jours</span>
        </h3>
        <div className="hidden sm:block shrink-0">
          <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black cartoon-border uppercase whitespace-nowrap text-[#2D3436]">
            Climat {regionInfo?.name}
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* Temperature */}
        <div className="bg-orange-50 p-2 sm:p-4 rounded-xl sm:rounded-2xl cartoon-border cartoon-shadow-xs sm:cartoon-shadow-sm flex flex-col items-center justify-between gap-2.5" role="group" aria-label="Température">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-center w-full">
            <div className="bg-orange-100 p-1 sm:p-1.5 rounded-lg shrink-0 flex items-center justify-center">
              <Thermometer className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-600" aria-hidden="true" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-orange-800 uppercase tracking-tight whitespace-nowrap">Température</span>
          </div>
          
          <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 w-full">
            {/* Min Temp */}
            <div className="flex flex-col items-center justify-center bg-[#E5F6FF] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-blue-600 leading-none mb-0.5">Min</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-[#2D3436] leading-tight whitespace-nowrap">{data.tempMin}°C</span>
            </div>
            
            {/* Max Temp */}
            <div className="flex flex-col items-center justify-center bg-[#FFF0F0] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-red-600 leading-none mb-0.5">Max</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-[#2D3436] leading-tight whitespace-nowrap">{data.tempMax}°C</span>
            </div>
          </div>

          <div className="text-[9px] sm:text-[11px] font-bold text-orange-800 bg-orange-100/50 px-2.5 py-0.5 rounded-full border border-orange-200">
            Moyenne : <span className="font-extrabold text-[#2D3436]">{data.tempAvg}°C</span>
          </div>
        </div>

        {/* Precipitation */}
        <div className="bg-blue-50 p-2 sm:p-4 rounded-xl sm:rounded-2xl cartoon-border cartoon-shadow-xs sm:cartoon-shadow-sm flex flex-col items-center justify-between gap-2.5" role="group" aria-label="Précipitations">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-center w-full">
            <div className="bg-blue-100 p-1 sm:p-1.5 rounded-lg shrink-0 flex items-center justify-center">
              <CloudRain className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" aria-hidden="true" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-blue-800 uppercase tracking-tight whitespace-nowrap">Eau / Pluie</span>
          </div>
          
          <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 w-full">
            {/* Cumul 3j */}
            <div className="flex flex-col items-center justify-center bg-[#F3F0FF] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-purple-600 leading-none mb-0.5">Cumul 3j</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-[#2D3436] leading-tight whitespace-nowrap">{data.precipitationNext3Days} mm</span>
            </div>
            
            {/* Arrosage Statut */}
            <div className="flex flex-col items-center justify-center bg-[#E6FDF4] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-600 leading-none mb-0.5">Arrosage</span>
              <span className="text-[9px] min-[340px]:text-xs sm:text-sm font-black text-[#2D3436] leading-tight text-center whitespace-nowrap px-0.5">
                {data.precipitationNext3Days === 0 ? "À prévoir" : data.precipitationNext3Days < 10 ? "Modéré" : "Inutile"}
              </span>
            </div>
          </div>

          <div className="text-[9px] sm:text-[11px] font-bold text-blue-800 bg-blue-100/50 px-2.5 py-0.5 rounded-full border border-blue-200 text-center truncate max-w-full">
            {data.precipitationNext3Days === 0 ? "Temps sec, arrosez !" : data.precipitationNext3Days < 10 ? "Pluie fine, surveillez." : "Bonne pluie, arrosage naturel."}
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-emerald-50 p-2 sm:p-4 rounded-xl sm:rounded-2xl cartoon-border cartoon-shadow-xs sm:cartoon-shadow-sm flex flex-col items-center justify-between gap-2.5" role="group" aria-label="Humidité">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-center w-full">
            <div className="bg-emerald-100 p-1 sm:p-1.5 rounded-lg shrink-0 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" aria-hidden="true" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-tight whitespace-nowrap">Humidité</span>
          </div>
          
          <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 w-full">
            {/* Moyenne */}
            <div className="flex flex-col items-center justify-center bg-[#FFFBF0] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-600 leading-none mb-0.5">Moyenne</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-[#2D3436] leading-tight whitespace-nowrap">{data.humidityAvg}%</span>
            </div>
            
            {/* Air */}
            <div className="flex flex-col items-center justify-center bg-[#FDF2F8] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-pink-600 leading-none mb-0.5">Air</span>
              <span className="text-xs sm:text-sm font-black text-[#2D3436] leading-tight whitespace-nowrap">
                {data.humidityAvg < 50 ? "Sec" : data.humidityAvg <= 75 ? "Idéal" : "Humide"}
              </span>
            </div>
          </div>

          <div className="text-[9px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100/50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-center truncate max-w-full">
            {data.humidityAvg < 50 ? "Favorise l'évaporation" : data.humidityAvg <= 75 ? "Excellent pour la croissance" : "Risque de maladies fongiques"}
          </div>
        </div>

        {/* Wind */}
        <div className="bg-zinc-50 p-2 sm:p-4 rounded-xl sm:rounded-2xl cartoon-border cartoon-shadow-xs sm:cartoon-shadow-sm flex flex-col items-center justify-between gap-2.5" role="group" aria-label="Vent">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-center w-full">
            <div className="bg-zinc-200 p-1 sm:p-1.5 rounded-lg shrink-0 flex items-center justify-center">
              <Wind className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-zinc-600" aria-hidden="true" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-zinc-800 uppercase tracking-tight whitespace-nowrap">Vent</span>
          </div>
          
          <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 w-full">
            {/* Moyenne */}
            <div className="flex flex-col items-center justify-center bg-[#F8FAFC] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-500 leading-none mb-0.5">Moyen</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-[#2D3436] leading-tight whitespace-nowrap">{data.windAvg} <span className="text-[8px] sm:text-[10px] font-bold">km/h</span></span>
            </div>
            
            {/* Max */}
            <div className="flex flex-col items-center justify-center bg-[#FFF1F2] border-2 border-[#2D3436] p-1 sm:p-1.5 rounded-xl flex-1 text-center shadow-[2px_2px_0px_#2D3436]">
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-rose-500 leading-none mb-0.5">Rafale</span>
              <span className="text-xs sm:text-base md:text-lg font-black text-[#2D3436] leading-tight whitespace-nowrap">{data.windMax} <span className="text-[8px] sm:text-[10px] font-bold">km/h</span></span>
            </div>
          </div>

          <div className="text-[9px] sm:text-[11px] font-bold text-zinc-800 bg-zinc-200/50 px-2.5 py-0.5 rounded-full border border-zinc-300 text-center truncate max-w-full">
            {data.windMax < 15 ? "Brise calme : idéal" : data.windMax <= 30 ? "Modéré : tuteurez" : "Fort : attention aux semis !"}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-2">
        {data.alerts.map((alert, idx) => (
          <div 
            key={idx}
            role="alert"
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border-2 cartoon-shadow-xs ${
              alert.type === 'danger' ? 'bg-red-50 border-red-300 text-red-950' :
              alert.type === 'warning' ? 'bg-orange-50 border-orange-300 text-orange-950' :
              'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            {alert.type === 'danger' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-700 shrink-0" aria-hidden="true" />}
            {alert.type === 'warning' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700 shrink-0" aria-hidden="true" />}
            {alert.type === 'info' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" aria-hidden="true" />}
            <span className="text-[10px] sm:text-xs font-bold leading-tight">{alert.message}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
