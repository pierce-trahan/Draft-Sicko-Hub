# Future Tools — Parked Ideas (post-Hub / separate projects)

> **Status:** Living list. **Purpose:** capture good ideas that are *deliberately not* part of Sicko's Draft Hub so they don't get lost between sessions — and so they don't creep into the Hub's scope and dilute it (VISION §3, anti-bloat).
> **Rule of thumb:** if an idea is a *separate product* or is blocked on data/tech the Hub can't assume, it lives here — with its blocker and its eventual integration seam back into the Hub — not in a spec.

---

## How to read an entry

Each entry states: **what it is**, **why it's parked** (the real blocker or the "it's a separate product" reason), the **trigger** that would move it to active, and — if relevant — the **integration seam** back into the Hub once it exists.

---

## 1. College route/formation classification from broadcast video (CV)

- **What it is:** a computer-vision pipeline that reconstructs player-tracking coordinates from broadcast college-football footage, then classifies **route trees** (go/post/dig/out/slant…) and **formations** (trips/bunch/empty/pistol…) — the spatial data that public sources simply don't publish for NCAA.
- **Why it's parked (structural, not a calendar problem):** there is **no public player-tracking data for college football at all** — Big Data Bowl is NFL-only, a few seasons. This gap does **not** resolve when a season is played: even for prospects' *already-completed* college seasons there are box scores and play-by-play but **no tracking coordinates** to classify. So route trees for college prospects can't be *fetched* — they'd have to be *generated* from video. That's a months-long research project with its own model training, evaluation, and licensing questions around broadcast footage — a separate tool, not a Hub feature.
- **Trigger:** a working CV tracking→route/formation model with acceptable accuracy on college broadcast footage, and a clear stance on footage licensing.
- **Integration seam into the Hub:** once it can emit per-player route/alignment/formation aggregates as **derived static data**, those slot straight into the existing player profile (route-tree cards, alignment splits) and **Spec 04** (usage projection can consume real formation spots instead of illustrative ones) — same offline-then-static discipline the Hub already uses (VISION §8). Keep the CV project's raw tracking output *out* of the Hub; ship only derived aggregates + attribution.
- **Origin:** surfaced in the ChatGPT data-sources audit (July 2026) as the app's "biggest differentiator." Assessment: intellectually strong, but poorly matched to the Hub's subject (current college prospects) and its local-first/give-it-away constraints — right idea, wrong home. Kept as a separate future tool; the Hub's differentiator stays the learning-instrument / gut-vs-grades / GM-contextualization angle.

## 2. Beginner "on-ramp" product (learn the game → learn to scout)

- **What it is:** the newcomer-facing product for people who don't yet know rules, positions, or formations — an on-ramp *toward* the kind of literacy the Hub assumes.
- **Why it's parked:** explicitly out of scope for this repo by design (VISION §2). The Hub "assumes literacy and rewards depth"; designing *down* to absolute beginners would dilute exactly the density that makes it good.
- **Trigger:** the Hub reaching a finished, stable state, plus a real desire to build the on-ramp as its own product.
- **Integration seam:** likely a sibling app that *graduates* users into the Hub, sharing branding and possibly the glossary/terminology layer — not shared runtime.

## 3. Basketball (or other-sport) analytics tool

- **What it is:** the same "open, local-first, transparent analytics" pattern applied to another sport.
- **Why it's parked:** entirely separate domain and dataset; noted only because the **SportsDataverse** ecosystem the Hub already leans on for football (`nflfastR`/`cfbfastR`) also covers basketball (`hoopR`/`wehoop`) — so the data-access pattern would transfer even though nothing else does (data-sources.md §2).
- **Trigger:** interest after the Hub ships; a decision that the pattern is worth generalizing.
- **Integration seam:** none expected — a separate product sharing methodology and possibly shared tooling, not data.

---

## Adding to this list

When an idea comes up that's a separate product or is blocked on data/tech the Hub can't assume, add an entry here (what / why parked / trigger / seam) rather than opening a spec. When an entry's **trigger** fires, promote it: give it its own repo or a real spec, and link back here.
