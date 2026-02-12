import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">About Unwind</h1>
      <Card>
        <CardHeader>
          <CardTitle>What is Unwind?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Unwind is an intelligent travel planning tool that helps
            you discover and organize the perfect day-trip itinerary for any
            destination.
          </p>
          <p>
            Powered by Google Maps data and smart algorithms, it generates
            optimized travel plans based on your preferences including
            destination, date, price level, and more.
          </p>
          <h3 className="text-lg font-semibold text-foreground">Features</h3>
          <ul className="list-inside list-disc space-y-1">
            <li>AI-powered itinerary generation</li>
            <li>Support for nearby cities exploration</li>
            <li>Save and manage your favorite plans</li>
            <li>Custom plan builder with time slots</li>
            <li>Google Maps integration for trip visualization</li>
            <li>AI-generated plan summaries</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
