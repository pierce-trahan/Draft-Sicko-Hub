# Spec 07 — Open-Source Packaging & Publish

> **Phase:** 4. **Touches:** repo root (README, LICENSE, ATTRIBUTIONS), `server.ts`, `.env.example`, build scripts, an in-app "Data & Credits" view.
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Reads with:** `docs/VISION.md` (§1 positioning, §3 tenets) + `docs/research/data-sources.md` (attribution).

---

## 0. What we're building (one paragraph)

The work to make Sicko's Draft Hub a *real* open-source product anyone can download and self-host: a license, clear attributions for every data source, honest local-run/self-host instructions, graceful behavior **with or without** a Gemini key, and a documented publish path via AI Studio. This is what turns "a repo" into "a free tool the draft-sicko community can actually use," which is the whole positioning.

## 1. Why (the philosophy)

The pitch is "open-source, free, local-first, no paywall." That's only true if someone can clone it, run it, understand what data it uses and under what terms, and trust it respects their data. Packaging *is* the product promise.

## 2. Licensing & attribution

- **Code license:** add a root `LICENSE`. **Recommend MIT** (permissive, matches the give-it-away ethos and the nflverse/nflreadr code license). Confirm with the user (P-1).
- **Data attributions:** add a root `ATTRIBUTIONS.md` (or `NOTICE`) crediting each source per its terms — **nflverse (CC-BY 4.0)**, **Pro Football Reference**, **RAS / Kent Lee Platte "MathBomb"** (attribution required), **CFBD** if used. Pull specifics from `docs/research/data-sources.md`.
- **In-app "Data & Credits"** view (small; reuse `CitedSources.tsx` patterns) so attribution ships in the running app, not just the repo.
- Ship **derived** data, never third-party raw tables/DBs verbatim (consistent with G-1).

## 3. Run modes — with and without AI (hard requirement)

The app is **not purely static**: `server.ts` (Express) makes a server-side **Gemini** call for media scouting quotes. Local-first means the core must work **without** a key.

- **Full mode:** user sets `GEMINI_API_KEY` (see `.env.example`) → AI features (quote generation, optional Spec 04 rationale polish, optional Spec 06 narration) active.
- **Offline/static mode:** no key → **all AI features degrade gracefully** to the existing fallbacks (e.g. `FALLBACK_MEDIA_QUOTES` in `server.ts`) or deterministic templates. Nothing crashes; nothing blocks core scouting/board/matrix/GM features.
- Document both clearly. Consider a static-only build target if feasible, but graceful degradation is the requirement.

## 4. Docs & repo hygiene

- **README** (already rewritten in Phase 0) — verify accuracy: what it is, features, prerequisites, `npm install` / `npm run dev` / `build` / `start`, env setup, self-host notes, license + attributions links, and a pointer to `docs/VISION.md`.
- **`.env.example`** — confirm it documents `GEMINI_API_KEY` and that the app runs without it.
- **CONTRIBUTING.md** (light) — how the Claude-designs / Gemini-builds workflow maps to contributions; link `docs/workflow/`.
- Ensure `docs/` (VISION, specs, workflow, research) is discoverable from the README.

## 5. Publish path

- **Local/self-host:** `npm install` → `npm run dev` (dev) or `npm run build` → `npm start` (prod: `vite build` + `esbuild` bundle to `dist/server.cjs`). Verify a clean machine can follow the README end-to-end.
- **AI Studio:** document how the app publishes from the AI Studio app-build environment (the Implementation Engineer's lane). Note any AI-Studio-specific config and how `GEMINI_API_KEY` is provided there.
- Confirm no secrets are committed; `.env.local` stays gitignored.

## 6. Acceptance criteria

- [ ] `LICENSE` present (MIT, pending P-1) and referenced in README.
- [ ] `ATTRIBUTIONS.md` credits every data source per its terms; in-app Data & Credits view ships.
- [ ] App runs **without** `GEMINI_API_KEY` — every AI feature degrades gracefully, core features fully functional.
- [ ] App runs **with** the key — AI features active.
- [ ] A clean-machine run of the README (install → dev → build → start) succeeds.
- [ ] No secrets committed; `.env.local` gitignored; `.env.example` accurate.
- [ ] AI Studio publish path documented.

## 7. Out of scope (note, don't build)

Hosted/multi-user backend; accounts/auth; telemetry; a packaged desktop app; automated data-refresh infrastructure (that's the pipeline's own cadence question).

## 8. Open items

- **P-1 — License choice.** MIT (recommended) vs. other. User confirms.
- **P-2 — Static-only build?** Offer a no-server static bundle (AI disabled) in addition to the full server build, or rely solely on graceful degradation.
- **P-3 — Data redistribution final check.** Confirm CFBD terms and RAS attribution wording before shipping any of their derived data publicly (from `docs/research/data-sources.md` §8).
</content>
