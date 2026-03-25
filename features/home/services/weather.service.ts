// features/home/services/weather.service.ts
// Fetches real weather data from Open-Meteo API for Đà Nẵng

import type { OpenMeteoResponse } from "../types/open-meteo.types";

const DA_NANG_LAT = 16.0678;
const DA_NANG_LON = 108.2208;

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export const WeatherService = {
  /**
   * Fetch full weather forecast for Đà Nẵng
   * Includes current, hourly (7 days), and daily data
   */
  async getForecast(): Promise<OpenMeteoResponse> {
    const params = new URLSearchParams({
      latitude: String(DA_NANG_LAT),
      longitude: String(DA_NANG_LON),
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
      hourly:
        "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_moisture_3_to_9cm",
      current:
        "temperature_2m,precipitation,weather_code,wind_speed_10m",
      timezone: "Asia/Bangkok",
    });

    const url = `${OPEN_METEO_URL}?${params.toString()}`;
    // console.log("🌦 Fetching Open-Meteo:", url);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status}`);
    }

    const data: OpenMeteoResponse = await res.json();
    return data;
  },
};
