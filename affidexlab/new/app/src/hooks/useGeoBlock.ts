import { useEffect, useState } from "react";

const BLOCKED_COUNTRIES = [
  "US", // United States
  "CU", // Cuba
  "IR", // Iran
  "KP", // North Korea
  "SY", // Syria
  "UA-43", // Crimea
];

interface GeoData {
  country?: string;
  blocked: boolean;
  loading: boolean;
  error?: string;
}

export function useGeoBlock(): GeoData {
  const [geoData, setGeoData] = useState<GeoData>({
    blocked: false,
    loading: true,
  });

  useEffect(() => {
    async function checkGeolocation() {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        const country = data.country_code;
        const blocked = BLOCKED_COUNTRIES.includes(country);
        
        setGeoData({
          country,
          blocked,
          loading: false,
        });

        if (blocked) {
          console.warn(`Access blocked for country: ${country}`);
        }
      } catch (error) {
        console.warn("Geolocation check failed:", error);
        setGeoData({
          blocked: false,
          loading: false,
          error: "Could not determine location",
        });
      }
    }

    const cachedCheck = sessionStorage.getItem("geo_check");
    if (cachedCheck) {
      const cached = JSON.parse(cachedCheck);
      const now = Date.now();
      if (now - cached.timestamp < 3600000) {
        setGeoData({
          country: cached.country,
          blocked: cached.blocked,
          loading: false,
        });
        return;
      }
    }

    checkGeolocation();
  }, []);

  useEffect(() => {
    if (!geoData.loading && geoData.country) {
      sessionStorage.setItem(
        "geo_check",
        JSON.stringify({
          country: geoData.country,
          blocked: geoData.blocked,
          timestamp: Date.now(),
        })
      );
    }
  }, [geoData]);

  return geoData;
}
