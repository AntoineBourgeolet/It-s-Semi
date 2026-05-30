import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { CROPS, MONTHS, type ClimateRegion, type Crop } from './data';
import { DEPARTMENTS } from './departmentsData';
import { type WeatherData } from './services/weatherService';
import { 
  requestNotificationPermission, 
  checkNotificationPermission, 
  triggerMonthNotification, 
  triggerWeatherAlertNotification,
  notifyStatusChanged
} from './services/notificationService';

import { OfflineIndicator } from './components/OfflineIndicator';
import { getSeasonMonths } from './utils/helpers';
import { CropDetailModal } from './components/CropDetailModal';
import { ImportExportModal } from './components/ImportExportModal';
import { TopNavbar } from './components/TopNavbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OnboardingView } from './components/views/OnboardingView';
import { DashboardView } from './components/views/DashboardView';
import { CalendarView } from './components/views/CalendarView';
import { MyGardenView } from './components/views/MyGardenView';
import { TipsView } from './components/views/TipsView';

export default function App() {
  const [region, setRegion] = useState<string | null>(() => {
    const saved = localStorage.getItem('its-semi-region');
    return saved || null;
  });
  const [biome, setBiome] = useState<ClimateRegion | null>(() => {
    const saved = localStorage.getItem('its-semi-biome');
    return (saved as ClimateRegion) || null;
  });
  const [city, setCity] = useState<string | null>(() => {
    const saved = localStorage.getItem('its-semi-city');
    return saved || null;
  });
  const [cityCoords, setCityCoords] = useState<{lat: number, lng: number} | null>(() => {
    const saved = localStorage.getItem('its-semi-city-coords');
    return saved ? JSON.parse(saved) : null;
  });
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [view, setView] = useState<'dashboard' | 'calendar' | 'my-garden' | 'tips'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedType, setSelectedType] = useState<string>('tous');
  const [selectedSeason, setSelectedSeason] = useState<string>('toute l\'année');
  const [selectedMonthAction, setSelectedMonthAction] = useState<string>('tous');
  const [selectedSpace, setSelectedSpace] = useState<'tous' | 'balcon' | 'carre' | 'pleine_terre'>('tous');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [myGarden, setMyGarden] = useState<string[]>(() => {
    const saved = localStorage.getItem('its-semi-garden');
    return saved ? JSON.parse(saved) : [];
  });
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && scrollY > 40) return true;
        if (prev && scrollY < 10) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const handleLoad = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('load', handleLoad);

    const timer1 = setTimeout(() => window.scrollTo(0, 0), 100);
    const timer2 = setTimeout(() => window.scrollTo(0, 0), 300);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return checkNotificationPermission();
  });

  const [notifSettings, setNotifSettings] = useState<{
    weather: boolean;
    sowMonth: boolean;
    tips: boolean;
  }>(() => {
    const saved = localStorage.getItem('itssemi_notif_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { weather: true, sowMonth: true, tips: true };
  });

  const toggleNotifSetting = (type: 'weather' | 'sowMonth' | 'tips') => {
    setNotifSettings(prev => {
      const newValue = !prev[type];
      const updated = { ...prev, [type]: newValue };
      localStorage.setItem('itssemi_notif_settings', JSON.stringify(updated));
      
      if (newValue && checkNotificationPermission() === 'granted') {
        notifyStatusChanged(type, true);
      }
      return updated;
    });
  };

  useEffect(() => {
    const checkPerm = () => {
      setNotificationPermission(checkNotificationPermission());
    };
    window.addEventListener('focus', checkPerm);
    return () => window.removeEventListener('focus', checkPerm);
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
  };

  React.useEffect(() => {
    const handleShortcutNavigation = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const isShortcut = params.get('shortcut');

      if (path === '/semis' || path.endsWith('/semis') || isShortcut === 'semis') {
        setView('dashboard');
        setSelectedMonthAction('sow_any');
      } else if (path === '/repiquage' || path.endsWith('/repiquage') || isShortcut === 'repiquage') {
        setView('dashboard');
        setSelectedMonthAction('repot');
      } else if (path === '/meteo' || path.endsWith('/meteo') || isShortcut === 'meteo') {
        setView('my-garden');
      }
    };

    handleShortcutNavigation();
    window.addEventListener('popstate', handleShortcutNavigation);
    return () => window.removeEventListener('popstate', handleShortcutNavigation);
  }, []);

  const handleImportSuccess = (data: {
    myGarden: string[];
    region: string | null;
    city: string | null;
    cityCoords: { lat: number; lng: number } | null;
    biome: ClimateRegion | null;
  }) => {
    setMyGarden(data.myGarden);
    localStorage.setItem('its-semi-garden', JSON.stringify(data.myGarden));

    setRegion(data.region);
    if (data.region) {
      localStorage.setItem('its-semi-region', data.region);
    } else {
      localStorage.removeItem('its-semi-region');
    }

    setCity(data.city);
    if (data.city) {
      localStorage.setItem('its-semi-city', data.city);
    } else {
      localStorage.removeItem('its-semi-city');
    }

    setCityCoords(data.cityCoords);
    if (data.cityCoords) {
      localStorage.setItem('its-semi-city-coords', JSON.stringify(data.cityCoords));
    } else {
      localStorage.removeItem('its-semi-city-coords');
    }

    setBiome(data.biome);
    if (data.biome) {
      localStorage.setItem('its-semi-biome', data.biome);
    } else {
      localStorage.removeItem('its-semi-biome');
    }
  };

  const toggleToGarden = (crop: Crop) => {
    setMyGarden(prev => {
      const next = prev.includes(crop.id) ? prev.filter(id => id !== crop.id) : [...prev, crop.id];
      localStorage.setItem('its-semi-garden', JSON.stringify(next));
      return next;
    });
  };

  const handleRegionSelect = (r: string | null) => {
    setRegion(r);
    setCity(null);
    setCityCoords(null);
    localStorage.removeItem('its-semi-city');
    localStorage.removeItem('its-semi-city-coords');
    if (r) {
      localStorage.setItem('its-semi-region', r);
      const resBiome = DEPARTMENTS[r]?.climate;
      setBiome(resBiome);
      localStorage.setItem('its-semi-biome', resBiome);
    } else {
      localStorage.removeItem('its-semi-region');
      setBiome(null);
      localStorage.removeItem('its-semi-biome');
    }
  };

  const handleCitySelect = (cityInfo: any) => {
    setCity(cityInfo.nom);
    localStorage.setItem('its-semi-city', cityInfo.nom);
    
    if (cityInfo.centre?.coordinates) {
      const coords = { lat: cityInfo.centre.coordinates[1], lng: cityInfo.centre.coordinates[0] };
      setCityCoords(coords);
      localStorage.setItem('its-semi-city-coords', JSON.stringify(coords));
    }
    
    const depCode = cityInfo.codeDepartement;
    const depKey = `dep_${depCode.padStart(2, '0')}`;
    if (DEPARTMENTS[depKey]) {
      setRegion(depKey);
      localStorage.setItem('its-semi-region', depKey);
      const resBiome = DEPARTMENTS[depKey].climate;
      setBiome(resBiome);
      localStorage.setItem('its-semi-biome', resBiome);
    }
    setCitySuggestions([]);
    setCitySearch('');
  };

  const searchCities = async (query: string) => {
    setCitySearch(query);
    if (query.length < 3) {
      setCitySuggestions([]);
      return;
    }

    setIsSearchingCity(true);
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${query}&fields=nom,code,codeDepartement,centre&limit=5`);
      const data = await response.json();
      setCitySuggestions(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleBiomeSelect = (b: ClimateRegion | null) => {
    setBiome(b);
    setRegion(null);
    localStorage.removeItem('its-semi-region');
    if (b) {
      localStorage.setItem('its-semi-biome', b);
    } else {
      localStorage.removeItem('its-semi-biome');
    }
  };

  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(() => {
    return new Date().getMonth();
  });

  const allAvailableCrops = useMemo(() => {
    const flattened: (Crop & { isVariety?: boolean; varietyName?: string; baseId: string })[] = [];
    CROPS.forEach(crop => {
      flattened.push({ ...crop, baseId: crop.id });
      if (crop.varieties) {
        crop.varieties.forEach(v => {
          flattened.push({
            ...crop,
            id: `${crop.id}_v_${v.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: `${crop.name} ${v.name}`,
            description: v.description,
            image: v.image || crop.image,
            schedule: v.schedule,
            sensitivity: v.sensitivity || crop.sensitivity,
            varieties: [],
            isVariety: true,
            varietyName: v.name,
            baseId: crop.id
          });
        });
      }
    });
    return flattened;
  }, []);

  const myGardenCrops = useMemo(() => {
    return myGarden.map(id => allAvailableCrops.find(c => c.id === id)).filter((c): c is (Crop & { isVariety?: boolean; varietyName?: string; baseId: string }) => !!c);
  }, [myGarden, allAvailableCrops]);

  const gardenAlertsCount = useMemo(() => {
    if (!weatherData) return 0;
    return myGardenCrops.reduce((count, crop) => {
      if (!crop.sensitivity) return count;
      const hasRisk = (crop.sensitivity.cold && weatherData.tempMin < 5) ||
                      (crop.sensitivity.heat && weatherData.tempMax > 30) ||
                      (crop.sensitivity.wind && weatherData.windMax > 50);
      return hasRisk ? count + 1 : count;
    }, 0);
  }, [myGardenCrops, weatherData]);

  useEffect(() => {
    if (notificationPermission === 'granted') {
      const currentMonthName = MONTHS[currentMonthIndex];
      triggerMonthNotification(currentMonthName);
    }
  }, [currentMonthIndex, notificationPermission]);

  useEffect(() => {
    if (notificationPermission === 'granted' && weatherData && gardenAlertsCount > 0) {
      const activeAlerts = weatherData.alerts.filter(a => a.type === 'danger' || a.type === 'warning');
      if (activeAlerts.length > 0) {
        triggerWeatherAlertNotification(gardenAlertsCount, activeAlerts[0].message);
      }
    }
  }, [weatherData, gardenAlertsCount, notificationPermission]);

  const currentClimate = biome;

  const cropsFilteredByCategory = useMemo(() => {
    return allAvailableCrops.filter(c => {
      const matchesType = selectedType === 'tous' || c.type === selectedType;
      
      let matchesSeason = true;
      if (selectedSeason !== 'toute l\'année' && currentClimate) {
        const seasonMonths = getSeasonMonths(selectedSeason);
        const sched = c.schedule[currentClimate];
        const allActiveMonths = [...sched.sow_indoor, ...sched.sow_outdoor, ...sched.repot];
        matchesSeason = seasonMonths.some(m => allActiveMonths.includes(m));
      }

      let matchesSpace = true;
      if (selectedSpace === 'balcon') {
        const excludedForBalcony = [
          'pomme-de-terre', 'potiron', 'courge-butternut', 'artichaut', 
          'asperge', 'celeri', 'mais', 'melon', 'rhubarbe', 'chou-fleur', 
          'chou-bruxelles', 'brocoli', 'poireau', 'panais', 'radis-noir'
        ];
        matchesSpace = !excludedForBalcony.includes(c.baseId);
      } else if (selectedSpace === 'carre') {
        const excludedForCarre = [
          'potiron', 'courge-butternut', 'artichaut', 'rhubarbe', 
          'pomme-de-terre', 'asperge'
        ];
        matchesSpace = !excludedForCarre.includes(c.baseId);
      }

      return matchesType && matchesSeason && matchesSpace;
    });
  }, [allAvailableCrops, selectedType, selectedSeason, currentClimate, selectedSpace]);

  const filteredCrops = useMemo(() => {
    return cropsFilteredByCategory.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.type.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (currentClimate && selectedMonthAction !== 'tous') {
        const sched = c.schedule[currentClimate];
        if (!sched) return false;

        if (selectedMonthAction === 'sow_any') {
          return sched.sow_indoor.includes(currentMonthIndex) || sched.sow_outdoor.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'sow_indoor') {
          return sched.sow_indoor.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'sow_outdoor') {
          return sched.sow_outdoor.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'repot') {
          return sched.repot.includes(currentMonthIndex);
        } else if (selectedMonthAction === 'harvest') {
          return sched.harvest?.includes(currentMonthIndex) || false;
        }
      }

      return true;
    });
  }, [cropsFilteredByCategory, searchQuery, selectedMonthAction, currentClimate, currentMonthIndex]);

  if (!biome) {
    return (
      <OnboardingView 
        region={region}
        handleRegionSelect={handleRegionSelect}
        citySearch={citySearch}
        searchCities={searchCities}
        isSearchingCity={isSearchingCity}
        citySuggestions={citySuggestions}
        handleCitySelect={handleCitySelect}
      />
    );
  }

  const sowIndoorToday = currentClimate ? cropsFilteredByCategory.filter(c => c.schedule[currentClimate].sow_indoor.includes(currentMonthIndex)) : [];
  const sowOutdoorToday = currentClimate ? cropsFilteredByCategory.filter(c => c.schedule[currentClimate].sow_outdoor.includes(currentMonthIndex)) : [];
  const repotToday = currentClimate ? cropsFilteredByCategory.filter(c => c.schedule[currentClimate].repot.includes(currentMonthIndex)) : [];

  return (
    <div className="min-h-dvh flex flex-col bg-[#FCFAEF] overflow-x-hidden">
      <TopNavbar
        view={view}
        setView={setView}
        region={region}
        city={city}
        biome={biome}
        isScrolled={isScrolled}
        handleRegionSelect={handleRegionSelect}
        handleBiomeSelect={handleBiomeSelect}
        setCity={setCity}
      />
      <MobileBottomNav view={view} setView={setView} />

      <main className="flex-1 px-4 sm:px-6 pb-24 sm:pb-12 flex flex-col pt-4 sm:pt-0">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <DashboardView 
              biome={biome}
              region={region}
              city={city}
              cityCoords={cityCoords}
              setWeatherData={setWeatherData}
              setCurrentMonthIndex={setCurrentMonthIndex}
              currentMonthIndex={currentMonthIndex}
              setSelectedSpace={setSelectedSpace}
              selectedSpace={selectedSpace}
              sowIndoorToday={sowIndoorToday}
              sowOutdoorToday={sowOutdoorToday}
              repotToday={repotToday}
              setSelectedCrop={setSelectedCrop}
              weatherData={weatherData}
            />
          ) : view === 'calendar' ? (
            <CalendarView 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setView={setView}
              setIsMobileSearchExpanded={setIsMobileSearchExpanded}
              setShowMobileFilters={setShowMobileFilters}
              selectedType={selectedType}
              selectedSeason={selectedSeason}
              selectedMonthAction={selectedMonthAction}
              filteredCrops={filteredCrops}
              setSelectedCrop={setSelectedCrop}
              weatherData={weatherData}
              currentClimate={currentClimate}
              currentMonthIndex={currentMonthIndex}
            />
          ) : view === 'my-garden' ? (
            <MyGardenView
              myGarden={myGarden}
              allAvailableCrops={allAvailableCrops}
              currentClimate={currentClimate}
              currentMonthIndex={currentMonthIndex}
              weatherData={weatherData}
              gardenAlertsCount={gardenAlertsCount}
              setShowImportExportModal={setShowImportExportModal}
              notificationPermission={notificationPermission}
              handleRequestPermission={handleRequestPermission}
              toggleNotifSetting={toggleNotifSetting}
              notifSettings={notifSettings}
              toggleToGarden={toggleToGarden}
              setSelectedCrop={setSelectedCrop}
              setView={setView}
            />
          ) : (
            <TipsView />
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center pb-24 sm:pb-8 pt-4">
        <a href={`${import.meta.env.BASE_URL}privacy`} className="text-xs font-bold text-gray-500 hover:text-[#2D3436] underline decoration-2 underline-offset-2 transition-colors">
          Règles de confidentialité
        </a>
      </footer>

      <AnimatePresence>
        {selectedCrop && biome && (
          <CropDetailModal 
            crop={selectedCrop} 
            onClose={() => setSelectedCrop(null)} 
            onAddToGarden={toggleToGarden}
            isInGarden={myGarden.includes(selectedCrop.id)}
            weatherData={weatherData}
            allAvailableCrops={allAvailableCrops}
            biome={biome}
            currentMonthIndex={currentMonthIndex}
            onSelectCrop={setSelectedCrop}
          />
        )}
        {showImportExportModal && (
          <ImportExportModal
            onClose={() => setShowImportExportModal(false)}
            myGarden={myGarden}
            region={region}
            city={city}
            cityCoords={cityCoords}
            biome={biome}
            onImportSuccess={handleImportSuccess}
          />
        )}
      </AnimatePresence>
      <OfflineIndicator />
    </div>
  );
}
