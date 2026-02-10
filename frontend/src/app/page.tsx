"use client";

import { useState, useEffect } from "react";
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
import {
  Plane,
  MapPin,
  CalendarDays,
  DollarSign,
  Search,
  Navigation,
  Sparkles,
  Globe,
  Clock,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priceLevel, setPriceLevel] = useState("2");
  const [nearby, setNearby] = useState(false);
  const [precise, setPrecise] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const geo = useGeolocation();

  const rotatingWords = ["adventure", "journey", "escape", "getaway", "trip"];
  const [wordIndex, setWordIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % rotatingWords.length);
        setIsFlipping(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLocateMe = async () => {
    await geo.locate();
    if (geo.latitude && geo.longitude) {
      setLocation(`${geo.longitude}, ${geo.latitude}`);
      setPrecise(true);
    }
  };

  const handleSearch = () => {
    if (!location || !date) return;

    // For non-precise searches, the backend requires "City, Region" or "City, Region, Country" format
    if (!precise && !/^[a-zA-Z\s]+,\s[a-zA-Z\s]+(,\s[a-zA-Z\s]+)?$/.test(location)) {
      toast.error("Please select a city from the suggestions dropdown");
      return;
    }

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
    <div className="-mx-4 -mt-4 sm:-mt-6">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-accent/20 px-4 pb-16 pt-12 sm:pb-24 sm:pt-20">
        {/* Animated decorative blobs */}
        <div className="animate-float pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="animate-float-slow pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
        <div className="animate-float pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/3 blur-3xl delay-1000" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="animate-fade-down mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Travel Planning
            </div>
            <h1 className="animate-fade-up delay-100 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Where will your next{" "}
              <span className="relative inline-block align-bottom" style={{ clipPath: "inset(-2px 0 -8px 0)" }}>
                <span
                  className="inline-block bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent transition-all duration-400 ease-out"
                  style={{
                    transform: isFlipping ? "translateY(-100%) rotateX(45deg)" : "translateY(0) rotateX(0)",
                    opacity: isFlipping ? 0 : 1,
                    filter: isFlipping ? "blur(4px)" : "blur(0px)",
                  }}
                >
                  {rotatingWords[wordIndex]}
                </span>
              </span>{" "}
              take you?
            </h1>
            <p className="animate-fade-up delay-300 mx-auto mt-4 max-w-lg text-lg text-muted-foreground sm:mt-6">
              Discover personalized itineraries crafted by AI. Just pick your
              destination and let us handle the rest.
            </p>
          </div>
        </div>
      </div>

      {/* Search card — overlaps the hero */}
      <div className="animate-scale-up delay-500 relative z-10 mx-auto -mt-12 max-w-2xl px-4">
        <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
          <div className="space-y-5">
            {/* Destination */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Destination
              </Label>
              <LocationAutocomplete
                value={location}
                onChange={(val) => {
                  setLocation(val);
                  setPrecise(false);
                }}
                placeholder="e.g. San Francisco, CA, USA"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                onClick={handleLocateMe}
                disabled={geo.loading}
              >
                <Navigation className="h-3.5 w-3.5" />
                {geo.loading ? "Locating..." : "Use my current location"}
              </Button>
            </div>

            {/* Date + Price row */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Travel Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start font-normal ${
                        !date && "text-muted-foreground"
                      }`}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
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
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Price Level
                </Label>
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
            </div>

            {/* Nearby toggle */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <Switch
                checked={nearby}
                onCheckedChange={setNearby}
                id="nearby"
              />
              <Label htmlFor="nearby" className="cursor-pointer text-sm">
                Include nearby cities for more options
              </Label>
            </div>

            {/* Search button */}
            <Button
              className="w-full gap-2 text-base"
              size="lg"
              onClick={handleSearch}
              disabled={!location || !date}
            >
              <Search className="h-5 w-5" />
              Search Plans
            </Button>
          </div>
        </div>
      </div>

      {/* How it works — reveal on click */}
      <div className="mx-auto mt-16 max-w-5xl px-4 pb-16">
        <div className="flex justify-center">
          <button
            onClick={() => setShowSteps((s) => !s)}
            className="group relative inline-flex items-center gap-3 rounded-full border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-4 text-lg font-semibold text-primary transition-all hover:border-primary/40 hover:from-primary/10 hover:to-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            How it works
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${
                showSteps ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`grid transition-all duration-500 ease-out ${
            showSteps
              ? "mt-10 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Globe,
                  title: "Choose Your Destination",
                  desc: "Search any city worldwide or use your current location to discover places nearby.",
                  step: "01",
                },
                {
                  icon: Sparkles,
                  title: "Get AI-Crafted Plans",
                  desc: "Our AI generates day-by-day itineraries tailored to your budget and preferences.",
                  step: "02",
                },
                {
                  icon: Clock,
                  title: "Save & Customize",
                  desc: "Save your favorite plans, tweak the details, and share them with your travel companions.",
                  step: "03",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  style={{
                    transitionDelay: showSteps ? `${i * 100}ms` : "0ms",
                    transform: showSteps ? "translateY(0)" : "translateY(16px)",
                    opacity: showSteps ? 1 : 0,
                    transition:
                      "transform 0.4s ease-out, opacity 0.4s ease-out, border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  <span className="absolute right-4 top-4 text-4xl font-black text-primary/10 transition-colors group-hover:text-primary/20">
                    {item.step}
                  </span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
