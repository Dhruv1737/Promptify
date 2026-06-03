import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import History from "@/models/History";
import { getSessionUser } from "@/lib/auth";
import { SYSTEM_PROMPTS } from "@/lib/promptEngine";
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
    const limit = await rateLimit(session.id, "resume");
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
    const formData       = await request.formData();
    const pdfFile        = formData.get("resume");
    const jobDescription = formData.get("jobDescription") || "";

    if (!pdfFile) {
      return NextResponse.json(
        { error: "Please upload your resume PDF." },
        { status: 400 }
      );
    }

    // ── Convert PDF ─────────────────────────
    const pdfBase64 = Buffer.from(
      await pdfFile.arrayBuffer()
    ).toString("base64");

    const userMessage = jobDescription
      ? `Analyze this resume against this job description:\n\n${jobDescription}`
      : `Analyze this resume. No job description — do general ATS analysis.`;

    // ── Gemini ──────────────────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPTS.ats,
    });

    const result = await model.generateContent([
      { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
      userMessage,
    ]);

    const output     = result.response.text();
    const scoreMatch = output.match(/(\d+)\s*\/\s*100/);
    const score      = scoreMatch ? parseInt(scoreMatch[1]) : null;

    // ── History ─────────────────────────────
    await connectDB();
    await History.create({
      userId: session.id,
      type:   "recommend",
      input:  `Resume PDF${jobDescription ? " with JD" : ""}`,
      output,
    });

    return NextResponse.json(
      {
        success:   true,
        output,
        score,
        remaining: limit.remaining,
        limit:     limit.limit,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("[ATS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}