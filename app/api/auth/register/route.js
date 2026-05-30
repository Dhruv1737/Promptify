import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // ── Validation ─────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Check duplicate ─────────────────────────
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Hash password ───────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Generate verify token ───────────────────
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hrs

    // ── Create user ─────────────────────────────
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiry,
      isVerified: false,
    });

    // ── Send verification email ─────────────────
    await sendVerificationEmail(name, email, verifyToken);

    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please check your email to verify your account.",
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}