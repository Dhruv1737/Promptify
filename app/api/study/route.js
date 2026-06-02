import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import History from "@/models/History";
import { getSessionUser } from "@/lib/auth";
import { buildPrompt, SYSTEM_PROMPTS } from "@/lib/promptEngine";
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
    const limit = await rateLimit(session.id, "study");
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

    const contentType = request.headers.get("content-type") || "";
    let output;
    let historyInput;

    // ── PDF mode ────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const pdfFile  = formData.get("pdf");
      const topic    = formData.get("topic")   || "";
      const context  = formData.get("context") || "";

      if (!pdfFile) {
        return NextResponse.json(
          { error: "Please upload a PDF file." },
          { status: 400 }
        );
      }

      const pdfBase64 = Buffer.from(
        await pdfFile.arrayBuffer()
      ).toString("base64");

      const userMessage = `
Please create a comprehensive study guide from this document.
${topic   ? `Focus specifically on: ${topic}` : "Cover the main topics."}
${context ? `Additional context: ${context}`  : ""}
      `.trim();

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPTS.study,
      });

      const result = await model.generateContent([
        { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
        userMessage,
      ]);

      output       = result.response.text();
      historyInput = `PDF Upload${topic ? ` — ${topic}` : ""}`;

    // ── Text mode ───────────────────────────
    } else {
      const { subject, topic, context } = await request.json();
      if (!subject || !topic) {
        return NextResponse.json(
          { error: "Please provide both subject and topic." },
          { status: 400 }
        );
      }

      const { systemPrompt, userMessage } = buildPrompt(
        "study", context || "", { subject, topic }
      );

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userMessage);
      output       = result.response.text();
      historyInput = `${subject} — ${topic}`;
    }

    // ── History ─────────────────────────────
    await connectDB();
    await History.create({
      userId: session.id,
      type:   "study",
      input:  historyInput,
      output,
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
    console.error("[STUDY ERROR]", err);
    return NextResponse.json(
      { error: "Failed to generate study guide. Please try again." },
      { status: 500 }
    );
  }
}