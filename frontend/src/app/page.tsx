"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { useGeolocation } from "@/hooks/use-geolocation";
import { format } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priceLevel, setPriceLevel] = useState("2");
  const [nearby, setNearby] = useState(false);
  const [precise, setPrecise] = useState(false);
  const geo = useGeolocation();

  const handleLocateMe = async () => {
    await geo.locate();
    if (geo.latitude && geo.longitude) {
      setLocation(`${geo.longitude}, ${geo.latitude}`);
      setPrecise(true);
    }
  };

  const handleSearch = () => {
    if (!location || !date) return;
    const params = new URLSearchParams({
      location,
      date: format(date, "yyyy-MM-dd"),
      price: priceLevel,
      nearby: String(nearby),
      precise: String(precise),
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 sm:gap-8 sm:py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Vacation Planner</h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Discover and plan your perfect travel itinerary
        </p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        <div className="space-y-2">
          <Label>Destination</Label>
          <LocationAutocomplete
            value={location}
            onChange={(val) => {
              setLocation(val);
              setPrecise(false);
            }}
            placeholder="e.g. San Francisco, CA, USA"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={geo.loading}
          >
            {geo.loading ? "Locating..." : "Use My Location"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Travel Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Price Level</Label>
          <Select value={priceLevel} onValueChange={setPriceLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Free</SelectItem>
              <SelectItem value="1">Inexpensive</SelectItem>
              <SelectItem value="2">Moderate</SelectItem>
              <SelectItem value="3">Expensive</SelectItem>
              <SelectItem value="4">Very Expensive</SelectItem>
              <SelectItem value="0,1,2,3,4">Surprise Me!</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={nearby} onCheckedChange={setNearby} id="nearby" />
          <Label htmlFor="nearby">Include nearby cities</Label>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSearch}
          disabled={!location || !date}
        >
          Search Plans
        </Button>
      </div>
    </div>
  );
}
