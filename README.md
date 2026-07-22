# Sicko's Draft Hub

An open-source, free, local-first **NFL Draft scouting workbench** — the tool draft sickos have always wanted, in one place, with no paywall.

Most tools like this are scattered across the internet, half-finished, and locked behind subscriptions. Sicko's Draft Hub pulls the good parts into one central hub, gives it away, and runs locally so **your evaluations stay yours**.

It's built to be a *learning instrument*: a way to form and defend real opinions on prospects, understand your own scouting tendencies and blind spots, and absorb the nuance of schemes, organizational philosophy, and positional value.

> **Vision & roadmap:** see [`docs/VISION.md`](docs/VISION.md) — the single source of truth for what this is, who it's for, and the order we build it in.

## Features

- **Prospect Boards** — league, per-team, per-position, and per-scheme boards; drag-to-rank; custom boards and labels.
- **Player Profiles** — traits, strengths/weaknesses, scout notes, grade history, media big-board quotes.
- **Scouting Matrix** *(rebuild in progress → Pairwise Elo Preference Engine)* — rank a position group through head-to-head matchups; an Elo system turns your gut picks into a numerical board.
- **Draft Simulator** — run a draft off your own board with trade-value math and pick grading.
- **Prospect Comparer**, **Team Reports**, **Coaching Reports**, and a **Data Hub** for JSON import/export.
- **GM Profiles** *(planned)* — historical GM draft tendencies derived from Pro Football Reference.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Set `GEMINI_API_KEY` in `.env.local` to your Gemini API key (used server-side for media scouting quotes).
3. Run the app:
   ```
   npm run dev
   ```

## Tech

React 19 + Vite + Tailwind, an Express/`tsx` dev server (`server.ts`), and the Gemini API (`@google/genai`). Data is local-first (browser `localStorage`), with JSON import/export for portability.
</content>
