# Spec 06 — AI-GM Simulator Behavior

> **Phase:** 3 (optional enhancement). **Extends:** `DraftSimulator.tsx` (CPU pick logic).
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Depends on:** **Spec 02** (GM tendencies) — ✅ **landed in `main`**. **Enhanced by:** **Spec 05** (athletic lean) — ✅ **landed in `main`**.
> Both dependencies are live and ready to consume: `computeGMTendencies` exposes `roundMatrix` (position-by-round), `positionShare`, and `athleticLean`; per-pick athletic scores are in `gmPickAthletics.ts`.
> **Reads with:** `docs/VISION.md` roadmap Phase 3.

---

## 0. What we're building (one paragraph)

Right now the Draft Simulator's CPU teams pick off the **user's board order**. This makes each CPU team pick like the **real GM** by weighting available prospects against that GM's historical tendencies (position-by-round, positional allocation, and — where available — athletic lean) on top of team needs and player value. The result: Baalke's team reaches for a toolsy EDGE, a need-and-value GM takes the clean producer — the sim *feels* like the league instead of a straight best-available crawl. Every CPU pick comes with a short, explainable rationale.

## 1. Why (the philosophy)

A realistic sim is a *teaching tool*: watching a GM-flavored board fall shows the user how team-building philosophy, not just talent, drives the draft. It's the payoff of the GM Profiles data — tendencies become behavior.

## 2. Inputs

- **GM tendencies** from Spec 02 `GMProfile` (position-by-round distribution, positional allocation, college lean).
- **Athletic lean** from Spec 05 (optional; if present, biases toward/away from athletic outliers — the Baalke effect).
- **Team needs** (existing `Team.needs` / `TeamReports` needs data).
- **Player value** (board rank / `overallGrade` / Spec 03 computed grade).

## 3. CPU pick model (`src/utils/gmDraftStrategy.ts`)

For a team on the clock at overall pick `P` (round `R`):

1. **Candidate pool** = undrafted players.
2. **Score each candidate** as a weighted blend:
   - `value` — how high on the board / grade (BPA pressure).
   - `need` — does the team need this position.
   - `gmPositionBias` — this GM's historical propensity to take this position **in round R** (from Spec 02's position-by-round matrix).
   - `gmAthleticBias` — if Spec 05 present, reward athletic-outlier profiles for GMs whose history skews that way.
3. **Probabilistic selection** — pick from the top-weighted candidates with **controlled randomness** (not deterministic BPA) so runs vary and feel real. Expose a "chaos" factor.
4. **Rationale** — emit a short reason: "Reached for high-RAS EDGE (Baalke tendency, R2) over cleaner value."
5. **Fallback** — teams without a profiled GM use the current need + value logic (graceful; no profile required).

Weights are **tunable constants** with sensible defaults; document them. Keep it explainable — no opaque model.

## 4. UI (`DraftSimulator.tsx`)

- CPU picks display their **rationale** (hover/expand), so the user learns *why* the board fell that way.
- Optional **strategy indicator** per team (e.g. "GM lean: EDGE-early, athletic-outlier").
- A **chaos/realism slider** (deterministic-BPA ↔ full GM-flavored variance).
- Preserve existing simulator features (trade values, analytics dashboard, grade summary) — this changes *how CPU teams choose*, nothing else.

## 5. Acceptance criteria

- [ ] `gmDraftStrategy.ts` scores candidates from value + need + GM position-by-round bias (+ athletic bias when Spec 05 present).
- [ ] Probabilistic selection with a tunable chaos factor; runs vary.
- [ ] Each CPU pick shows an explainable rationale.
- [ ] Teams without a profiled GM fall back cleanly to need+value.
- [ ] Validates on the subset: a Baalke-controlled team visibly skews toward athletic/positional tendencies vs. a Roseman-controlled team.
- [ ] Existing simulator features (trades, analytics, grades) unaffected.

## 6. Out of scope (note, don't build)

Trade-proposal AI / draft-day trade tendencies; full 32-GM coverage before Spec 02 scales past the subset; contract/cap-aware team-building; multi-year franchise mode.

## 7. Open items

- **S-1 — Weight defaults & chaos range.** Tune so it feels real without being random.
- **S-2 — Coverage.** Only profiled GMs behave in-character; the rest use fallback until Spec 02 scales.
- **S-3 — Optional Gemini narration.** The existing server-side Gemini call could narrate picks; deterministic scoring stays the source of truth.

---

## Build context — repo files for the Gemini builder

> Gemini/AI Studio can't see the repo. Fetch these raw files and paste them into the build
> session so the code matches real signatures and conventions. All URLs point to `main`.
> Workflow roles: [`gemini-3.6-platform-engineer.md`](https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/workflow/gemini-3.6-platform-engineer.md) ·
> [`sync-from-repo.md`](https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/workflow/sync-from-repo.md)

**New file to create:** `src/utils/gmDraftStrategy.ts`. **File to modify:** `src/components/DraftSimulator.tsx`.

| File | Why the builder needs it | Raw URL |
|------|--------------------------|---------|
| This spec | The build target | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/specs/06-ai-gm-simulator-behavior.md |
| `src/components/DraftSimulator.tsx` | The file to modify — current CPU pick logic, trades, analytics, grade summary (preserve all) | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/components/DraftSimulator.tsx |
| `src/utils/gmTendencies.ts` | `computeGMTendencies` → `roundMatrix` (position-by-round bias), `positionShare`, `athleticLean` | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/gmTendencies.ts |
| `src/data/gmData.ts` | `GM_PROFILES` — the profiled GMs (Roseman/Schoen/Baalke) and their picks | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/gmData.ts |
| `src/data/gmPickAthletics.ts` | Per-pick athletic scores (Spec 05) for the `gmAthleticBias` term | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/gmPickAthletics.ts |
| `src/utils/athleticOutlier.ts` | Athletic score/outlier helpers if biasing on prospect athleticism | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/athleticOutlier.ts |
| `src/data/teams.ts` | `NFL_TEAMS` (`Team.needs`), `SCHEMES` — the need signal and team→GM mapping | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/teams.ts |
| `src/utils/traitGrading.ts` | `computePositionGrade` — a value signal alongside board rank / `overallGrade` | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/traitGrading.ts |
| `src/types.ts` | `Player`, `Team`, `GMProfile`, `GMTendencies` (incl. `athleticLean`), `AthleticProfile` | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/types.ts |
| `docs/VISION.md` | Phase 3 "why" — the teaching-tool framing | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/VISION.md |

**Note on GM→team mapping:** only Roseman (PHI), Schoen (NYG), and Baalke (SF/JAX) are profiled — those
CPU teams draft in-character; every other team must fall back cleanly to the existing need+value logic.
