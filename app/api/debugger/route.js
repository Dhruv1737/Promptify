import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import History from "@/models/History";
import { getSessionUser } from "@/lib/auth";
import { buildPrompt } from "@/lib/promptEngine";
import { rateLimit } from "@/lib/rateLimit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // ── Auth ────────────────────────────────
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // ── Rate limit ──────────────────────────
    const limit = await rateLimit(session.id, "debugger");
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error:       limit.message,
          minutesLeft: limit.minutesLeft,
          resetAt:     limit.resetAt,
        },
        { status: 429 }
      );
    }

    // ── Input ───────────────────────────────
    const { code, language } = await request.json();
    if (!code?.trim()) {
      return NextResponse.json(
        { error: "Please provide some code to debug." },
        { status: 400 }
      );
    }

    // ── Prompt ──────────────────────────────
    const { systemPrompt, userMessage } = buildPrompt(
      "debugger", code, { language }
    );

    // ── Gemini ──────────────────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const output = result.response.text();

    // ── History ─────────────────────────────
    await connectDB();
    await History.create({
      userId:   session.id,
      type:     "debugger",
      input:    code,
      output,
      metadata: { language: language || "auto-detect" },
    });

    return NextResponse.json(
      {
        success:   true,
        output,
        remaining: limit.remaining,
        limit:     limit.limit,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("[DEBUGGER ERROR]", err);
    return NextResponse.json(
      { error: "Failed to process your code. Please try again." },
      { status: 500 }
    );
  }
}