import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    openAiEnabled: process.env.ENABLE_AI_SUMMARIES,
    timestamp: new Date().toISOString(),
  });
}
