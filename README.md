# Briefly

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?style=flat-square)](https://jestjs.io)

Briefly is a personalized news briefing app built with Next.js and TypeScript. It aggregates articles from multiple RSS feeds, ranks them by topic relevance and user preference signals, and presents the results as either a concise brief or a paginated feed.

## v1.5 Highlights

- Dedicated feed view with incremental loading
- Manual topic weighting controls in Settings
- Learned topic and keyword affinities based on reading behavior
- Per-article feedback signals to tune personalization
- Request validation with Zod for brief and feed APIs
- Expanded feed health diagnostics through the health endpoint

## Features

### Brief generation
- Topic-based RSS aggregation across multiple sources
- Concurrent feed fetching with in-memory response caching
- Deduplication to remove repeated stories across feeds
- Relevance ranking using topic keywords, topic weights, and learned user preferences
- Optional AI summaries with a description-based fallback

### Reading experience
- Brief view for top ranked stories
- Feed view with pagination and infinite scroll
- Bookmarks / read later list stored locally
- Reading history stored across sessions
- Historical brief log for reloading previous runs
- Shareable URL state for selected topics and article limit

### Personalization
- Topic weight editor with a 1-5 scoring range per topic
- Learned topic affinities based on clicks, bookmarks, and explicit feedback
- Keyword affinity tracking to improve ranking over time
- Reset personalization action from Settings

### Reliability
- Feed health tracking for successful and failed fetches
- Input validation on API requests with Zod schemas
- Jest coverage across app routes, components, and library modules

## Tech Stack

### Frontend
- Next.js App Router
- React 19
- TypeScript
- CSS

### Backend
- Next.js route handlers
- RSS parsing with `fast-xml-parser`
- In-memory caching
- Optional OpenAI summarization
- Zod request validation

### Testing
- Jest
- Testing Library

## Architecture

```text
User selects topics, limit, and ranking settings
|
v
POST /api/brief or POST /api/feed
|
v
Validate request payload with Zod
|
v
Select matching RSS sources
|
v
Fetch feeds concurrently
|
v
Update feed health state
|
v
Deduplicate articles
|
v
Rank using keywords, topic weights, and learned affinities
|
v
Generate summaries (AI or description fallback)
|
v
Return brief or paginated feed response
```

## API Endpoints

### `POST /api/brief`
Generates a ranked briefing for the selected topics.

Request body:

```json
{
  "topics": ["tech", "business"],
  "limit": 5,
  "force": false,
  "topicWeights": {
    "business": 3,
    "tech": 5,
    "markets": 2,
    "sports": 1,
    "entertainment": 1
  },
  "userPreferences": {
    "topicAffinity": {
      "business": 0,
      "tech": 1.5,
      "markets": 0,
      "sports": 0,
      "entertainment": 0
    },
    "keywordAffinity": {
      "ai": 1.5
    },
    "articleFeedback": {
      "https://example.com/article": "up"
    }
  }
}
```

### `POST /api/feed`
Returns a paginated list of ranked articles for the selected topics.

Request body:

```json
{
  "topics": ["tech", "business"],
  "limit": 10,
  "offset": 0,
  "topicWeights": {
    "business": 3,
    "tech": 5,
    "markets": 2,
    "sports": 1,
    "entertainment": 1
  }
}
```

Example response:

```json
{
  "items": [],
  "errors": [],
  "hasMore": true,
  "nextOffset": 10,
  "cache": "miss",
  "lastUpdated": "2026-03-24T18:15:00.000Z"
}
```

### `GET /api/health`
Reports service status, feed health information, and AI configuration state.

Example response:

```json
{
  "status": "ok",
  "openaiConfigured": true,
  "openAiEnabled": "true",
  "checkedAt": "2026-03-24T18:15:00.000Z",
  "feeds": []
}
```

## Getting Started

### Prerequisites
- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Run tests

```bash
npm test
```

Generate a coverage report:

```bash
npm run test:coverage
```

## Environment Variables

AI summaries are optional. If AI is disabled, Briefly falls back to a summary generated from the article description.

```bash
OPENAI_API_KEY=your_key_here
ENABLE_AI_SUMMARIES=true
```

## Topics

Briefly currently supports:

- Business
- Tech
- Markets
- Sports
- Entertainment

Each topic maps to one or more RSS sources and contributes to article ranking through keywords, manual topic weights, and learned preference signals.

## Project Structure

```text
src/
  app/
    api/
  components/
  lib/
  test/
```

## License

ISC
