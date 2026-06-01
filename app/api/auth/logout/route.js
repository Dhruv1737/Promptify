import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out." },
    { status: 200 }
  );

  // ── Properly clear the cookie ──────────────
  response.cookies.set("ai_hub_token", "", {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "lax",
    path:      "/",           // ← must match original path
    maxAge:    0,             // ← expire immediately
    expires:   new Date(0),   // ← set to past date (belt + suspenders)
  });

  return response;
}