# Briefly
```markdown
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
```

A lightweight web application that generates a **personalized daily news brief** from multiple RSS feeds. Users select topics and receive a curated set of articles with summaries, optimized for quick reading.

Briefly aggregates content from trusted sources, applies relevance filtering, and presents a clean, fast interface for scanning the day’s most important stories.

---

## Features

- Topic-based news aggregation
- RSS feed ingestion from multiple sources
- Per-feed error isolation (failed feeds do not break the brief)
- Intelligent caching for improved performance
- Article summarization with optional AI support
- Loading states and responsive UI
- Server-side validation and typed API contracts

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- CSS

### Backend
- Next.js API routes
- Zod for request validation
- RSS parsing
- Optional OpenAI summarization

### Architecture
- In-memory caching layer
- Concurrent fetch handling
- Feed-level error isolation
- Typed data models

---

## Architecture Overview
```text
User selects topics
│
▼
POST /api/brief
│
▼
Select relevant RSS feeds
│
▼
Fetch feeds concurrently
│
▼
Cache RSS responses
│
▼
Aggregate + rank articles
│
▼
(Optional) AI summarization
│
▼
Return curated brief
```

Caching exists at two levels:

### RSS Cache
Prevents repeatedly fetching the same feed.

### Brief Cache
Prevents regenerating identical topic requests.

---

## Example API Response

```json
{
  "items": [
    {
      "title": "Tech Startup Raises $50M",
      "sourceName": "TechCrunch",
      "link": "https://example.com/article",
      "summary": "A startup raised significant funding as investor interest continues to grow."
    }
  ],
  "errors": [],
  "cache": "miss",
  "lastUpdated": "2026-03-03T18:15:00.000Z"
}
```

## Running Locally
Clone the repo:

```Bash
git clone https://github.com/amatranga/briefly.git
cd briefly
```

Install dependencies:
```Bash
npm install
```

Run the development server:
```Bash
npm run dev
```

Open in browser
```
http://localhost:3000
```

## Environment Variables
Optional AI summaries can be enabled with:
```
OPEN_AI_API_KEY=your_key_here
ENABLE_AI_SUMMARIES=true
```
If disabled, summaries are generated using the article description.

## Current Topics
- Business
- Tech
- Markets
- Sports
- Entertainment
Each topic maps to one or more RSS feeds.

## Future Enhancements
Planned improvements include:
- Dark mode toggle
- Shareable URLs for topic selection
- User preference persistence
- Regenerate button to bypass cache
- Improved article relevence scoring
- Additional RSS sources
- AI batch summarization

## Version
### v1.0
Initial release featuring topic selection, RSS aggregation, caching, and summarization

## Author
Alex Matranga

GitHub: [https://github.com/amatranga](https://github.com/amatranga)