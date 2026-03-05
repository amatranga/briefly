# Briefly

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)


Briefly is a lightweight news brief generator that aggregates articles from multiple RSS feeds, ranks them by relevance, and delivers a quick, curated briefing based on user-selected topics.

The project focuses on performance, caching strategies, and simple NLP techniques to provide fast, personalized news summaries.


## Features

### Topic-Based News Briefs
Users can select topics (Business, Tech, Markets, Sports, Entertainment) and generate a curated list of relevant articles from multiple RSS sources.

---

### Shareable URLs
Selected topics and article limits are encoded in the URL query string, allowing briefs to be easily shared or bookmarked.

Example:
```
/?topics=tech,business&limit=5
```

Opening the link restores the same configuration.

---

### Local Preference Persistence
User preferences are automatically saved in **localStorage**, including:

- Selected topics
- Article limit
- UI theme

Preferences are restored automatically when the user revisits the app.

---

### Light / Dark Mode
The UI supports both light and dark themes with a toggle in the header.

Theme preference is stored locally and restored on reload.

---

### Intelligent Caching
Briefly uses two layers of caching for performance:

**RSS Feed Cache**
- Prevents repeatedly fetching the same feeds
- Default TTL: 10 minutes

**Brief Response Cache**
- Prevents recomputing identical briefs
- Cache key includes topics, limit, and AI settings

This dramatically reduces response times for repeated requests.

---

### Per-Feed Error Isolation
If one RSS feed fails, other feeds still return results.

Failures are tracked and returned in the API response without breaking the entire brief.

---

### Relevance Scoring (Basic NLP)
Articles are ranked using lightweight keyword-based NLP scoring.

Each topic has a set of weighted keywords used to score article titles and descriptions.

This allows Briefly to prioritize the most relevant articles across multiple sources.

---

### Optional AI Summaries
AI-generated summaries can be enabled via environment variable:
```
ENABLE_AI_SUMMARIES=true
```
If disabled, summaries are generated from article descriptions for faster responses.

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- CSS

### Backend
- Next.js API Routes
- RSS parsing
- In-memory caching layer
- Optional OpenAI integration


## Architecture
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
- Improved NLP relevance scoring
- Additional RSS sources
- Article deduplication
- Deployment with persistent caching


## Version

**v1.1**

Major Additions: 
- Shareable URLs
- Persist preferences (LocalStorage)
- Dark mode toggle
- Regenerate button
- Relevance scoring


## Author
Alex Matranga

GitHub: [https://github.com/amatranga](https://github.com/amatranga)


## License

MIT