"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/plan/customize"
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(false)}
      >
        Customize Plan
      </Link>
      <Link
        href="/about"
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(false)}
      >
        About
      </Link>
    </>
  );

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + desktop nav links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold">
            Vacation Planner
          </Link>
          <div className="hidden items-center gap-6 md:flex">{navLinks}</div>
        </div>

        {/* Right: Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {user?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: Hamburger menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4">
                {navLinks}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/profile"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setOpen(false)}
                      >
                        Profile ({user?.username})
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="sm" className="w-fit" asChild>
                        <Link href="/login" onClick={() => setOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button size="sm" className="w-fit" asChild>
                        <Link href="/signup" onClick={() => setOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
