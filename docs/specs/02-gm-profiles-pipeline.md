# Spec 02 — GM Profiles + Pro Football Reference Data Pipeline

> **Phase:** 3. **New module** (no current equivalent) + an **offline data pipeline**.
> **Owner of this spec:** Claude (design). **Builder:** Gemini 3.6 (platform engineer) → AI Studio (implementation).
> **Reads with:** `docs/VISION.md` §7. This is the buildable expansion of that section.
> **Depends on:** nothing in Phase 1/2 — can be built in parallel. The pipeline (Part A) is a prerequisite for the views (Part B).

---

## 0. What we're building (one paragraph)

A **GM Profiles** module that shows how real NFL general managers *actually draft* — position-by-round tendencies, positional allocation, draft-capital spend, and college/conference lean — so a user can contextualize prospects against real decision-maker behavior. The data is **derived, not hand-authored**: an **offline pipeline** scrapes Pro Football Reference per-team-season pages, attributes each draft pick to the GM in charge that year, aggregates tendencies, and ships the result as a **static dataset** the local-first app reads. No runtime dependency on PFR.

This spec has two parts: **A) the offline pipeline** (a script, not app code) and **B) the in-app views**.

---

## PART A — The Offline Data Pipeline

### A1. Source (confirmed)

Pro Football Reference **team-season pages**: `pro-football-reference.com/teams/{pfr_code}/{year}.htm`. Each page carries **both** pieces we need on the same page:
- **GM attribution:** the header block lists **`General Manager: <name>`** (confirmed — e.g. `/teams/car/2017.htm` → "General Manager: Dave Gettleman"), alongside Coach, coordinators, owner, and schemes.
- **That team's draft picks that year:** the page's draft table (Round, Overall Pick, Player, Pos, College/Univ, and often **Career AV**).

Using the team-season page (rather than the league-wide `/years/{year}/draft.htm`) is what makes GM attribution trivial — GM and picks are co-located.

### A2. Extraction

For each `(pfr_code, year)` in the target range:
1. Fetch the team-season page.
2. Parse the **GM name** from the header block. Capture the **exact title** PFR uses (see edge cases — not every team says "General Manager").
3. Parse the **draft table** → one record per pick: `round`, `overallPick`, `playerName`, `position` (PFR raw), `college`, `careerAV?`.

**Scraping discipline (required — PFR/Sports Reference is strict):**
- Rate-limit hard (e.g. ≤ 1 request every 3–5s); random jitter; a descriptive User-Agent.
- **Cache every fetched page to disk**; never re-fetch what you already have. The scrape is idempotent and resumable.
- This runs **offline as a build/data step**, never at app runtime.
- **Respect their Terms of Use.** Sports Reference restricts *automated bulk* scraping and has data-licensing/attribution expectations.

**Acquisition method — DECIDED (hybrid, no live scraping):**
- **Subset / preferred:** the **user manually exports** each needed team-season table via PFR's own **"Share & Export → Get table as CSV"** feature. The pipeline parses those **local CSV files** — no bot touches PFR's servers, which sidesteps the automated-extraction prohibition entirely. This is the path for the 3-GM subset.
- **At full scale:** source **draft picks** from **nflverse** (`load_draft_picks()`, every pick since 1980, **CC-BY 4.0 → redistribution-friendly with attribution**) and use PFR/Wikipedia only for the small **GM-by-year** mapping. See [`docs/research/data-sources.md`](../research/data-sources.md).
- **Redistribution safety:** ship **derived aggregates** (tendencies), *not* PFR's raw tables verbatim. Facts aren't copyrightable; our analysis is ours. Attribute "Data via nflverse / Pro Football Reference" in-app and in the README.
- ✅ **Verified:** PFR per-table CSV export is **still free** ("Share & more → Get table as CSV"); Stathead is only needed for advanced queries.

### A3. Transform

1. **Map PFR franchise code → app team id.** PFR codes are quirky and differ from the app's `Team.id` values. Build an explicit lookup (e.g. `crd→ARI`, `rav→BAL`, `gnb→GB`, `htx→HOU`, `clt→IND`, `sdg→LAC`, `ram→LAR`, `oti→TEN`, `rai→LV`, `nwe→NE`, `nor→NO`, `sfo→SF`, `tam→TB`, `kan→KC`, `sdg`/relocations handled by era). Relocations (SD→LAC, STL/LA Rams, OAK→LV, HOU Oilers→TEN) must map by year.
2. **Normalize position** from PFR raw to the app's position groups (`QB, RB, WR, TE, OT, IOL, EDGE, DT, LB, CB, S`) **plus a first-class `FLEX` bucket** (G-3, decided). Clear cases: `G/C/OG` → `IOL`; `T` → `OT`; `NT/DT` → `DT`; `FS/SS` → `S`. **Genuinely ambiguous tweeners → `FLEX`** rather than a forced binary — e.g. `DE/OLB` tweeners, `DB` with no S/CB split, `LB/S` hybrids. This keeps GM tendencies honest (a pass-rush-heavy GM isn't distorted by an arbitrary EDGE-vs-LB coin flip). Document which raw tags route to `FLEX`.
3. **Attribute each pick to a GM** using the same page's GM field. Assign a stable `gmId` slug (e.g. `dave-gettleman`). Build **GM tenures** `(teamId, startYear, endYear)` from the run of years a name appears for a team.
4. Emit clean records (see data model).

### A4. Load

Ship a **static dataset** in `src/data/` (e.g. `gmData.ts` exporting typed arrays, or a generated `gmData.json` imported there). **Ship the canonical raw records — GM tenures + attributed picks — and compute tendency aggregates in-app** (Part B), so we can refine metrics without re-scraping.

### A5. Edge cases (handle or document)

- **Non-"General Manager" titles.** Some teams/eras list "Executive VP of Football Ops," "Director of Player Personnel," or no GM (historically, e.g. NE under Belichick had no traditional GM). Capture the listed decision-maker + title; where truly absent, mark `gm: null` / "de facto: <coach/exec>". **The v1 subset should deliberately pick teams with a clean `General Manager` field** to validate the happy path first.
- **Mid-tenure / interim GMs**, co-GMs, or a change between seasons → tenure boundaries from the per-year field are authoritative.
- **Traded/forfeited picks, supplemental picks, comp picks** → include what the table shows; don't synthesize.

### A6. v1 scope — DECIDED: prove the pipeline on a 3-GM subset

Run the full extract → attribute → transform → load flow end-to-end on **three GMs chosen for distinct drafting fingerprints** (if the metrics can't differentiate these three, they're too weak):

| Role | GM | Teams (era) | What they test |
|---|---|---|---|
| Elite / process-driven | **Howie Roseman** | PHI | The "gold standard" strategic profile — clean multi-year single-team tenure |
| Mid / solid-on-draft | **Joe Schoen** | NYG | An average-to-solid draft baseline (draft work only) |
| Boom-bust / athletic gambler | **Trent Baalke** | SF, then JAX | **Multi-team attribution** + a strong-but-hard-to-capture "outlier athlete" reputation |

Validate attribution, franchise-code mapping (Baalke spans SF + JAX), position normalization, and aggregation **before** scaling to all 32 teams / full history.

> **Expectation-setting on Baalke:** his signature tendency — betting on *outlier athletes whose production lagged their traits* — is the **archetype/trait lean** metric marked out of scope in §B3 (needs athletic + production data PFR pick tables don't carry). v1 will surface his *positional / round / college* patterns, not the athletic-gamble fingerprint. **Future thread:** a follow-up spec joining draft picks to **historical combine measurables** (available via PFR combine / nflverse) would quantify "toolsy reach" and finally capture this. Note it; don't build it in v1.

---

## PART B — The In-App GM Profiles Module

### B1. Data model

Add to `src/types.ts` (or `src/data/gmData.ts`):

```ts
export interface GMDraftPick {
  year: number;
  round: number;
  overallPick: number;
  playerName: string;
  position: string;     // normalized to app position groups
  college: string;
  teamId: string;       // app Team.id, e.g. 'CAR'
  careerAV?: number;    // from PFR, optional
}

export interface GMTenure {
  teamId: string;
  startYear: number;
  endYear: number | null;   // null = current
}

export interface GMProfile {
  id: string;               // slug, e.g. 'dave-gettleman'
  name: string;
  title?: string;           // exact PFR title if not "General Manager"
  tenures: GMTenure[];
  picks: GMDraftPick[];     // all attributed picks across tenures
}
```

Tendency aggregates (position-by-round matrix, positional share, round/capital spend, college/conference lean) are **computed in a util** (`src/utils/gmTendencies.ts`) from `picks` at load — not stored — so metric changes don't require re-scraping.

### B2. Tendency metrics — v1 (only what PFR supports)

Derivable from PFR data, build these:
- **Position-by-round matrix** — counts of each position taken by round (the signature view; render as a heatmap, reuse the matrix/heatmap styling from the current `PlayerRankingMatrix`).
- **Positional allocation** — share of picks by position (which positions this GM spends on).
- **Draft-capital spend by position** — weight picks by round/slot value (reuse the OTC pick-value table already in `DraftSimulator.tsx`) to show where *capital*, not just *count*, goes.
- **Round/day distribution** — how picks spread across rounds/day 1–2–3.
- **College / conference lean** — which programs and conferences the GM repeatedly draws from.
- **Pick outcomes (optional)** — average `careerAV` by round/position as a rough "how his picks panned out" signal. Label it clearly as outcome, not preference.

### B3. NOT derivable from PFR — explicitly out of scope for v1

State these in the UI as "not yet available" rather than faking them:
- **Reach / value vs. consensus** — requires historical consensus big-board data PFR doesn't provide. Needs a separate source (future spec).
- **Archetype / trait lean** — requires historical trait/measurable data we don't have (the app's trait data is current-class only). Future.
- **Trades / draft-day maneuvering tendencies** — not cleanly derivable here.

### B4. Views & navigation

- New nav entry **"GM Profiles"** in the sidebar `Draft Intelligence` list in `src/App.tsx` (new `appMode: 'gm_profiles'`), following the existing button pattern. New component `src/components/GMProfiles.tsx`.
- **GM list → GM detail.** Detail shows: name/title, team(s) + tenure years, the position-by-round heatmap, positional-allocation + capital charts (recharts/d3, both already deps), round distribution, college/conference lean, and (optional) outcome-by-AV.
- **Cross-links (light, v1):** from a **Team Report**, link to that team's **current** GM profile (join via `teamId` + latest tenure). Do *not* build prospect-level "GMs who'd like this player" in v1 — note it as future.
- Match the existing dark slate + emerald visual language (serif-italic headers, mono labels). Selecting a drafted player name is display-only (historical players aren't in the prospect pool) — no modal wire-up required.

### B5. Simulator tie-in — future, not v1

GM tendencies could later drive realistic **AI-GM behavior** in the Draft Simulator (§ VISION roadmap Phase 3, optional). Note the seam; don't build it here.

---

## Acceptance criteria

**Pipeline (Part A):**
- [ ] Script fetches team-season pages with rate-limiting + on-disk caching; resumable and idempotent.
- [ ] Correctly parses GM name/title and the draft table per page.
- [ ] Franchise-code→app-team-id mapping handles relocations by year.
- [ ] Positions normalized to app groups by a documented, deterministic rule.
- [ ] Picks attributed to GMs; tenures derived correctly for the subset.
- [ ] Emits a typed static dataset in `src/data/`.
- [ ] Runs on the chosen 2–3-GM subset end-to-end and is spot-check-accurate vs. the live PFR pages.

**Module (Part B):**
- [ ] GM Profiles nav entry + list/detail views render from the static dataset.
- [ ] Position-by-round heatmap, positional allocation, capital spend, round distribution, and college/conference lean all compute correctly from `picks`.
- [ ] Aggregates are computed in-app (util), not hard-coded.
- [ ] Not-derivable metrics (reach/value, archetype lean) are shown as "not yet available," not fabricated.
- [ ] Team Report links to the team's current GM profile.
- [ ] Existing modules and storage keys untouched; visual language matches.

## Out of scope for Phase 3 v1 (note, don't build)

Reach/value vs. consensus; historical archetype/trait lean; trade-tendency analysis; AI-GM simulator behavior; prospect-level GM-fit suggestions; full 32-team history (comes after the subset validates).

## Open items (also tracked in VISION.md §11)

- **G-1 — Acquisition / ToS.** ✅ **Decided:** hybrid, no live scraping — user manually exports PFR CSVs for the subset; nflverse for picks + PFR/Wikipedia for GM-by-year at scale; ship derived aggregates with attribution. (Verify CSV-export availability in tools search.)
- **G-2 — Subset choice.** ✅ **Decided:** Howie Roseman (PHI, elite), Joe Schoen (NYG, mid), Trent Baalke (SF→JAX, boom-bust). See §A6.
- **G-3 — Tweener handling.** ✅ **Decided:** ambiguous tweeners map to a first-class **`FLEX`** bucket (not a forced EDGE/LB binary). The richer "avenues of usage + predictive best-scheme/formation-spot" breakdown is a **separate future spec** (Positional Usage & Projection), tied to the Phase 2 trait model — not built here.
- **#5 — Refresh cadence.** One-time vs. re-run yearly after each draft.
