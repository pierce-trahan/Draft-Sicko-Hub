# Data Sources & Open-Source Tooling — Research Findings

> **Status:** v1 research pass (July 2026). Feeds `docs/VISION.md` and the specs. Verify licenses at integration time — terms change.
> **Bottom line:** there's a mature, mostly-open data stack for NFL + college. We can build the whole tool on redistribution-friendly sources and use Pro Football Reference only where it's uniquely convenient (GM-by-year), via its own free export — no automated scraping required.

---

## 0. The recommended open stack (punchline)

| Need | Primary source | License / access | Redistributable? |
|---|---|---|---|
| **NFL draft picks (since 1980), combine, rosters, contracts, depth charts, PBP** | **nflverse** (`nflreadr` / `nflreadpy` / `nfl_data_py`) | Data **CC-BY 4.0** (FTN parts CC-BY-SA 4.0); code MIT | ✅ Yes, with attribution |
| **Public Next Gen Stats aggregates** | **nflverse** `load_nextgen_stats()` | CC-BY 4.0 | ✅ Yes, with attribution |
| **College stats, recruiting rankings, rosters** | **CFBD** — collegefootballdata.com (API or `cfbfastR`) | API-key; free 1k calls/mo, Patreon tiers | ⚠️ Confirm terms before redistributing |
| **Athleticism (combine/pro-day) 0–10 by position, since 1987** | **RAS** — ras.football (Kent Lee Platte / "MathBomb") | Free to view/share cards **with attribution**; bulk DB behind premium | ⚠️ Attribution required; bulk = premium |
| **GM-by-year, misc. historical** | **Pro Football Reference** | Free per-table **CSV export** ("Share & more → Get table as CSV"); Stathead only for advanced queries | ⚠️ Ship derived aggregates + attribution, not raw tables |

**Guiding rule for a give-it-away tool:** prefer **CC-BY sources (nflverse)** for anything we redistribute; use PFR via its own export feature for the small unique bits (GM names); always attribute.

---

## 1. NFL data — nflverse (the spine)

The de-facto open NFL analytics ecosystem. Access via **`nflreadr`** (R), **`nflreadpy`** (Python port), or **`nfl_data_py`** (Python).

- **Draft picks:** every pick since **1980** (`load_draft_picks()`), sourced from PFR but redistributed under CC-BY.
- **Combine:** results by year/position (`load_combine()`).
- **Next Gen Stats:** `load_nextgen_stats()` returns the **public** NGS weekly aggregates (passing/rushing/receiving) — the free path to NGS-derived data (see §5).
- Also: rosters, depth charts, contracts, injuries, trades, snap counts, and full play-by-play (`nflfastR`).
- **License:** the majority of nflverse data is **CC-BY 4.0** (FTN participation data is CC-BY-SA 4.0). The package code is MIT. CC-BY **allows redistribution with attribution** — exactly what an open tool needs. Credit "Data via nflverse."

**Why it matters for us:** this **resolves G-1 at scale.** Instead of scraping PFR for 32 teams of draft history, pull `load_draft_picks()` (redistribution-friendly) and use PFR only for the GM-by-year mapping.

## 2. College data — CFBD + SportsDataverse

- **CollegeFootballData (CFBD)** — `api.collegefootballdata.com`. Recruiting rankings, team/player stats, rosters, rankings, betting lines, more. **Free tier = 1,000 calls/month**; higher tiers via Patreon. Clients: `cfbd` (Python), `cfb.js` (JS), and **`cfbfastR`** (R, part of SportsDataverse).
- **SportsDataverse** — umbrella project unifying `cfbfastR` (college FB), `hoopR`/`wehoop` (basketball), `nflfastR`-style tooling, etc. Useful to know if the "separate future basketball tool" you mentioned ever happens — same ecosystem.
- **Terms:** CFBD is API-key gated with a Patreon support model; explicit redistribution/commercial terms were **not clearly published** in this pass — **confirm before shipping their data**. Likely fine for personal/non-commercial with attribution; verify.

## 3. Athleticism — RAS (Relative Athletic Score)

- **ras.football**, by **Kent Lee Platte** (pen name "MathBomb"). Grades a player's combine/pro-day measurables on a **0–10 scale vs. their position group, back to 1987**. Locks in at draft time.
- **Access:** individual "cards" are free to view and share **with attribution to RAS / MathBomb**; **bulk database download is a premium feature.** Site was noted as having technical issues (loading limited volumes) in this pass.
- **Why it matters:** this is the missing piece for the **Baalke "athletic outlier vs. production" future thread** and for scheme/athletic profiling generally. It's the historical athleticism data PFR pick tables don't carry. Attribution required; bulk access is paid.

## 4. Pro Football Reference — free CSV export confirmed

- Per-table export is **still free**: each exportable table has a **"Share & more" → "Get table as CSV (for Excel)"** (and "Get as Excel Workbook"). **Stathead** ($9/mo) is only needed for *advanced custom queries*, not basic table export.
- **Confirms G-1's manual-export path:** you export the tables you need via their own feature (no bot, no rate-limit evasion), the pipeline parses your local files, and we ship *derived aggregates* with attribution.

## 5. Next Gen Stats & NFL+ — the direct answer

- **NFL+ does NOT grant data/API access.** It's a consumer streaming subscription (live games, condensed replays, and NGS *visualizations* in-app) — there's no data export or developer API tied to it.
- There **is** an official **NGS API** (`docs.ngs.nfl.com`), but it's oriented to **clubs and partners** (onboarding via the NGS support team), not something a retail NFL+ subscriber can call.
- **Practical free path to NGS data:** **nflverse `load_nextgen_stats()`** exposes the *public* NGS aggregates (the same numbers the NFL publishes) for free under CC-BY. That's what we'd use — not a raw NGS feed.
- **Net:** don't count on exporting anything from your NFL+ login. Use nflverse's public NGS aggregates instead.

## 6. Open-source tools to learn from (not necessarily reuse)

Similar projects — study their mechanics; none replace our approach, and licenses vary (check each before borrowing code):

- **rmluck/NFL-Mock-Draft-Simulator** — React + FastAPI; real-time draft, weighted CPU picks, trade evaluation. Closest to our Draft Simulator; worth studying its CPU-pick weighting.
- **lrtico/nflmockdraft**, **JWeesner/NFL-Draft-Simulator** — React mock-draft sims.
- **mattheworres/hootdraft** — web draft board (fantasy) with live board + drag/drop.
- **Big Board Lab** (bigboardlab.com) — closed-source, but the reference for our pairwise-Elo flow (see Spec 01 appendix / VISION §6).
- The **GitHub `nfl-draft` topic** collects more.

## 7. What this changes in our plan

- **G-1 fully answered:** manual PFR CSV export for the subset (confirmed free); **nflverse (CC-BY)** for picks at scale — redistribution-friendly. PFR used only for GM-by-year.
- **New capability unlocked:** nflverse `load_combine()` + **RAS** make the deferred **archetype/athletic-outlier** metrics buildable in a *future* spec — the data exists, it's just out of Spec 02's v1 scope.
- **College expansion path exists:** CFBD/`cfbfastR` if/when we pull in college production or recruiting context.
- **NGS realism:** any "Next Gen"-flavored metric should come from nflverse's public aggregates, not an NFL+ export.

## 8. Open verification items (do before shipping data)

- [ ] Confirm CFBD's redistribution/commercial terms for an open-source app.
- [ ] Confirm RAS attribution wording + whether we need the premium tier for bulk historical athleticism.
- [ ] Re-verify nflverse CC-BY attribution phrasing at integration (`load_draft_picks`, `load_combine`, `load_nextgen_stats`).
- [ ] Decide college scope — do we even need CFBD for v1, or is it Phase 4+?
