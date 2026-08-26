import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface AnalyzeRequestBody {
  text?: string;
}

export async function POST(request: Request) {
  try {
    // ==========================================
    // 1. Validate Request Body
    // ==========================================
    let body: AnalyzeRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Notice text is required." },
        { status: 400 }
      );
    }

    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Notice text is required." },
        { status: 400 }
      );
    }

    // ==========================================
    // 2. Verify Server-Side API Key
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Server Error: GEMINI_API_KEY environment variable is not configured.");
      return NextResponse.json(
        { success: false, error: "Server configuration error. API key is missing." },
        { status: 500 }
      );
    }

    // ==========================================
    // 3. Initialize Google GenAI SDK
    // ==========================================
    const ai = new GoogleGenAI({ apiKey });

    // ==========================================
    // 4. Send Analysis Prompt to Gemini
    // ==========================================
    const prompt = `You are an assistant that simplifies confusing notices and documents for readers.
Analyze the following official notice text and provide a concise, clear plain-text explanation structured with these sections:
- What the notice is about
- Who it affects
- Important dates
- What the person needs to do
- Important warnings

Keep the output structured, scannable, factual, and concise. Do not invent missing facts.

Notice Text:
"""
${text.trim()}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const resultText = response.text;

    if (!resultText) {
      return NextResponse.json(
        { success: false, error: "Unable to analyze the notice." },
        { status: 500 }
      );
    }

    // ==========================================
    // 5. Return Successful Response
    // ==========================================
    return NextResponse.json({
      success: true,
      result: resultText,
    });
  } catch (error) {
    // Log internal error safely on the server side without leaking details to the client
    console.error("Notice analysis failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to analyze the notice.",
      },
      { status: 500 }
    );
  }
}