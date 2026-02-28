import OpenAI from "openai";

const cleanHtml = (html: string): string | null => (
  html.replace(/<[^>]+>/g, "").trim()
)

const summarizeFromDescription = (description?: string): string => {
  if (!description) return "No summary available.";

  // light cleanup: strip HTML tags and add optional elipsis
  const text = cleanHtml(description)
  return text.length > 240 ? text.slice(0, 237) + "..." : text;
}

const getClient = () : OpenAI | null => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
};

const summarizeWithAi = async (input: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;

  const cleaned = cleanHtml(input);
  if (!cleaned) return null;

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: 
          "You summarize news items into 1 - 2 concise sentences. No hype, no emojis, preserve factual tone.",
      },
      { role: "user", content: cleaned },
    ],
    temperature: 0.2,
  });

  const text = resp.choices[0]?.message?.content?.trim();
  return text || null;
}

export { summarizeFromDescription, summarizeWithAi };
