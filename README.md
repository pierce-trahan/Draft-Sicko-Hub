# Sicko's Draft Hub

An open-source, free, **local-first** NFL Draft scouting workbench — build your own prospect rankings, contextualize them against team need, scheme, and real GM tendencies, and learn your own scouting biases along the way. No paywall, no account required.

See [`docs/VISION.md`](docs/VISION.md) for the full product vision and [`docs/specs/`](docs/specs/README.md) for the build/spec index.

## Run locally

**Prerequisites:** Node.js (or [Bun](https://bun.sh))

1. Install dependencies:
   ```
   npm install
   ```
   (or `bun install`)
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` if you want AI-assisted features (media scouting quotes, etc.). **The app runs without a key** — AI features degrade gracefully to built-in fallbacks; core scouting/board/matrix/GM features are unaffected either way.
3. Start the dev server:
   ```
   npm run dev
   ```

## Build & run in production

```
npm run build   # vite build (client) + esbuild bundle of server.ts
npm start       # runs dist/server.cjs
```

## Data & attribution

External data sources, their licenses, and redistribution terms are catalogued in [`docs/research/data-sources.md`](docs/research/data-sources.md). Full attributions ship in-app (Data & Credits) and in `ATTRIBUTIONS.md` — see [Spec 07](docs/specs/07-open-source-packaging-publish.md) for the packaging/licensing work in progress.

## Contributing / how this project is built

This project is built through a three-role workflow (design → build & test → integrate & ship). See [`docs/workflow/`](docs/workflow/README.md) for how it works.
