"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getUserPlans, getUserFavorites, deletePlan } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { TravelPlanView } from "@/types/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["userPlans", user?.username],
    queryFn: () => getUserPlans(user!.username),
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ["userFavorites", user?.username],
    queryFn: () => getUserFavorites(user!.username),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: string) => deletePlan(user!.username, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlans"] });
      toast.success("Plan deleted");
    },
    onError: () => {
      toast.error("Failed to delete plan");
    },
  });

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        {favorites && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.most_frequent_search ? (
                <p className="text-sm text-muted-foreground">
                  Most searched: {favorites.most_frequent_search}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No search history yet. Start exploring!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-4 text-xl font-semibold">Saved Plans</h2>
          {plansLoading ? (
            <p className="text-muted-foreground">Loading plans...</p>
          ) : !plans || plans.length === 0 ? (
            <p className="text-muted-foreground">
              No saved plans yet.{" "}
              <Link href="/" className="text-primary hover:underline">
                Search for plans
              </Link>
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan: TravelPlanView) => (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {plan.destination}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {plan.travel_date} | Saved {plan.created_at}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {plan.places?.slice(0, 3).map((place) => (
                        <li key={place.id}>
                          {place.time_period} - {place.place_name}
                        </li>
                      ))}
                      {plan.places && plan.places.length > 3 && (
                        <li>...and {plan.places.length - 3} more</li>
                      )}
                    </ul>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/trip/${plan.original_plan_id}?date=${plan.travel_date}`}>
                          Details
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(plan.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
