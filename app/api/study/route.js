import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import History from "@/models/History";
import { getSessionUser } from "@/lib/auth";
import { buildPrompt, SYSTEM_PROMPTS } from "@/lib/promptEngine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // ── 1. Auth check (Unified naming convention) ──────────────────────────
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let output;
    let historyInput;

    // ── 2. Call Gemini Wrapper with Quota Exception Catching ──────────
    try {
      
      // ── MODE A: PDF Upload Material Processing ──────────────────
      if (contentType.includes("multipart/form-data")) {
        const formData       = await request.formData();
        const pdfFile        = formData.get("pdf");
        const topic          = formData.get("topic") || "";
        const context        = formData.get("context") || "";

        if (!pdfFile) {
          return NextResponse.json(
            { error: "Please upload a PDF file." },
            { status: 400 }
          );
        }

        // Convert PDF to base64 buffer stream
        const pdfBuffer = await pdfFile.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

        // Build tailored instructions payload
        const userMessage = `
Please create a comprehensive study guide from this document.
${topic ? `Focus specifically on: ${topic}` : "Cover the main topics in the document."}
${context ? `Additional context: ${context}` : ""}
        `.trim();

        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          systemInstruction: SYSTEM_PROMPTS.study,
        });

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "application/pdf",
              data:     pdfBase64,
            },
          },
          userMessage,
        ]);

        output       = result.response.text();
        historyInput = `PDF Upload${topic ? ` — ${topic}` : ""}`;

      // ── MODE B: Text Generation Processing ──────────────────
      } else {
        const { subject, topic, context } = await request.json();

        if (!subject || !topic) {
          return NextResponse.json(
            { error: "Please provide both subject and topic." },
            { status: 400 }
          );
        }

        const { systemPrompt, userMessage } = buildPrompt(
          "study",
          context || "",
          { subject, topic }
        );

        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userMessage);
        output       = result.response.text();
        historyInput = `${subject} — ${topic}`;
      }

    } catch (geminiErr) {
      // Catch Google API 429 Quota Exceeded constraints uniformly for both branches
      if (geminiErr.status === 429 || geminiErr.message?.includes("429")) {
        return NextResponse.json(
          { error: "Gemini Free-Tier quota exceeded. Please wait 60 seconds before generating more materials!" },
          { status: 429 }
        );
      }
      throw geminiErr; // Drop alternative errors down to global stack trace
    }

    // ── 3. Save Analytical Trace Record to History Database ─────────────────────
    await connectDB();
    await History.create({
      userId: user.id,
      type:   "study",
      input:  historyInput,
      output,
    });

    return NextResponse.json({ success: true, output }, { status: 200 });

  } catch (err) {
    console.error("[STUDY ERROR]", err);
    return NextResponse.json(
      { error: "Failed to compile your custom study resource template profile." },
      { status: 500 }
    );
  }
}