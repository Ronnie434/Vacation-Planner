"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { UnwindLogo } from "@/components/unwind-logo";
import { MapPin, Calendar, Compass, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginGoogle } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-4 -mb-4 sm:-mt-6 sm:-mb-6 flex min-h-screen w-screen bg-background">
      {/* Left branded panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="ml-auto flex w-full max-w-lg flex-col justify-between p-10">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <UnwindLogo size={40} />
              <span className="text-2xl font-bold tracking-tight">Unwind</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Plan your dream
                <br />
                vacation with AI
              </h1>
              <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
                Discover personalized travel itineraries, explore hidden gems, and make every trip unforgettable.
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
            &copy; {new Date().getFullYear()} Unwind
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full min-h-screen flex-col justify-center px-6 py-8 md:min-h-0 md:w-1/2 md:py-12 lg:w-[45%] bg-background">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand header */}
          <Link href="/" className="mb-10 flex items-center gap-3.5 md:hidden">
            <UnwindLogo size={56} />
            <span className="text-3xl font-bold tracking-tight text-primary">Unwind</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account to continue planning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={loginGoogle}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
