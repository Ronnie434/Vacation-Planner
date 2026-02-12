"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { getPlanDetails, savePlan } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { GoogleMapView } from "@/components/google-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function TripContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;
  const date = searchParams.get("date") || undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["trip", id, date],
    queryFn: () => getPlanDetails(id, date),
    enabled: !!id,
  });

  const handleSave = async () => {
    if (!isAuthenticated || !user || !data) {
      toast.error("Please login to save plans");
      return;
    }
    try {
      await savePlan(user.username, {
        id: data.original_plan_id,
        original_plan_id: data.original_plan_id,
        destination: data.travel_destination,
        travel_date: data.travel_date,
        places: data.place_details.map((p) => ({
          id: p.id,
          place_name: p.name,
          address: p.formatted_address,
          url: p.url,
        })),
      });
      toast.success("Plan saved!");
    } catch {
      toast.error("Failed to save plan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading trip details...</p>
      </div>
    );
  }

  if (error || !data || !data.lat_longs || !data.place_details) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-destructive">Failed to load trip details.</p>
      </div>
    );
  }

  const mapLocations = data.lat_longs.map((ll, idx) => ({
    lat: ll[0],
    lng: ll[1],
    label: data.place_details[idx]?.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{data.travel_destination}</h1>
          <p className="text-sm text-muted-foreground">{data.travel_date}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleSave}>Save Plan</Button>
      </div>

      <GoogleMapView
        locations={mapLocations}
        className="h-[250px] w-full rounded-md sm:h-[350px] md:h-[400px]"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.place_details.map((place, idx) => (
          <Card key={place.id}>
            {place.photo_url && (
              <div className="overflow-hidden rounded-t-md">
                <img
                  src={
                    place.photo_url.startsWith("http")
                      ? place.photo_url
                      : `data:image/jpeg;base64,${place.photo_url}`
                  }
                  alt={place.name}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm sm:text-base">{place.name}</CardTitle>
                {data.place_categories[idx] && (
                  <Badge variant="outline">
                    {data.place_categories[idx]}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {place.summary && (
                <p className="text-muted-foreground">{place.summary}</p>
              )}
              <p className="text-muted-foreground">
                {place.formatted_address}
              </p>
              {place.url && (
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View on Google Maps
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <TripContent />
    </Suspense>
  );
}
