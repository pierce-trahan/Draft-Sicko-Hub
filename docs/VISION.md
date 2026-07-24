# Sicko's Draft Hub — Vision & Roadmap

> **Status:** Working draft v0.1 · Living document — we revise this as the vision sharpens.
> **Purpose:** One shared source of truth for *what this tool is, who it's for, and the order we build it in.* This is the spec Claude designs against and Gemini engineers from. When in doubt, this document wins — if the code and this doc disagree, we fix one of them on purpose.

---

## 1. North Star

**An open-source, free, local-first NFL Draft scouting workbench — the tool draft sickos have always wanted, in one place, with no paywall.**

The variations of this tool exist scattered across the internet, half-finished, and almost always behind a subscription. This pulls the good parts into one central hub, gives it away, and runs locally so your evaluations are *yours*.

### The deeper "why" (do not lose this)
This is a **learning instrument**, not just a ranking generator. The point is to help a dedicated fan build a durable, *personal* scouting philosophy over years:
- Form and defend real opinions on players before their NFL careers play out.
- Learn your own tendencies — what traits/archetypes/positions you gravitate to, and where your blind spots are.
- Absorb the nuance of the sport: schemes, organizational philosophy, positional value, how GMs and coaches actually think.
- **Test narrative against data.** Hold the popular scouting/GM/media narratives up to the actual numbers — and learn where consensus belief *isn't* borne out. The gap between what people repeat and what the data shows is itself the lesson. The mission is to **merge public perception toward reality through education.**

It should reflect the user's own practice back at them so they get *better at scouting*, not just faster at making a list.

---

## 2. Audience

**For:** Fans of football / the NFL / college football who already know the game and want to get *into scouting* — build their own rankings and, crucially, **contextualize** them (by team, scheme, position, GM tendency).

**Explicitly NOT for (yet):** Absolute beginners who don't know rules, formations, or positions. That "on-ramp for newcomers" product is a **separate future project** — deliberately kept out of this tool to avoid diluting it. Beginners are welcome to use this as a stretch, but we do not design *down* to them here.

**Design consequence:** We assume literacy and reward depth. Density and jargon are features, not bugs — as long as they're organized.

---

## 3. Design Tenets (our anti-bloat guardrails)

These exist to prevent the exact thing the scattered competitor tools suffer from — feature sprawl with no spine.

1. **Local-first, you own your data.** Runs locally; evaluations live in the user's browser/files. Import/export is the sync model. No account required to use core features.
2. **Emergent preference over dialed-in ranking.** The most valuable signal is the one the user *doesn't* consciously control (see the Pairwise Elo engine). Preserve that purity.
3. **Every ranking is contextualized.** A number alone is noise. Rankings gain meaning next to team needs, scheme fit, GM tendency, and the user's own history.
4. **Learning is a first-class output.** Wherever possible, surface *insight about the evaluator* (your gut vs. your grades, your positional biases over time), not just about the players.
5. **One mechanic, done fully.** Prefer finishing a feature to its real depth over adding a shallow new one. A half-built module is worse than a missing one.
6. **The number is sacred — don't hide it.** Where a competitor removes/obscures a useful output, we keep and surface it (with context).
7. **Unbiased signal over narrative.** Trends emerge from the data; we never tune weights or metrics to reproduce a popular belief. Where the numbers contradict consensus, that gap *is* the product — surface it, don't sand it down. (See §7 — the Baalke case.)

---

## 4. Naming & Branding — DECIDED & APPLIED

**Product name: `Sicko's Draft Hub`.** Provisional but authoritative until changed here. Standardized across the codebase:

| Location | Was | Now |
|---|---|---|
| App header (`src/App.tsx`) | `ProspectEngine V2.4` | ✅ `Sicko's Draft Hub V2.4` |
| `index.html` `<title>` | `ProspectEngine // V2.4` | ✅ `Sicko's Draft Hub` |
| `metadata.json` `name` | `NFL Draft Prospect Board & Scout Tool` | ✅ `Sicko's Draft Hub` |
| `package.json` `name` | `react-example` | ✅ `sickos-draft-hub` |
| App copy (import blurb, error msg, export filename) | `ProspectEngine` / `prospect_engine_*` | ✅ `Sicko's Draft Hub` / `sickos_draft_hub_full_backup.json` |
| `README.md` | AI Studio boilerplate | ✅ Real product README |
| **localStorage keys** (`nfl_draft_*`, `prospect_engine_*`) | — | 🔒 **intentionally left as-is** — renaming orphans existing user data |

Version label (`V2.4`) — kept for now; decide whether to keep a visible version badge or drop it. *(Open item #6.)*

---

## 5. Module Architecture

The app is organized as a set of modes off a left nav. Current build → intended vision, with honest gaps.

| Module | Built today | Intended | Gap size |
|---|---|---|---|
| **Prospect Boards** | League / team / position / scheme + custom boards; drag-rank; labels; per-board export | Keep; this is the backbone | ✅ small |
| **Player Profiles** | Traits, strengths/weaknesses, media big-board quotes (AI-generated), scout notes, grade history, radar | Keep; extend trait model per position (below) | 🟡 medium |
| **Scouting Matrix** | Sorted list/heatmap by `overallGrade` | **Rebuild** as Pairwise Elo Preference Engine (§6) | 🔴 large — wrong mechanic today |
| **Draft Class Overview** | Class-wide summary view | Keep | ✅ small |
| **Draft Simulator** | User-board-driven sim, trade values (OTC), analytics dashboard, grade summary | Keep; consider AI-GM behavior (§7 ties in) | 🟡 medium |
| **Prospect Comparer** | Multi-player compare | Keep; align with position-aware traits + radar overlay | 🟡 medium |
| **Team Reports** | Cap, depth chart, needs, transactions | Keep | ✅ small |
| **Coaching Reports** | Coach scheme trees, mentors/protégés, formation trends | Keep | ✅ small |
| **GM Profiles** | ❌ does not exist | **New** — historical GM draft tendencies (§7) | 🔴 large — net-new + data pipeline |
| **Data Hub** | Import/export (board / class / full backup / smart-merge) | Keep; becomes the "sync" story | ✅ small |

---

## 6. Flagship Feature — Pairwise Elo Preference Engine

*(Replaces the current Scouting Matrix, which is misnamed: it only sorts by grade.)*

### The idea (from Big Board Lab, refined)
Within a position group, present **two players at a time** head-to-head. The user picks a preference — e.g. `Strongly Prefer A · Prefer A · Toss-Up · Prefer B · Strongly Prefer B`. Repeated across the pool, an **Elo rating system** converts these head-to-head choices into a numerical ranking.

### Why this matters (the philosophy)
This ranking is valuable *precisely because the user never turns a ranking knob directly.* It's an emergent illustration of gut/subconscious preference — the "unfiltered" board. Big Board Lab **hides this number after you finish. We keep it and make it the centerpiece.**

### Confirmed mechanic
Big Board Lab's own description: *"pick between two players at a time and an Elo system builds your rankings."* So the math is **Elo** (each comparison updates both players' ratings; margin of preference — "strongly" vs "slightly" — can scale the K-factor / expected-score delta).

### Spec sketch (to refine)
- **Rating model:** Elo per player, scoped to a position group (a WR's rating only means something vs other WRs). Consider Bradley-Terry as an alternative if we want a maximum-likelihood full-ranking instead of online Elo — *decision for later.*
- **Preference granularity:** 5-point (strong/slight/toss-up both ways) mapped to score outcomes (e.g. 1.0 / 0.75 / 0.5 / 0.25 / 0.0) and/or K-factor scaling.
- **Pair selection:** don't brute-force all N² pairs. Prioritize informative matchups (close ratings, high uncertainty) so a session converges fast. Track comparison count / confidence.
- **Output — the sacred number:** each player gets an emergent preference score + rank within position. **Surfaced, saved, and never auto-hidden.**
- **The learning payoff (our differentiator):** show the user their **Elo/preference board next to their deliberate grade board** and highlight divergences — "your gut ranks X above Y, but your grades say the opposite." *That* is the self-audit insight the whole tool is about.

### DECIDED — how the Elo number relates to the boards
**Both.** The pairwise session produces a **separate "preference board"** that is preserved by default (protecting the emergent purity and powering the gut-vs-grades comparison), **and** the user can explicitly **commit it to a board** (seed/overwrite a chosen board's order) via an intentional action. Separate-by-default; commit-on-demand.

---

## 7. GM Profiles + the Football Reference Data Pipeline

### Intent
A GM entity capturing **historical draft tendencies**: which positions they take by round, favored archetypes/traits, reach-vs-value patterns, tendencies over their tenure. This lets a user contextualize prospects against *how a real decision-maker actually drafts* — and feeds realistic AI-GM behavior in the simulator later.

> **Data over narrative — the Baalke case (why this matters).** Trent Baalke was chosen as a subset test GM *because* he carries a strong public narrative: the "boom-bust athletic gambler." When we actually joined his picks to athletic data (Spec 05 → Spec 06), that narrative barely showed — his matched combine scores average **~5.7/10**, a weak athletic lean. What *did* emerge, unbiased, is a **defensive-trenches positional bias** (EDGE/DL early, with a poor hit rate). We deliberately do **not** nudge the athletic weighting to force the famous story. That Baalke isn't even a current GM makes him the perfect proof: he's a narrative-heavy test case, and the profile the tool produces comes from the numbers, not the story — even when the two disagree. This *is* the mission (§1): merge public perception toward reality through education.

### Data source & approach — CONFIRMED
This is **data-derived, not hand-authored.** An **agent pulls draft history from Pro Football Reference, per team**, then sorts/filters that data; we build the GM tendency models on top of the cleaned dataset.

**GM↔year mapping — SOLVED.** Pro Football Reference lists the **General Manager directly in each team-season header block** (e.g. `pro-football-reference.com/teams/car/2017.htm` → "General Manager: Dave Gettleman"), alongside Coach, coordinators, owner, and offensive/defensive scheme. So the GM-per-year mapping and the draft-picks data live on the same per-team-season pages — no separate GM-tenure source required.

### Pipeline shape (to spec)
1. **Extract:** agent walks each team's season pages (`/teams/{abbr}/{year}.htm`), scraping (a) the **General Manager** field from the header block and (b) that year's **draftees table** (year, round, pick, player, position, college). *(Respect PFR terms/rate limits — throttle and cache; scrape offline, not at runtime.)*
2. **Attribute to GM:** join picks → GM using the same-page GM field. Handle mid-season/offseason GM changes and interim GMs as edge cases.
3. **Transform:** aggregate into tendency metrics — position-by-round distribution, archetype lean, average draft-value delta (reach/steal), trait preferences where derivable.
4. **Load:** ship as a static dataset the app reads (keeps the app local-first; the scrape is a build-time/offline job, not a runtime dependency).
5. **Build on it:** GM Profile views, and optionally realistic AI-GM logic in the Draft Simulator.

### v1 scope — DECIDED
**Prove the pipeline on a small subset first** (a handful of teams / GMs), validate the extract→attribute→transform→load flow and the GM-attribution edge cases, *then* scale to all 32 teams' full history.

### OPEN DECISIONS
> - **Refresh model** — one-time dataset, or re-run yearly after each draft? *(Lower priority; decide before scaling past the subset.)*

---

## 8. Data Architecture

- **Local-first.** Today: `localStorage` (`nfl_draft_players`, `nfl_draft_rankings`, `nfl_draft_custom_boards`, `nfl_draft_custom_labels`, `nfl_draft_theme`). Portability via JSON import/export (individual board / draft class / full backup / smart-measurables-merge).
- **Static reference data** ships in `src/data/` (`initialProspects`, `teams`, `coachesData`, `teamReportsData`). GM data joins this as a generated dataset.
- **AI layer:** `server.ts` already uses the Gemini API (`@google/genai`) server-side (currently for media scouting quotes). This is the seam where AI-GM simulation and any future generated analysis plug in.
- **Principle:** scraped/derived data (GM history) is prepared **offline** and shipped static — the running app should not depend on live third-party sites.
- **External data sources** (NFL + college + athleticism, with licenses) are catalogued in [`docs/research/data-sources.md`](research/data-sources.md). Headline: **nflverse** (CC-BY 4.0) is the redistribution-friendly spine; **CFBD** for college; **RAS** for athleticism; **PFR** (free CSV export) for GM-by-year. NFL+ grants no data/API access — use nflverse's public NGS aggregates.

---

## 9. Build Workflow — three roles

A three-tier pipeline. Full detail + **paste-ready system instructions** live in [`docs/workflow/`](workflow/README.md).

- **Claude = Audit & Designer.** Specs (this doc + `docs/specs/*`), architecture decisions, pressure-testing, catching what "doesn't click," reviewing output. Writes the *what* and *why*.
- **Gemini 3.6 (regular AI Studio chat) = Platform Engineer.** Large token budget; implements specs into complete, **tested** code and logic. Builds and verifies. → [`docs/workflow/gemini-3.6-platform-engineer.md`](workflow/gemini-3.6-platform-engineer.md)
- **AI Studio app-build environment = Implementation Engineer / orchestrator.** Assembles the tested code into the runnable, publishable product; integration, config, deploy readiness. → [`docs/workflow/aistudio-implementation-engineer.md`](workflow/aistudio-implementation-engineer.md)

**Flow:** design → build & test → integrate & ship → review. Problems flow back one step (integration issues → platform engineer; product ambiguity → designer). **Handoff format:** each feature gets a spec in `docs/specs/NN-*.md` (intent → mechanic → data model → acceptance criteria → out-of-scope), precise enough to build without re-litigating the vision.

---

## 10. Roadmap (sequencing to avoid bloat)

Ordered to lock the spine before adding surface area.

**Phase 0 — Alignment & hygiene** *(now)*
- [x] Establish this vision doc.
- [x] Standardize name → Sicko's Draft Hub (§4).
- [x] Resolve the flagship + GM-pipeline decisions (§6, §7).

**Phase 1 — Fix the flagship** ✅ **Landed** → [`docs/specs/01-elo-preference-engine.md`](specs/01-elo-preference-engine.md)
- [x] Rebuild Scouting Matrix as the Pairwise Elo Preference Engine (§6).
- [x] Add the gut-vs-grades comparison view (the core learning payoff).

**Phase 2 — Depth on evaluation**
- [x] Position-aware trait model (per-position traits + weighting, richer radar) → [`docs/specs/03`](specs/03-position-aware-trait-model.md) ✅ **Landed** (aligns Comparer + Player Profile). T-1 trait content still to author with the user.
- [ ] **Positional Usage & Projection** → [`docs/specs/04`](specs/04-positional-usage-projection.md) — avenues of usage + predictive best-scheme/formation-spot for tweener/`FLEX` prospects. Depends on Spec 03 + `SCHEMES`.
- [ ] **Athletic Profile & Outlier Metric** *(Phase 2.5)* → [`docs/specs/05`](specs/05-athletic-profile-outlier-metric.md) — combine/RAS athleticism + "toolsy reach vs. production." Captures the Baalke fingerprint; feeds 03/04/02.

**Phase 3 — GM intelligence** → [`docs/specs/02`](specs/02-gm-profiles-pipeline.md)
- [ ] Build the Pro Football Reference draft-history pipeline (§7) — prove on a 2–3 GM subset first.
- [ ] Ship GM Profile views (position-by-round, allocation, capital, college/conference lean).
- [ ] (Optional) wire GM tendencies into the Draft Simulator as AI-GM behavior → [`docs/specs/06`](specs/06-ai-gm-simulator-behavior.md). Depends on Spec 02 (+05).

**Phase 4 — Polish & publish** → [`docs/specs/07`](specs/07-open-source-packaging-publish.md)
- [ ] License, data attributions, run-with/without-AI, self-host docs; AI Studio publish path.

**Phase 5 — UI direction (editorial scouting workstation)** → [`docs/research/ui-direction.md`](research/ui-direction.md)
- [ ] Move the UI off its vibe-coded look via the four structural moves + visible provenance; keep **emerald** (D-3).
- [ ] **Two-page player profile** (Player Info / Scouting Report) → [`docs/specs/09`](specs/09-player-profile-restructure.md) — Scouting Report first (existing data), Player Info after CFBD wiring.
- [ ] **Scouting Atlas** — the one signature interaction (spatial class map). Designated, staged as `docs/specs/10` (not yet drafted).

*(A separate "beginner on-ramp" product is out of scope for this repo — noted so it doesn't creep in. It and other deliberately-separate ideas are parked in [`docs/future-tools.md`](future-tools.md) with their blockers and integration seams.)*

**Full spec index + build order:** [`docs/specs/README.md`](specs/README.md).

---

## 11. Open Decisions Log

Track unresolved calls here so they don't get lost between sessions.

| # | Decision | Status | Note |
|---|---|---|---|
| 1 | Elo ranking → separate board vs. seeds a board vs. both | ✅ **Decided** | **Both** — separate-by-default, commit-on-demand (§6) |
| 2 | Elo vs. Bradley-Terry for the rating math | Open | Elo confirmed as BBL's approach; revisit if we want full-MLE ranking |
| 3 | GM↔year authoritative mapping source | ✅ **Decided** | PFR team-season header lists the GM directly (§7) |
| 4 | GM pipeline v1 scope (all 32 vs. subset) | ✅ **Decided** | Prove pipeline on a subset first (§7) |
| 5 | GM data refresh cadence | Open | One-time vs. yearly; low priority until we scale |
| 6 | Keep a visible version badge? | Open | Currently `V2.4` |
| 7 | Confirm Big Board Lab feature details | Open | Verify once logged in on Chrome |
| 8 | Naming standardization | ✅ **Done** | Applied across codebase (§4) |
| F-1 | Formation data: split numbers out of prose | ✅ **Decided** | Add numeric `usagePct`/`runPct`/`passPct` fields (formation-trends-audit) |
| F-2 | Formation data: structure keyAttributes + link archetypes | ✅ **Decided** | Prerequisite for Spec 04 (formation-trends-audit) |
| F-3 | Formation numbers: illustrative vs. data-derived | ✅ **Decided** | Hybrid — illustrative + swap-ready now, nflverse-derived later; label as illustrative (formation-trends-audit) |
| F-4 | Formation data: add defensive fronts | ✅ **Decided** | Offense-only today; add defense (formation-trends-audit) |
| G-1 | GM acquisition / PFR ToS | ✅ **Decided** | Hybrid, no live scraping: manual CSV export (subset) + nflverse (scale); ship derived aggregates + attribution (Spec 02) |
| G-2 | GM subset choice (which 2–3 GMs) | ✅ **Decided** | Roseman (elite), Schoen (mid), Baalke (boom-bust) — Spec 02 §A6 |
| G-3 | Tweener position handling | ✅ **Decided** | First-class `FLEX` bucket; rich usage-projection is a separate future spec (Spec 02) |
| G-4 | At-scale player-identity join | ✅ **Decided** | Canonical `prospect_id` + cross-source ID crosswalk (Spec 08); join on IDs, never names — build before scaling 02/05 |
| D-1 | FTN charting data in v1 | ✅ **Decided** | **Out of v1** — FTN is CC-BY-SA; use nflverse `load_participation()` (CC-BY) for personnel/formation to keep one clean license (data-sources.md §1) |
| D-2 | Nudge GM metrics to match public narrative? | ✅ **Decided — No** | Never tune weights/metrics to reproduce a media/fan narrative. Ship the unbiased trend; where it contradicts consensus, that's the lesson. Baalke: measured athletic lean is weak (~5.7); the real signal is a defensive-trench positional bias (§7; Spec 02 §A6; Spec 06 review S-5) |
| D-3 | UI direction + accent color | ✅ **Decided** | Editorial scouting workstation (terminal density, provenance-forward), keep **emerald** as the single accent (R&D orange not adopted); Scouting Atlas = the one signature (staged, Spec 10); two-page player profile (Spec 09). See [`ui-direction.md`](research/ui-direction.md) |

---

## Appendix — Big Board Lab reference (competitor we're learning from)

Domain is **bigboardlab.com** (singular "Lab"). Automated fetch is blocked (403 / Cloudflare); details below are from search and need confirmation once logged in:
- Pairwise comparison → **Elo** rankings ("pick between two players at a time and an Elo system builds your rankings").
- Trait sliders (arm strength, burst, bend, coverage instincts, route running…), position-aware weighting, radar/spider charts.
- Compare tool: pin up to 4 prospects with overlaid radar.
- Combine measurables vs. 26 years of history.
- Per-team scheme mapping → prospect scheme-fit score.
- Mock simulator: all 257 picks vs. 32 AI GMs with team-specific needs/scheme/philosophy.
- ~458 prospects with scouting reports; free.
