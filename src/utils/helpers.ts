import { type ClimateRegion } from '../data';

export const getSeasonMonths = (season: string): number[] => {
  switch (season) {
    case 'printemps': return [2, 3, 4]; // Mars, Avril, Mai
    case 'été': return [5, 6, 7]; // Juin, Juillet, Août
    case 'automne': return [8, 9, 10]; // Septembre, Octobre, Novembre
    case 'hiver': return [11, 0, 1]; // Décembre, Janvier, Février
    default: return [];
  }
};

export function importGardenData(text: string): { 
  myGarden: string[]; 
  region: string | null; 
  city: string | null; 
  cityCoords: { lat: number; lng: number } | null; 
  biome: ClimateRegion | null; 
} | null {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') return null;
    
    let gardenList: string[] = [];
    let region: string | null = null;
    let city: string | null = null;
    let cityCoords: { lat: number; lng: number } | null = null;
    let biome: ClimateRegion | null = null;

    if (Array.isArray(data)) {
      gardenList = data.filter((item: any) => typeof item === 'string');
    } else {
      if (Array.isArray(data.myGarden)) {
        gardenList = data.myGarden.filter((item: any) => typeof item === 'string');
      }
      if (data.region && typeof data.region === 'string') {
        region = data.region;
      }
      if (data.city && typeof data.city === 'string') {
        city = data.city;
      }
      if (data.cityCoords && typeof data.cityCoords === 'object' && typeof data.cityCoords.lat === 'number' && typeof data.cityCoords.lng === 'number') {
        cityCoords = { lat: data.cityCoords.lat, lng: data.cityCoords.lng };
      }
      if (data.biome && typeof data.biome === 'string') {
        biome = data.biome as ClimateRegion;
      }
    }

    return { myGarden: gardenList, region, city, cityCoords, biome };
  } catch (e) {
    return null;
  }
}
