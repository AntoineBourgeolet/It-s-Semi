export interface WeatherData {
  tempAvg: number;
  tempMin: number;
  tempMax: number;
  precipitationNext3Days: number;
  humidityAvg: number;
  windAvg: number;
  windMin: number;
  windMax: number;
  city: string;
  alerts: { type: 'info' | 'warning' | 'danger', message: string }[];
}

const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 heures en millisecondes

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

export async function fetchClimateStats(lat: number, lon: number, city: string): Promise<WeatherData> {
  const cacheKey = `weather_cache_${lat.toFixed(2)}_${lon.toFixed(2)}_${city}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: CachedWeather = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      if (!isExpired) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn("Erreur d'accès au cache météo:", e);
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=precipitation_sum&forecast_days=3&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  const data = await response.json();
  const hourly = data.hourly;
  const daily = data.daily;
  
  const totalPrecipitation3Days = daily.precipitation_sum.reduce((acc: number, val: number) => acc + val, 0);
  
  const temperatures = hourly.temperature_2m;
  const humidities = hourly.relative_humidity_2m;
  const winds = hourly.wind_speed_10m;

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  // Generate alerts based on thresholds
  const alerts: { type: 'info' | 'warning' | 'danger', message: string }[] = [];
  
  const maxWind = Math.max(...winds);
  if (maxWind > 70) {
    alerts.push({ type: 'danger', message: `Alerte Vent Violent : rafales à ${maxWind.toFixed(0)} km/h prévues.` });
  } else if (maxWind > 50) {
    alerts.push({ type: 'warning', message: `Vent Fort : soyez vigilant lors des semis en extérieur.` });
  }

  const maxTemp = Math.max(...temperatures);
  if (maxTemp > 35) {
    alerts.push({ type: 'danger', message: `Canicule : Risque de stress hydrique majeur. Arrosage indispensable.` });
  } else if (maxTemp > 30) {
    alerts.push({ type: 'warning', message: `Forte Chaleur : Protégez les jeunes plants du plein soleil.` });
  }

  const minTemp = Math.min(...temperatures);
  if (minTemp < 0) {
    alerts.push({ type: 'danger', message: `Gelée au sol prévue (${minTemp.toFixed(1)}°C) ! Protégez vos cultures.` });
  } else if (minTemp < 5) {
    alerts.push({ type: 'warning', message: `Risque de froid : croissance ralentie pour les plantes sensibles.` });
  }

  if (totalPrecipitation3Days > 50) {
    alerts.push({ type: 'warning', message: `Pluies abondantes prévues (${totalPrecipitation3Days}mm). Attention aux excès d'eau.` });
  }

  // If no severe alerts, add a positive info
  if (alerts.length === 0) {
    const isGoodTemp = avg(temperatures) > 12 && avg(temperatures) < 22;
    if (isGoodTemp && totalPrecipitation3Days < 10) {
      alerts.push({ type: 'info', message: "Conditions idéales pour le jardinage prévues." });
    } else {
      alerts.push({ type: 'info', message: "Aucune alerte météo majeure pour les 3 prochains jours." });
    }
  }

  const weatherData: WeatherData = {
    tempAvg: Number(avg(temperatures).toFixed(1)),
    tempMin: Number(Math.min(...temperatures).toFixed(1)),
    tempMax: Number(Math.max(...temperatures).toFixed(1)),
    precipitationNext3Days: Number(totalPrecipitation3Days.toFixed(1)),
    humidityAvg: Math.round(avg(humidities)),
    windAvg: Number(avg(winds).toFixed(1)),
    windMin: Number(Math.min(...winds).toFixed(1)),
    windMax: Number(Math.max(...winds).toFixed(1)),
    city,
    alerts
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: weatherData,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn("Erreur de sauvegarde dans le cache météo:", e);
  }

  return weatherData;
}
