"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plane, MapPin, Calendar, Compass, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await signup(username, email, password);
      setSuccess(data.message || "Account created! Check your email to verify.");
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen -m-4 sm:-m-6">
      {/* Left branded panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-10 text-primary-foreground">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Plane className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">Vacation Planner</span>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              Start planning
              <br />
              your next adventure
            </h1>
            <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
              Create an account and get personalized travel itineraries powered by AI.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Smart Destinations</p>
                <p className="text-sm text-primary-foreground/70">AI-powered place recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Day-by-Day Plans</p>
                <p className="text-sm text-primary-foreground/70">Optimized daily itineraries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Explore Nearby</p>
                <p className="text-sm text-primary-foreground/70">Discover surrounding cities & attractions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Save & Customize</p>
                <p className="text-sm text-primary-foreground/70">Tailor plans to your preferences</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/50">
          &copy; {new Date().getFullYear()} Vacation Planner
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 lg:w-[45%] bg-background">
        {/* Mobile brand header */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <Plane className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Vacation Planner</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Join thousands of travelers planning smarter trips
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="traveler123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
