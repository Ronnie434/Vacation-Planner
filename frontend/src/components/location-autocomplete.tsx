"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { searchCities } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { CityView } from "@/types/api";
import { MapPin } from "lucide-react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Suggestion {
  label: string;
  value: string;
  source: "google" | "backend";
}

function formatCity(city: CityView): string {
  if (city.region) {
    return `${city.city}, ${city.region}, ${city.country}`;
  }
  return `${city.city}, ${city.country}`;
}

function useGoogleAutocomplete() {
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "your_browser_restricted_key_here") return;

    if (window.google?.maps?.places) {
      serviceRef.current = new google.maps.places.AutocompleteService();
      setReady(true);
      return;
    }

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => {
        serviceRef.current = new google.maps.places.AutocompleteService();
        setReady(true);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      serviceRef.current = new google.maps.places.AutocompleteService();
      setReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const predict = useCallback(
    async (input: string): Promise<Suggestion[]> => {
      if (!serviceRef.current || !input) return [];

      return new Promise((resolve) => {
        serviceRef.current!.getPlacePredictions(
          { input, types: ["(cities)"] },
          (predictions, status) => {
            if (
              status !== google.maps.places.PlacesServiceStatus.OK ||
              !predictions
            ) {
              resolve([]);
              return;
            }
            resolve(
              predictions.map((p) => {
                const terms = p.terms;
                let value: string;
                if (terms.length >= 3) {
                  value = `${terms[0].value}, ${terms[1].value}, ${terms[terms.length - 1].value}`;
                } else if (terms.length === 2) {
                  value = `${terms[0].value}, ${terms[1].value}`;
                } else {
                  value = terms[0].value;
                }
                return {
                  label: p.description,
                  value,
                  source: "google" as const,
                };
              })
            );
          }
        );
      });
    },
    []
  );

  return { predict, ready };
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Enter a city...",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { predict, ready: googleReady } = useGoogleAutocomplete();

  useEffect(() => {
    if (debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const results: Suggestion[] = [];

      if (googleReady) {
        const googleResults = await predict(debouncedValue);
        results.push(...googleResults);
      }

      if (results.length === 0) {
        try {
          const backendResults = await searchCities(
            debouncedValue.toLowerCase()
          );
          if (backendResults?.length) {
            results.push(
              ...backendResults.map((city) => ({
                label: formatCity(city),
                value: formatCity(city),
                source: "backend" as const,
              }))
            );
          }
        } catch {
          // backend unavailable, skip
        }
      }

      setSuggestions(results);
      setIsOpen(results.length > 0);
    };

    fetchSuggestions();
  }, [debouncedValue, googleReady, predict]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              onClick={() => {
                onChange(suggestion.value);
                setIsOpen(false);
              }}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
