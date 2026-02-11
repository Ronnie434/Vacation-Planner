"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import Link from "next/link";
import { getPlans, savePlan, submitFeedback, getPlanSummary } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { TravelPlan } from "@/types/api";

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = (hour - h) * 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function PlanSummaryDialog({ planId }: { planId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (summary) return;
    setLoading(true);
    try {
      const data = await getPlanSummary(planId);
      setSummary(data.message);
    } catch {
      setSummary("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={fetchSummary}>
          Summary
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan Summary</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {loading ? "Generating summary..." : summary}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const location = searchParams.get("location") || "";
  const date = searchParams.get("date") || "";
  const price = searchParams.get("price") || "2";
  const nearby = searchParams.get("nearby") || "false";
  const precise = searchParams.get("precise") || "false";

  const { data, isLoading, error } = useQuery({
    queryKey: ["plans", location, date, price, nearby, precise],
    queryFn: () =>
      getPlans({
        location,
        date,
        price,
        nearby: nearby === "true",
        precise: precise === "true",
      }),
    enabled: !!location && !!date,
  });

  const handleSave = async (plan: TravelPlan) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to save plans");
      return;
    }
    try {
      await savePlan(user.username, {
        id: plan.id,
        original_plan_id: plan.id,
        destination: data?.travel_destination,
        travel_date: date,
        places: plan.places.map((p) => ({
          id: p.id,
          place_name: p.place_name,
          address: p.address,
          url: p.url,
          time_period: `${formatHour(p.start_time)} - ${formatHour(p.end_time)}`,
        })),
      });
      toast.success("Plan saved!");
    } catch {
      toast.error("Failed to save plan");
    }
  };

  const handleFeedback = async (planId: string, rating: string) => {
    if (!isAuthenticated || !user) return;
    try {
      await submitFeedback(user.username, { plan_id: planId, rating });
      toast.success("Feedback submitted");
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Searching for travel plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-destructive">
          Failed to load plans. Please try again.
        </p>
      </div>
    );
  }

  if (!data || !data.travel_plans || data.travel_plans.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          No travel plans found for this destination.
        </p>
        <Button asChild>
          <Link href="/">Try another search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">
          Vacation Plans for {data.travel_destination}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.travel_plans.length} plans found for {date}
        </p>
      </div>

      <Accordion type="multiple" className="space-y-2" defaultValue={[data.travel_plans[0]?.id]}>
        {data.travel_plans.map((plan, idx) => (
          <AccordionItem key={plan.id} value={plan.id}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <span>Plan {idx + 1}</span>
                {plan.saved && <Badge variant="secondary">Saved</Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Mobile: card layout */}
                <div className="space-y-3 md:hidden">
                  {plan.places.map((place) => (
                    <div
                      key={place.id}
                      className="rounded-md border p-3 space-y-1"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatHour(place.start_time)} -{" "}
                        {formatHour(place.end_time)}
                      </p>
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
                  ))}
                </div>

                {/* Desktop: table layout */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.places.map((place) => (
                        <TableRow key={place.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatHour(place.start_time)} -{" "}
                            {formatHour(place.end_time)}
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
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/trip/${plan.id}?date=${date}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(plan)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(plan.id, "like")}
                  >
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(plan.id, "dislike")}
                  >
                    Dislike
                  </Button>
                  <PlanSummaryDialog planId={plan.id} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
