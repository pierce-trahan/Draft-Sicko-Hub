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

---

## 4. Naming & Branding — DECIDED (for now)

**Product name: `Sicko's Draft Hub`.** Provisional but authoritative until changed here.

The name is currently inconsistent across the codebase. Standardize all of the following (task for engineering):

| Location | Current | Target |
|---|---|---|
| App header (`src/App.tsx`) | `ProspectEngine V2.4` | `Sicko's Draft Hub` |
| `index.html` `<title>` | `ProspectEngine // V2.4` | `Sicko's Draft Hub` |
| `metadata.json` `name` | `NFL Draft Prospect Board & Scout Tool` | `Sicko's Draft Hub` |
| `package.json` `name` | `react-example` | `sickos-draft-hub` |
| `README.md` | AI Studio boilerplate | Real product README |
| localStorage keys (`nfl_draft_*`) | keep as-is | **do not rename** (would orphan existing user data) |

Version label (`V2.4`) — decide whether to keep a visible version badge or drop it. *(Open item.)*

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

### OPEN DECISION — how the Elo number relates to the boards
> When a pairwise session finishes, does its ranking (a) stay a **separate "preference board"** you compare against your manual/grade board, (b) **seed/overwrite** a chosen board's order, or (c) both (separate by default, with an opt-in "commit to a board")?
> **Claude's recommendation:** **(c)** — keep it separate by default to preserve the emergent purity *and* enable the gut-vs-grades comparison, with an explicit "commit as board" action. Confirm before we spec the data model.

---

## 7. GM Profiles + the Football Reference Data Pipeline

### Intent
A GM entity capturing **historical draft tendencies**: which positions they take by round, favored archetypes/traits, reach-vs-value patterns, tendencies over their tenure. This lets a user contextualize prospects against *how a real decision-maker actually drafts* — and feeds realistic AI-GM behavior in the simulator later.

### Data source & approach — CONFIRMED
This is **data-derived, not hand-authored.** An **agent pulls draft history from Pro Football Reference, per team**, then sorts/filters that data; we build the GM tendency models on top of the cleaned dataset.

### Pipeline shape (to spec)
1. **Extract:** agent scrapes/collects per-team historical draft picks (year, round, pick, player, position, college) from Pro Football Reference. *(Respect their terms/rate limits — decide caching/refresh cadence.)*
2. **Attribute to GM:** map each draft year → the GM in charge that year (needs a GM-tenure table; PFR has GM/exec info in places but this mapping likely needs its own source/verification).
3. **Transform:** aggregate into tendency metrics — position-by-round distribution, archetype lean, average draft-value delta (reach/steal), trait preferences where derivable.
4. **Load:** ship as a static dataset the app reads (keeps the app local-first; the scrape is a build-time/offline job, not a runtime dependency).
5. **Build on it:** GM Profile views, and optionally realistic AI-GM logic in the Draft Simulator.

### OPEN DECISIONS
> - **GM↔year mapping source** — where does the authoritative "who was GM in year N" table come from? (Not cleanly on PFR.)
> - **Scope of v1** — all 32 teams full history, or start with a handful to prove the pipeline?
> - **Refresh model** — one-time dataset, or re-run yearly after each draft?

---

## 8. Data Architecture

- **Local-first.** Today: `localStorage` (`nfl_draft_players`, `nfl_draft_rankings`, `nfl_draft_custom_boards`, `nfl_draft_custom_labels`, `nfl_draft_theme`). Portability via JSON import/export (individual board / draft class / full backup / smart-measurables-merge).
- **Static reference data** ships in `src/data/` (`initialProspects`, `teams`, `coachesData`, `teamReportsData`). GM data joins this as a generated dataset.
- **AI layer:** `server.ts` already uses the Gemini API (`@google/genai`) server-side (currently for media scouting quotes). This is the seam where AI-GM simulation and any future generated analysis plug in.
- **Principle:** scraped/derived data (GM history) is prepared **offline** and shipped static — the running app should not depend on live third-party sites.

---

## 9. Build Workflow — Claude ↔ Gemini

Explicit division of labor so handoffs are clean:

- **Claude = design & audit.** Specs (like this doc), architecture decisions, pressure-testing ideas, catching what "doesn't click," reviewing Gemini's output. Claude writes the *what* and *why*.
- **Gemini (Google AI Studio) = engineer.** Implements against these specs; handles the build-out and publishing path.
- **Handoff format:** each feature gets a spec section here (intent → mechanic → data model → open decisions) precise enough for Gemini to build without re-litigating the vision.

---

## 10. Roadmap (sequencing to avoid bloat)

Ordered to lock the spine before adding surface area.

**Phase 0 — Alignment & hygiene** *(now)*
- [x] Establish this vision doc.
- [ ] Standardize name → Sicko's Draft Hub (§4).
- [ ] Confirm the open decisions in §6 and §7.

**Phase 1 — Fix the flagship**
- [ ] Rebuild Scouting Matrix as the Pairwise Elo Preference Engine (§6).
- [ ] Add the gut-vs-grades comparison view (the core learning payoff).

**Phase 2 — Depth on evaluation**
- [ ] Position-aware trait model (per-position traits + weighting, richer radar).
- [ ] Align Prospect Comparer + Player Profile to the new trait model.

**Phase 3 — GM intelligence**
- [ ] Build the Pro Football Reference draft-history pipeline (§7).
- [ ] Ship GM Profile views.
- [ ] (Optional) wire GM tendencies into the Draft Simulator as AI-GM behavior.

**Phase 4 — Polish & publish**
- [ ] Real README + open-source packaging (local-run instructions, license).
- [ ] Publishing path via Google AI system.

*(A separate "beginner on-ramp" product is out of scope for this repo — noted so it doesn't creep in.)*

---

## 11. Open Decisions Log

Track unresolved calls here so they don't get lost between sessions.

| # | Decision | Status | Note |
|---|---|---|---|
| 1 | Elo ranking → separate board vs. seeds a board vs. both | **Open** | Claude recommends "both / separate-by-default" (§6) |
| 2 | Elo vs. Bradley-Terry for the rating math | Open | Elo confirmed as BBL's approach; revisit if we want full-MLE ranking |
| 3 | GM↔year authoritative mapping source | **Open** | Needed before pipeline (§7) |
| 4 | GM pipeline v1 scope (all 32 vs. subset) | Open | Recommend subset to prove pipeline |
| 5 | GM data refresh cadence | Open | One-time vs. yearly |
| 6 | Keep a visible version badge? | Open | Currently `V2.4` |
| 7 | Confirm Big Board Lab feature details | Open | Verify once logged in on Chrome |

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
</content>
</invoke>
