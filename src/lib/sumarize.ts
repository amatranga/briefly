const summarizeFromDescription = (description?: string): string => {
  if (!description) return "No summary available.";

  // light cleanup: strip HTML tags and add optional elipsis
  const text = description.replace(/<[^>]+>/g, "").trim();
  return text.length > 240 ? text.slice(0, 237) + "..." : text;
}

export { summarizeFromDescription };
