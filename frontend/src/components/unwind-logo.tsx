"use client";

import { useId } from "react";

export function UnwindLogo({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId();
  const gold = `${id}-gold`;
  const teal1 = `${id}-teal1`;
  const teal2 = `${id}-teal2`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8C29D" />
          <stop offset="100%" stopColor="#C5A873" />
        </linearGradient>
        <linearGradient id={teal1} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2FA7A0" />
          <stop offset="100%" stopColor="#1F8F89" />
        </linearGradient>
        <linearGradient id={teal2} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#49C5BE" />
          <stop offset="100%" stopColor="#2FA7A0" />
        </linearGradient>
      </defs>
      <circle cx="250" cy="230" r="140" fill={`url(#${gold})`} />
      <path
        d="M80 240 C120 170, 200 170, 250 210 C310 260, 380 230, 420 260 C380 310, 300 300, 240 280 C180 260, 120 280, 80 240 Z"
        fill={`url(#${teal1})`}
        opacity="0.9"
      />
      <path
        d="M110 300 C160 270, 220 320, 280 310 C330 300, 380 330, 410 300 C360 360, 260 370, 190 350 C150 340, 120 330, 110 300 Z"
        fill={`url(#${teal2})`}
        opacity="0.85"
      />
      <path
        d="M220 380 C250 360, 300 360, 320 380 C300 400, 250 410, 220 380 Z"
        fill={`url(#${gold})`}
      />
    </svg>
  );
}
