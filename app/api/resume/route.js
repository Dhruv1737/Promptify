import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import History from "@/models/History";
import { getSessionUser } from "@/lib/auth";
import { SYSTEM_PROMPTS } from "@/lib/promptEngine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // ── 1. Auth check (Fixed variable names) ──────────────────────────
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // ── 2. Parse form data (PDF + text) ────────
    const formData       = await request.formData();
    const pdfFile        = formData.get("resume");
    const jobDescription = formData.get("jobDescription") || "";

    if (!pdfFile) {
      return NextResponse.json(
        { error: "Please upload your resume PDF." },
        { status: 400 }
      );
    }

    // ── 3. Convert PDF to base64 ───────────────
    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // ── 4. Build message for Gemini ────────────
    const userMessage = jobDescription
      ? `Please analyze this resume. Here is the job description to tailor the analysis against:\n\n${jobDescription}`
      : `Please analyze this resume. No job description provided — do a general ATS analysis.`;

    // ── 5. Call Gemini with Free-Tier Guardrails ────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPTS.ats,
    });

    let output;
    try {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data:     pdfBase64,
          },
        },
        { text: userMessage },
      ]);
      output = result.response.text();
    } catch (geminiErr) {
      // Catch Google API 429 Quota Exceeded exceptions seamlessly
      if (geminiErr.status === 429 || geminiErr.message?.includes("429")) {
        return NextResponse.json(
          { error: "Gemini Free-Tier quota exceeded. Please wait 60 seconds before trying again!" },
          { status: 429 }
        );
      }
      throw geminiErr; // Pass structural or internal exceptions to outer catch block
    }

    // ── 6. Extract score ───────────────────────
    const scoreMatch = output.match(/(\d+)\s*\/\s*100/);
    const score      = scoreMatch ? parseInt(scoreMatch[1]) : null;

    // ── 7. Save to history database ─────────────────────
    await connectDB();
    await History.create({
      userId: user.id,
      type:   "debugger", // 💡 Note: Your nav states this route is 'debugger', updated here to match your analytics schema
      input:  `Resume PDF uploaded${jobDescription ? " with JD" : ""}`,
      output,
    });

    return NextResponse.json(
      { success: true, output, score },
      { status: 200 }
    );

  } catch (err) {
    console.error("[ATS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to analyze resume due to an internal processing error." },
      { status: 500 }
    );
  }
}