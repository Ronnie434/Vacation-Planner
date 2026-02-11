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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  GripVertical,
} from "lucide-react";
import type { PlanningResponse } from "@/types/api";

interface TimeSlot {
  category: string;
  startHour: number;
  endHour: number;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

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
    color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  Eatery: {
    icon: Utensils,
    label: "Eatery",
    description: "Restaurants, cafes, food spots",
    color: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
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
  const [loading, setLoading] = useState(false);

  const addSlot = () => {
    const last = slots[slots.length - 1];
    const start = last ? last.endHour : 10;
    const end = Math.min(start + 2, 23);
    if (start >= 23) {
      toast.error("Cannot add more time slots — day is full");
      return;
    }
    setSlots([...slots, { category: "Visit", startHour: start, endHour: end }]);
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
        admin_area_level_one:
          locationFields.length === 3 ? locationFields[1] : "",
        country: locationFields[locationFields.length - 1] || "",
      },
      slots: slots.map((s) => ({
        category: s.category.toLowerCase(),
        time_slot: {
          slot: { start: s.startHour, end: s.endHour },
        },
      })),
    };

    setLoading(true);
    try {
      const data = await customizePlan(requestData, dateStr, priceLevel, 5);
      setResults(data);
    } catch {
      toast.error("Failed to get plans");
    } finally {
      setLoading(false);
    }
  };

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";

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

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-black/20 sm:h-9 sm:w-9">
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

      {/* Search button */}
      <Button
        className="w-full gap-2 text-sm sm:text-base"
        size="lg"
        onClick={handleSearch}
        disabled={loading || !location || !date || slots.length === 0}
      >
        {loading ? (
          <>
            <Sparkles className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Generating Plans...</span>
            <span className="sm:hidden">Generating...</span>
          </>
        ) : (
          <>
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Generate Custom Plans</span>
            <span className="sm:hidden">Generate Plans</span>
          </>
        )}
      </Button>

      {/* Results */}
      {results && results.travel_plans && results.travel_plans.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">
              Plans for {results.travel_destination}
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {results.travel_plans.length} plans generated
            </p>
          </div>

          <Accordion
            type="multiple"
            className="space-y-2"
            defaultValue={[results.travel_plans[0]?.id]}
          >
            {results.travel_plans.map((plan, idx) => (
              <AccordionItem key={plan.id} value={plan.id}>
                <AccordionTrigger className="text-left">
                  <span>Plan {idx + 1}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Mobile: card layout */}
                    <div className="space-y-3 md:hidden">
                      {plan.places.map((place) => {
                        const cat =
                          place.place_icon_css_class === "eatery"
                            ? "Eatery"
                            : "Visit";
                        const cfg =
                          categoryConfig[
                            cat as keyof typeof categoryConfig
                          ];
                        return (
                          <div
                            key={place.id}
                            className="rounded-md border p-3 space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${cfg.badge}`}
                              >
                                {cfg.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatHour(place.start_time)} -{" "}
                                {formatHour(place.end_time)}
                              </span>
                            </div>
                            <p className="text-sm font-medium">
                              {place.url ? (
                                <a
                                  href={place.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {place.place_name}
                                </a>
                              ) : (
                                place.place_name
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {place.address}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop: table layout */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Place</TableHead>
                            <TableHead>Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.places.map((place) => {
                            const cat =
                              place.place_icon_css_class === "eatery"
                                ? "Eatery"
                                : "Visit";
                            const cfg =
                              categoryConfig[
                                cat as keyof typeof categoryConfig
                              ];
                            return (
                              <TableRow key={place.id}>
                                <TableCell className="whitespace-nowrap">
                                  {formatHour(place.start_time)} -{" "}
                                  {formatHour(place.end_time)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${cfg.badge}`}
                                  >
                                    {cfg.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {place.url ? (
                                    <a
                                      href={place.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {place.place_name}
                                    </a>
                                  ) : (
                                    place.place_name
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {place.address}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <Button size="sm" asChild>
                      <Link href={`/trip/${plan.id}?date=${dateStr}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
