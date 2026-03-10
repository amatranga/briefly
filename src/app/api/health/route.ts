import { NextResponse } from "next/server";
import { getFeedHealth } from "@/lib/feedHealth";

const GET = async () => {
  return NextResponse.json({
    status: "ok",
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    openAiEnabled: process.env.ENABLE_AI_SUMMARIES,
    checkedAt: new Date().toISOString(),
    feeds: getFeedHealth(),
  });
}

export { GET };
