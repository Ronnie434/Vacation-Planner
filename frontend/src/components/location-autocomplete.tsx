"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchCities } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { CityView } from "@/types/api";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function formatCity(city: CityView): string {
  if (city.admin_area_level_one) {
    return `${city.city}, ${city.admin_area_level_one}, ${city.country}`;
  }
  return `${city.city}, ${city.country}`;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Enter a city...",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CityView[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }

    searchCities(debouncedValue.toLowerCase()).then((results) => {
      setSuggestions(results || []);
      setIsOpen(true);
    }).catch(() => setSuggestions([]));
  }, [debouncedValue]);

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
          {suggestions.map((city, idx) => (
            <li
              key={idx}
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              onClick={() => {
                onChange(formatCity(city));
                setIsOpen(false);
              }}
            >
              {formatCity(city)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
