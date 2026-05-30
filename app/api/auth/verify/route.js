import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=missing-token", request.url)
      );
    }

    await connectDB();

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=invalid-token", request.url)
      );
    }

    // ── Mark as verified ────────────────────────
    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;
    await user.save();

    // ── Redirect to login with success ──────────
    return NextResponse.redirect(
      new URL("/login?verified=true", request.url)
    );

  } catch (err) {
    console.error("[VERIFY ERROR]", err);
    return NextResponse.redirect(
      new URL("/login?error=server-error", request.url)
    );
  }
}