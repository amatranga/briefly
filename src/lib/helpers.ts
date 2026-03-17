import he from 'he';

/**
 * Collapses consecutive whitespace into a single space and trims leading/trailing whitespace.
 *
 * Useful for cleaning text that may contain inconsistent spacing, line breaks,
 * or multiple spaces after removing punctuation or HTML tags.
 *
 * Example:
 *   "Hello     world \n\n today" → "Hello world today"
 */
const normalizeWhitespace = (text: string): string => (
  text.replace(/\s+/g, " ").trim()
);

/**
 * Normalizes text for keyword matching and ranking.
 *
 * This function prepares text for search/scoring operations by:
 *  - converting text to lowercase
 *  - removing punctuation and special characters
 *  - normalizing whitespace
 *
 * This ensures consistent matching when performing operations like
 * keyword detection, TF-IDF scoring, or duplicate detection.
 *
 * Example:
 *   "AI-powered Startup!" → "ai powered startup"
 */
const normalizeText = (text: string): string => (
  normalizeWhitespace(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
  )
);

/**
 * Cleans raw HTML/RSS text for display.
 *
 * This function prepares feed content for UI rendering by:
 *  - decoding HTML entities (e.g. &#8216;, &amp;)
 *  - removing HTML tags
 *  - normalizing whitespace
 *
 * It is primarily used when parsing RSS feeds to ensure titles
 * and descriptions are readable and free of markup artifacts.
 *
 * Example:
 *   "Google &ldquo;AI tools&rdquo; <p>launch</p>"
 *     → "Google “AI tools” launch"
 */
const cleanText = (text: string) => (
  normalizeWhitespace(
    he.decode(text).replace(/<[^>]+>/g, "")
  )
);

export { normalizeText, cleanText, normalizeWhitespace };
