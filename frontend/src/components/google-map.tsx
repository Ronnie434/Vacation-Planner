"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

interface MapLocation {
  lat: number;
  lng: number;
  label?: string;
}

interface GoogleMapViewProps {
  locations: MapLocation[];
  className?: string;
}

export function GoogleMapView({ locations, className }: GoogleMapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "your_browser_restricted_key_here") {
    return (
      <div
        className={`flex items-center justify-center rounded-md border bg-muted ${className}`}
      >
        <p className="text-sm text-muted-foreground">
          Google Maps API key not configured
        </p>
      </div>
    );
  }

  if (locations.length === 0) return null;

  const center = {
    lat: locations.reduce((sum, l) => sum + l.lat, 0) / locations.length,
    lng: locations.reduce((sum, l) => sum + l.lng, 0) / locations.length,
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={12}
        className={className}
        gestureHandling="greedy"
      >
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            position={{ lat: loc.lat, lng: loc.lng }}
            title={loc.label}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
