"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { UnwindLogo } from "@/components/unwind-logo";
import {
  useColorTheme,
  COLOR_THEMES,
} from "@/contexts/color-theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Map,
  Heart,
  DollarSign,
  MapPin,
  FileText,
  Search,
  Clock,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Check,
} from "lucide-react";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-4 w-screen sm:-mt-6">
      {/* ── Landing Nav ─────────────────────────────────── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border/50 bg-background/90 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <UnwindLogo size={36} />
            <span className="text-lg font-bold tracking-tight text-primary">
              Unwind
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Color theme picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <Palette className="h-[1.15rem] w-[1.15rem]" />
                  <span className="sr-only">Change color theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {COLOR_THEMES.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    className="cursor-pointer gap-3"
                  >
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded-full border border-border/50"
                      style={{ background: t.color }}
                    />
                    <span className="flex-1">{t.label}</span>
                    {colorTheme === t.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark / Light toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="mx-1 hidden h-5 w-px bg-border/50 sm:block" />

            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:pb-32 sm:pt-40">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent" />

        {/* Floating blobs */}
        <div className="animate-float pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-primary/6 blur-3xl" />
        <div className="animate-float-slow pointer-events-none absolute -left-20 bottom-20 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="animate-float pointer-events-none absolute left-1/3 top-40 h-48 w-48 rounded-full bg-accent/10 blur-3xl delay-1000" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="animate-fade-down mb-8 flex justify-center">
            <UnwindLogo size={100} className="drop-shadow-lg" />
          </div>

          {/* Badge */}
          <div className="animate-fade-down delay-100 mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Travel Planning
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-200 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            Your next adventure,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              planned by AI
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up delay-300 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Discover personalized travel itineraries for any destination. Just
            pick a city, set your budget, and let Unwind craft the perfect day.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-400 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/signup">
                Start Planning — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-base" asChild>
              <a href="#how-it-works">
                See How It Works
                <ChevronDown className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to plan the perfect trip
            </h2>
            <p className="animate-fade-up delay-100 mt-4 text-lg text-muted-foreground">
              Powered by Google Maps data and smart algorithms
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Plans",
                desc: "Get optimized day-trip itineraries generated by AI based on real Google Maps data.",
              },
              {
                icon: Map,
                title: "Nearby Discovery",
                desc: "Expand your horizons — include surrounding cities for even more options.",
              },
              {
                icon: Heart,
                title: "Save & Customize",
                desc: "Save your favorite plans, tweak time slots, and build your perfect day.",
              },
              {
                icon: DollarSign,
                title: "Smart Budgeting",
                desc: "Filter by price level — from free activities to luxury experiences.",
              },
              {
                icon: MapPin,
                title: "Interactive Maps",
                desc: "Visualize your itinerary on Google Maps with all stops plotted.",
              },
              {
                icon: FileText,
                title: "Plan Summaries",
                desc: "Get AI-generated summaries of each plan at a glance.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="animate-fade-up group rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section
        id="how-it-works"
        className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background px-4 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to your perfect day
            </h2>
            <p className="animate-fade-up delay-100 mt-4 text-lg text-muted-foreground">
              From search to itinerary in seconds
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Search,
                step: "01",
                title: "Pick Your Destination",
                desc: "Search any city worldwide or use your current location to discover places nearby.",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "Get AI Plans",
                desc: "Our AI generates multiple itinerary options tailored to your preferences and budget.",
              },
              {
                icon: Clock,
                step: "03",
                title: "Save & Go",
                desc: "Save your favorites, customize the details, and hit the road.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="animate-fade-up group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${200 + i * 150}ms` }}
              >
                <span className="absolute right-4 top-4 text-5xl font-black text-primary/8 transition-colors group-hover:text-primary/15">
                  {item.step}
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ──────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/8 via-primary/4 to-transparent" />
        <div className="animate-float-slow pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-primary/6 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Unwind?
          </h2>
          <p className="animate-fade-up delay-100 mt-4 text-lg text-muted-foreground">
            Join travelers who plan smarter trips with AI-powered itineraries.
          </p>
          <div className="animate-fade-up delay-200 mt-8">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/signup">
                Start Planning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mx-auto mt-20 max-w-7xl border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <UnwindLogo size={24} />
              <span className="text-sm font-medium text-muted-foreground">
                &copy; {new Date().getFullYear()} Unwind
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
