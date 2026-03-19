# Briefly

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)


Briefly is a lightweight news brief generator that aggregates articles from multiple RSS feeds, ranks them by relevance, and delivers a quick, curated briefing based on user-selected topics.

The project focuses on performance, caching strategies, and simple NLP techniques to provide fast, personalized news summaries.


## Features

### Core
- Topic-based RSS aggregation
- Concurrent feed fetching
- Intelligent article ranking
- Optional AI summaries
- API caching for RSS and briefs

### v1.1
- Shareable URLs
- LocalStorage preferences
- Dark mode
- Regenerate briefs
- Keyword-based relevance scoring

### v1.2
- Bookmarks / Read Later
- Persistent reading history
- Historical brief log
- Reusable SearchInput component
- Extracted BriefView architecture

### v1.3
- Smart article ranking using a TF-IDF inspired scoring system
- Improved ranking controls
- Article deduplication
- Feed health monitoring

### v1.4
- Enhanced personalization and feedback
- Settings and ranking controls
- Comprehensive test coverage

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
Feed health monitoring
│
▼
Deduplicate articles
│
▼
TF-IDF ranking + topic weighting
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
- Additional RSS sources


## Version

**v1.2**
- Bookmarks
  - Users can save articles to a persistent reading list stored in localStorage. Bookmarks can be searched and removed.
- Reading History
  - Articles are automatically marked as read when opened and tracked across sessions.
- Historical Brief Log
  - Generated briefs are stored locally so users can revisit previous summaries and reload them into the main view
- UI Improvements
  - Extracted `BriefView` component from page layout
  - Reusable `SearchInput` component
  - Improved article metadata display
  - Better layout separation between views
- Architecture Improvements
  - Modular view components
  - Cleaner page orchestration logic
  - Reduced UI duplication
 
**v1.3**

v1.3 introduces smarter article ranking and improved reliability monitoring.

- Smart Article Ranking
  - Briefly now uses a TF-IDF-inspired scoring system to prioritize the most relevant stories.

  - Ranking considers:
    - Topic keyword matches
    - Title vs description weighting
    - User-defined topic priority
    - Keyword rarity within the article set

  - This produces a much more relevant daily brief.

- Article Deduplication
  - Duplicate stories appearing across multiple RSS feeds are automatically detected and removed using normalized title fingerprints.
    This ensures users see unique stories instead of repeated headlines.

- Feed Health Monitoring
  - Briefly now tracks the health of RSS feeds.

  - For each source the system records:
    - Last successful fetch
    - Last failure
    - Last error message
    - Article count
    - Last checked timestamp

  - Feed health is exposed through the `/api/health` endpoint.

- Improved Ranking Controls
  - Users can now adjust **Topic Priority** to influence how strongly articles from selected topics are ranked.

**v1.4**

v1.4 introduces enhanced personalization and comprehensive test coverage

- Enhanced Personalization
  - Learned Topic Affinities
    - Tracks user preferences over time
    - Driven by clicks, bookmarks, explicit article feedback

- Comprehensive Test Coverage
  - Tests implemented for all components, views, and page orchestration
  - Coverage includes rendering, user interaction, state updates, side effects, async flows
  


## Author
Alex Matranga

GitHub: [https://github.com/amatranga](https://github.com/amatranga)


## License

MIT
