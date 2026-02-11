"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      const isSecure = window.location.protocol === "https:";
      Cookies.set("JWT", token, { path: "/", secure: isSecure, sameSite: "lax" });
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
