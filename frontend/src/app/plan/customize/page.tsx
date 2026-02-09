"use client";

import { useState } from "react";
import Link from "next/link";
import { customizePlan } from "@/lib/api";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { PlanningResponse } from "@/types/api";

interface TimeSlot {
  category: string;
  startHour: number;
  endHour: number;
}

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = (hour - h) * 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function CustomizePlanPage() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
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
    setSlots([
      ...slots,
      {
        category: "Visit",
        startHour: last ? last.endHour : 10,
        endHour: last ? last.endHour + 2 : 12,
      },
    ]);
  };

  const removeSlot = (idx: number) => {
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, field: keyof TimeSlot, value: string | number) => {
    const updated = [...slots];
    updated[idx] = { ...updated[idx], [field]: value };
    setSlots(updated);
  };

  const handleSearch = async () => {
    if (!location || !date || slots.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    const locationFields = location.split(", ");
    const requestData = {
      location: {
        city: locationFields[0] || "",
        admin_area_level_one: locationFields.length === 3 ? locationFields[1] : "",
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
      const data = await customizePlan(requestData, date, priceLevel, 5);
      setResults(data);
    } catch {
      toast.error("Failed to get plans");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customize Your Plan</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Destination</Label>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="e.g. Tokyo, Japan"
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
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
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Time Slots</Label>

        {/* Mobile: card-based slots */}
        <div className="space-y-3 md:hidden">
          {slots.map((slot, idx) => (
            <div key={idx} className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Slot {idx + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlot(idx)}
                >
                  Remove
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select
                  value={slot.category}
                  onValueChange={(v) => updateSlot(idx, "category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visit">Visit</SelectItem>
                    <SelectItem value="Eatery">Eatery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Hour</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={slot.startHour}
                    onChange={(e) =>
                      updateSlot(idx, "startHour", parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Hour</Label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={slot.endHour}
                    onChange={(e) =>
                      updateSlot(idx, "endHour", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table-based slots */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Start Hour</TableHead>
                <TableHead>End Hour</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select
                      value={slot.category}
                      onValueChange={(v) => updateSlot(idx, "category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visit">Visit</SelectItem>
                        <SelectItem value="Eatery">Eatery</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={slot.startHour}
                      onChange={(e) =>
                        updateSlot(idx, "startHour", parseInt(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={slot.endHour}
                      onChange={(e) =>
                        updateSlot(idx, "endHour", parseInt(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlot(idx)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button variant="outline" size="sm" onClick={addSlot}>
          Add Time Slot
        </Button>
      </div>

      <Button className="w-full sm:w-auto" onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>

      {results && results.travel_plans && results.travel_plans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Plans for {results.travel_destination}
          </h2>
          {results.travel_plans.map((plan, idx) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="text-base">Plan {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Mobile: stacked layout */}
                <div className="space-y-2 md:hidden">
                  {plan.places.map((place) => (
                    <div key={place.id} className="rounded-md border p-2 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatHour(place.start_time)} -{" "}
                        {formatHour(place.end_time)}
                      </p>
                      <p className="text-sm font-medium">{place.place_name}</p>
                      <p className="text-xs text-muted-foreground">{place.address}</p>
                    </div>
                  ))}
                </div>
                {/* Desktop: table layout */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableBody>
                      {plan.places.map((place) => (
                        <TableRow key={place.id}>
                          <TableCell>
                            {formatHour(place.start_time)} -{" "}
                            {formatHour(place.end_time)}
                          </TableCell>
                          <TableCell>{place.place_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {place.address}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/trip/${plan.id}?date=${date}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
