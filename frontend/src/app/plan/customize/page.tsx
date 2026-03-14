"use client";

import { useState } from "react";
import Link from "next/link";
import { customizePlan } from "@/lib/api";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  MapPin,
  CalendarDays,
  DollarSign,
  Plus,
  X,
  Utensils,
  Landmark,
  Clock,
  Sparkles,
  GripVertical,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import type { PlanningResponse } from "@/types/api";

interface TimeSlot {
  category: string;
  startHour: number;
  endHour: number;
}

type Phase = "configure" | "loading" | "results";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

const PRICE_LABELS: Record<string, string> = {
  "0": "Free",
  "1": "Inexpensive",
  "2": "Moderate",
  "3": "Expensive",
  "4": "Very Expensive",
};

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = (hour - h) * 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatHourShort(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayH} ${period}`;
}

const categoryConfig = {
  Visit: {
    icon: Landmark,
    label: "Visit",
    description: "Parks, museums, galleries, attractions",
    color: "border bg-card",
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  Eatery: {
    icon: Utensils,
    label: "Eatery",
    description: "Restaurants, cafes, food spots",
    color: "border bg-card",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
} as const;

export default function CustomizePlanPage() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priceLevel, setPriceLevel] = useState("2");
  const [slots, setSlots] = useState<TimeSlot[]>([
    { category: "Visit", startHour: 10, endHour: 12 },
    { category: "Eatery", startHour: 12, endHour: 13 },
    { category: "Visit", startHour: 14, endHour: 17 },
  ]);
  const [results, setResults] = useState<PlanningResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("configure");
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);

  const addSlot = () => {
    const last = slots[slots.length - 1];
    const start = last ? last.endHour : 10;
    const end = Math.min(start + 2, 23);
    if (start >= 23) {
      toast.error("Cannot add more time slots — day is full");
      return;
    }
    setSlots([
      ...slots,
      { category: "Visit", startHour: start, endHour: end },
    ]);
  };

  const removeSlot = (idx: number) => {
    if (slots.length <= 1) {
      toast.error("You need at least one time slot");
      return;
    }
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const updateSlot = (
    idx: number,
    field: keyof TimeSlot,
    value: string | number
  ) => {
    const updated = [...slots];
    updated[idx] = { ...updated[idx], [field]: value };
    setSlots(updated);
  };

  const handleSearch = async () => {
    if (!location || !date || slots.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    for (let i = 0; i < slots.length; i++) {
      if (slots[i].startHour >= slots[i].endHour) {
        toast.error(`Slot ${i + 1}: end time must be after start time`);
        return;
      }
    }

    const dateStr = format(date, "yyyy-MM-dd");
    const locationFields = location.split(", ");
    const requestData = {
      location: {
        city: locationFields[0] || "",
        adminAreaLevelOne:
          locationFields.length === 3 ? locationFields[1] : "",
        country: locationFields[locationFields.length - 1] || "",
      },
      slots: slots.map((s) => ({
        category: s.category,
        time_slot: {
          slot: { start: s.startHour, end: s.endHour },
        },
      })),
    };

    setPhase("loading");
    try {
      const data = await customizePlan(requestData, dateStr, priceLevel, 5);
      if (data.travel_plans && data.travel_plans.length > 0) {
        setResults(data);
        setSelectedPlanIdx(0);
        setPhase("results");
      } else {
        toast.error("No plans found — try different parameters");
        setPhase("configure");
      }
    } catch {
      toast.error("Failed to generate plans");
      setPhase("configure");
    }
  };

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const selectedPlan = results?.travel_plans?.[selectedPlanIdx];

  /* ================================================================
     LOADING PHASE
     ================================================================ */
  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-3xl pb-12">
        <div className="animate-fade-up py-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Crafting your itinerary
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Finding the best places in{" "}
            <span className="font-medium text-foreground">{location}</span>
            {date && (
              <>
                {" "}
                for{" "}
                <span className="font-medium text-foreground">
                  {format(date, "MMMM d")}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Skeleton timeline */}
        <div className="animate-fade-up delay-300 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 sm:gap-4">
              <div className="w-14 shrink-0 pt-5 text-right sm:w-20">
                <div className="ml-auto h-3.5 w-10 animate-pulse rounded-md bg-muted sm:w-12" />
                <div className="ml-auto mt-1.5 h-2.5 w-8 animate-pulse rounded-md bg-muted/60" />
              </div>
              <div className="relative flex flex-col items-center">
                <div className="mt-4 h-7 w-7 animate-pulse rounded-full bg-muted sm:h-8 sm:w-8" />
                {i < 2 && <div className="w-px flex-1 bg-border" />}
              </div>
              <div className={`flex-1 ${i < 2 ? "pb-5 sm:pb-6" : "pb-2"}`}>
                <div className="rounded-xl border bg-card p-3.5 shadow-sm sm:p-4">
                  <div className="h-5 w-14 animate-pulse rounded-md bg-muted" />
                  <div className="mt-2.5 h-4 w-40 animate-pulse rounded-md bg-muted sm:w-52" />
                  <div className="mt-2 h-3 w-32 animate-pulse rounded-md bg-muted/60 sm:w-44" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ================================================================
     RESULTS PHASE
     ================================================================ */
  if (phase === "results" && results?.travel_plans?.length) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 pb-12 sm:space-y-6">
        {/* Back + heading */}
        <div className="animate-fade-up">
          <button
            onClick={() => setPhase("configure")}
            className="group mb-3 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Modify search
          </button>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              {results.travel_destination}
            </h1>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {date ? format(date, "MMMM d, yyyy") : ""}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              {PRICE_LABELS[priceLevel]}
            </span>
            <span className="text-border">·</span>
            <span>
              {results.travel_plans.length} plan
              {results.travel_plans.length !== 1 && "s"} generated
            </span>
          </div>
        </div>

        {/* Plan selector pills */}
        <div className="animate-fade-up delay-100 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {results.travel_plans.map((plan, idx) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanIdx(idx)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                idx === selectedPlanIdx
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              Plan {idx + 1}
              <span className="ml-1.5 text-xs opacity-70">
                · {plan.places.length} stop{plan.places.length !== 1 && "s"}
              </span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        {selectedPlan && (
          <div key={selectedPlan.id}>
            <div>
              {selectedPlan.places.map((place, i) => {
                const cat =
                  place.place_icon_css_class === "eatery"
                    ? "Eatery"
                    : "Visit";
                const cfg =
                  categoryConfig[cat as keyof typeof categoryConfig];
                const Icon = cfg.icon;
                const isLast = i === selectedPlan.places.length - 1;

                return (
                  <div
                    key={place.id}
                    className="animate-fade-up flex gap-3 sm:gap-4"
                    style={{ animationDelay: `${150 + i * 80}ms` }}
                  >
                    {/* Time column */}
                    <div className="w-14 shrink-0 pt-4 text-right sm:w-20">
                      <p className="text-xs font-semibold leading-tight sm:text-sm">
                        {formatHour(place.start_time)}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground sm:text-xs">
                        {formatHour(place.end_time)}
                      </p>
                    </div>

                    {/* Timeline node + line */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`z-10 mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm sm:h-8 sm:w-8 ${cfg.dot}`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      {!isLast && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>

                    {/* Place card */}
                    <div
                      className={`flex-1 ${isLast ? "pb-2" : "pb-4 sm:pb-5"}`}
                    >
                      <div className="rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] sm:text-xs ${cfg.badge}`}
                            >
                              {cfg.label}
                            </Badge>
                            <h3 className="mt-1.5 text-sm font-semibold leading-snug sm:text-base">
                              {place.url ? (
                                <a
                                  href={place.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="transition-colors hover:text-primary hover:underline"
                                >
                                  {place.place_name}
                                </a>
                              ) : (
                                place.place_name
                              )}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                              {place.address}
                            </p>
                          </div>
                          {place.url && (
                            <a
                              href={place.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              aria-label={`Open ${place.place_name} website`}
                            >
                              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View details CTA */}
            <div
              className="animate-fade-up mt-4 sm:mt-6"
              style={{
                animationDelay: `${150 + selectedPlan.places.length * 80 + 60}ms`,
              }}
            >
              <Button asChild className="w-full gap-2" size="lg">
                <Link href={`/trip/${selectedPlan.id}?date=${dateStr}`}>
                  View Full Details
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================
     CONFIGURE PHASE
     ================================================================ */
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
          Customize Your Plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Design your perfect day — choose when to explore and when to eat.
        </p>
      </div>

      {/* Trip details card */}
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:mb-4 sm:text-sm">
          Trip Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </Label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              placeholder="e.g. Tokyo, Japan"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start font-normal ${!date && "text-muted-foreground"}`}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Timeline slots */}
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:items-center">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
              Your Itinerary
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add time slots to build your day
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addSlot}
            className="shrink-0 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Slot</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {slots.map((slot, idx) => {
            const config =
              categoryConfig[slot.category as keyof typeof categoryConfig];
            const Icon = config.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-lg border p-3 transition-colors sm:p-4 ${config.color}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="mt-0.5 hidden sm:block">
                    <GripVertical className="h-5 w-5 opacity-30" />
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-9 sm:w-9">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Category */}
                    <Select
                      value={slot.category}
                      onValueChange={(v) => updateSlot(idx, "category", v)}
                    >
                      <SelectTrigger className="h-9 bg-white/80 text-sm dark:bg-black/20 sm:w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visit">
                          <span className="flex items-center gap-2">
                            <Landmark className="h-3.5 w-3.5" /> Visit
                          </span>
                        </SelectItem>
                        <SelectItem value="Eatery">
                          <span className="flex items-center gap-2">
                            <Utensils className="h-3.5 w-3.5" /> Eatery
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Time picker */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 opacity-50" />
                      <Select
                        value={String(slot.startHour)}
                        onValueChange={(v) =>
                          updateSlot(idx, "startHour", parseInt(v))
                        }
                      >
                        <SelectTrigger className="h-9 flex-1 bg-white/80 text-sm dark:bg-black/20 sm:w-[100px] sm:flex-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUR_OPTIONS.map((h) => (
                            <SelectItem key={h} value={String(h)}>
                              {formatHourShort(h)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm opacity-60">to</span>
                      <Select
                        value={String(slot.endHour)}
                        onValueChange={(v) =>
                          updateSlot(idx, "endHour", parseInt(v))
                        }
                      >
                        <SelectTrigger className="h-9 flex-1 bg-white/80 text-sm dark:bg-black/20 sm:w-[100px] sm:flex-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUR_OPTIONS.filter((h) => h > slot.startHour).map(
                            (h) => (
                              <SelectItem key={h} value={String(h)}>
                                {formatHourShort(h)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="hidden text-xs opacity-60 sm:block">
                      {config.description}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-50 hover:opacity-100 sm:h-8 sm:w-8"
                    onClick={() => removeSlot(idx)}
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {slots.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 text-center sm:py-12">
            <Clock className="mb-3 h-10 w-10 text-muted-foreground/40 sm:h-12 sm:w-12" />
            <p className="text-sm text-muted-foreground sm:text-base">
              No time slots yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={addSlot}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add your first slot
            </Button>
          </div>
        )}
      </div>

      {/* Generate button */}
      <Button
        className="w-full gap-2 text-sm sm:text-base"
        size="lg"
        onClick={handleSearch}
        disabled={!location || !date || slots.length === 0}
      >
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Generate Custom Plans</span>
        <span className="sm:hidden">Generate Plans</span>
      </Button>
    </div>
  );
}
