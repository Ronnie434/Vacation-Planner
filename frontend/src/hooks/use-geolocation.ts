"use client";

import { useState, useCallback } from "react";
import { reverseGeocode } from "@/lib/api";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: false,
    error: null,
  });

  const locate = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await reverseGeocode(latitude, longitude);
          const addr = result?.formatted_address || `${longitude}, ${latitude}`;
          setState({
            latitude,
            longitude,
            address: addr,
            loading: false,
            error: null,
          });
        } catch {
          setState({
            latitude,
            longitude,
            address: `${longitude}, ${latitude}`,
            loading: false,
            error: null,
          });
        }
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, locate };
}
