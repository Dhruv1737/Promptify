import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import History from "@/models/History";
import { getSessionUser } from "@/lib/auth";
import { buildPrompt } from "@/lib/promptEngine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // ── 1. Auth check (Updated variable naming consistency) ──────────
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // ── 2. Payload Validation ────────
    const { code, language } = await request.json();
    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide some code to debug." },
        { status: 400 }
      );
    }

    // ── 3. Prompt Engineering Compilation ────────
    const { systemPrompt, userMessage } = buildPrompt(
      "debugger",
      code,
      { language }
    );

    // ── 4. Setup Gemini Operational Parameters ────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // ── 5. Call Gemini with Quota Defense Guardrails ────────
    let output;
    try {
      const result = await model.generateContent(userMessage);
      output = result.response.text();
    } catch (geminiErr) {
      // Intercept 429 Quota Exceeded blocks gracefully
      if (geminiErr.status === 429 || geminiErr.message?.includes("429")) {
        return NextResponse.json(
          { error: "Gemini Free-Tier quota exceeded. Please wait 60 seconds before trying again!" },
          { status: 429 }
        );
      }
      throw geminiErr; // Pass structural or genuine syntax errors up to outer catch block
    }

    // ── 6. Save Analytical Record to History DB ────────
    await connectDB();
    await History.create({
      userId:   user.id,
      type:     "debugger",
      input:    code,
      output,
      metadata: { language: language || "auto-detect" },
    });

    return NextResponse.json({ success: true, output }, { status: 200 });

  } catch (err) {
    console.error("[DEBUGGER ERROR]", err);
    return NextResponse.json(
      { error: "An error occurred while analyzing your code code block." },
      { status: 500 }
    );
  }
}