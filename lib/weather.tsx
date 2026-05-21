// lib/weather.ts

export interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  apparent_temperature: number;
  humidity: number;
  wind_speed: number;
  weather_code: number;
}

async function geocodeCity(city: string): Promise<GeoResult> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results?.length) throw new Error("City not found");
  const { name, country, latitude, longitude } = data.results[0];
  return { name, country, latitude, longitude };
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const { name, country, latitude, longitude } = await geocodeCity(city);

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
  );
  const data = await res.json();
  const c = data.current;

  return {
    city: name,
    country,
    temperature: c.temperature_2m,
    apparent_temperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind_speed: c.wind_speed_10m,
    weather_code: c.weather_code,
  };
}

export type WeatherCondition =
  | 'day-sunny'
  | 'day-cloudy'
  | 'cloudy'
  | 'day-fog'
  | 'day-sleet'
  | 'day-sprinkle'
  | 'day-rain'
  | 'day-rain-mix'
  | 'day-snow'
  | 'day-snow-wind'
  | 'day-showers'
  | 'snowflake-cold'
  | 'day-lightning'
  | 'day-snow-thunderstorm'

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0)                         return 'day-sunny'
  if (code <= 2)                          return 'day-cloudy'
  if (code === 3)                         return 'cloudy'
  if (code === 45 || code === 48)         return 'day-fog'
  if (code >= 51 && code <= 55)           return 'day-sleet'
  if (code === 56 || code === 57)         return 'day-sprinkle'
  if (code >= 61 && code <= 65)           return 'day-rain'
  if (code === 66 || code === 67)         return 'day-rain-mix'
  if (code >= 71 && code <= 75)           return 'day-snow'
  if (code === 77)                        return 'day-snow-wind'
  if (code >= 80 && code <= 82)           return 'day-showers'
  if (code === 85 || code === 86)         return 'snowflake-cold'
  if (code === 95)                        return 'day-lightning'
  if (code === 96 || code === 99)         return 'day-snow-thunderstorm'
  return 'day-sunny'
}