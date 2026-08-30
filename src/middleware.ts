// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Middleware (rate limiting)
// Protects AI routes from abuse. Returns 429 with graceful message.
// Non-AI routes pass through without rate limiting.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import {
  getRateLimitRule,
  checkRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

export const config = {
  // Run middleware on all API routes
  matcher: ["/api/:path*"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = getRateLimitRule(pathname);

  // No rule = no rate limiting
  if (!rule) return NextResponse.next();

  const ip = getClientIp(request);
  const key = `${ip}:${pathname}`;

  const result = checkRateLimit(key, rule);

  if (result.limited) {
    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
    return NextResponse.json(
      {
        error: "Trop de requêtes.",
        message: `Limite atteinte. Réessayez dans ${retryAfterSeconds}s.`,
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "Content-Type": "application/json",
        },
      }
    );
  }

  return NextResponse.next();
}