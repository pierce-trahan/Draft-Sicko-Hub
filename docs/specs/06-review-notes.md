# Spec 06 — Build Review & Fix List

> **✅ RESOLVED — Spec 06 integrated on the branch (pending final merge).** Pass 2's `gmDraftStrategy.ts` util was correct (F-4→F-9 all implemented). Pass 2's `DraftSimulator.tsx` was again rejected — it rewrote the whole JSX `return` and re-derived the child-component calls from memory, breaking all three: `<X>` used but not imported; `DraftAnalyticsDashboard`/`DraftValueCalculator`/`DraftGradeSummaryModal` invoked with invented props (real contracts are 8-prop / 2-prop / 9-prop respectively); rounds options silently changed 1–5 → 1/2/3/7; entire layout restructured. **Resolution:** rather than a Pass 3 round-trip, Claude landed the correct util as-is and applied the **surgical** integration to the real `DraftSimulator.tsx` — 4 anchors only (imports + `chaosFactor` state; `simulateNextPick`/`simulateInstantDraft` call `selectCpuPick`; chaos slider in setup; GM indicator on the clock card; rationale + `gmName` in the draft-log row). File stayed 2,185 lines (the −55 is the two inline heuristic loops collapsing into the util); `tsc --noEmit` **clean** and `npm run build` **green**; every existing feature (trades, export, analytics, grade modal, user-pick UI, phase views) preserved. Kept below as the audit record.
>
> **Original Pass 1 verdict — do not apply.** The new util (`gmDraftStrategy.ts`) is a good ~80% skeleton and compiles against real signatures. The `DraftSimulator.tsx` deliverable is a **blind full-file rewrite** that amputates most of a 2,240-line component (Gemini shipped ~715 lines). This is the **same failure mode as Spec 03 Pass 1** — reconstructing a file it couldn't see. Root cause: the real `DraftSimulator.tsx` was not fetched. Fixed going forward by the **Engineering Handoff URL Rule** (workflow README / root `CLAUDE.md`); the Pass 2 handoff below supplies every file as a raw URL.

---

## Acceptance-criteria scorecard (Spec 06 §5)

| Criterion | Status |
|---|---|
| `gmDraftStrategy.ts` scores value + need + GM position-by-round bias (+ athletic) | ✅ Present (but see F-4/F-5 on the athletic term) |
| Probabilistic selection with tunable chaos factor; runs vary | ⚠️ Noise-then-argmax; deterministic at chaos 0 — acceptable, tune (F-8/F-9) |
| Each CPU pick shows an explainable rationale | ✅ Present and readable |
| Teams without a profiled GM fall back cleanly to need+value | ⚠️ Falls back, but **lost** the existing scheme-fit + positional-premium terms (F-6) |
| Baalke team **visibly skews** athletic vs. Roseman | ❌ Won't — athletic term can't discriminate (F-5); + hardcoded per-GM (F-4) |
| Existing simulator features (trades, analytics, grades) unaffected | ❌ **Deleted** by the rewrite (F-1/F-2/F-3) |

**Signatures Gemini got right (keep these):** `roundMatrix.{round1,day2,day3}` bucket usage matches `gmTendencies.ts`; `GM_PROFILES`, `computeGMTendencies(profile, teamId)`, and `traits.{athleticism,production,footballIQ}` all real. No import-drift crashes in the util.

---

## CRITICAL — what went wrong (the component)

Gemini reproduced `DraftSimulator.tsx` as a whole new file. The real file is **2,240 lines**; the deliverable is ~715 with the JSX body truncated after the live draft-log table. Applying it silently deletes:

- **F-1 — Trade desk** (`renderTradeDesk`, ~400 lines: OTC valuation, force-trade, trade history), **export modal** + `generateMockDraftText`/`generateCondensedMockDraftText`/copy/download, **AI expert commentary** (`generateExpertCommentary`), **team draft grades** (`calculateTeamDraftGrades`) — all gone from the render.
- **F-2 — The entire user-controlled pick UI.** `simulateNextPick` still pauses on the user's team and `executeUserPick` still exists, but nothing in the returned JSX calls it (the available-players list, search/filter, and pick button are gone; `isUserOnClock` is computed and unused). Net: choose a franchise → the sim soft-locks, paused forever with no way to draft.
- **F-3 — Grade summary modal** never renders. The completion effect fires `setIsGradeModalOpen(true)` but `DraftGradeSummaryModal` isn't in the JSX (imported, never used).

**Fix:** `DraftSimulator.tsx` must be **edited surgically, not regenerated.** The only changes it needs are (a) import + call the CPU engine inside `simulateNextPick` and `simulateInstantDraft`, replacing the inline heuristic; (b) add the chaos slider + GM-strategy indicator to the setup/on-clock UI; (c) add the per-pick rationale + `gmName` to the existing draft-log row. Nothing else in the component changes.

---

## Design fixes (the util — `gmDraftStrategy.ts`)

**F-4 — Make athletic bias data-derived; drop the per-GM `if`-ladder.** Pass 1 hardcodes `if (gmProfile.id === 'trent-baalke') … else if ('howie-roseman') …`. This contradicts the spec's data-derived thesis and **doesn't generalize** — when Spec 02 scales past the 3-GM subset, no other GM gets athletic character. Use `computeGMTendencies(...).athleticLean` (already returns `avgScore`, `elitePct`) as the bias *magnitude*, applied to the prospect's athletic signal. No GM slugs in the scoring.

**F-5 — Athletic term can't discriminate; normalize relative to the pool.** Prospect `traits.athleticism` clusters 90–99 at the top of the board, so `athleticism/99*100` ≈ a near-constant ~95–100 for everyone, and the rationale threshold `athleticism >= 85` fires on nearly every pick. Use a **pool-relative** signal — the candidate's **percentile of `traits.athleticism` vs. the available pool** (0..1) — not an absolute `/99`. Combine with F-4: `gmAthleticBias = poolPercentile(prospect) × athleticLeanStrength(gm)`, where `athleticLeanStrength` scales from `tendencies.athleticLean.elitePct`/`avgScore` (0 when a GM has no athletic lean or no `athleticLean` data). (**S-4 DECIDED — option (a):** bias on pool-relative `traits.athleticism` this pass — no new data. Prospects currently carry only `athleticProfile.measurables`; populating `athleticProfile.athleticScore`/`percentiles` per Spec 05 and biasing on *that* is a small later follow-up, not this pass.)

**F-6 — Keep the fallback as smart as it was.** The pre-existing non-GM heuristic added scheme-fit (`+4` when `SCHEMES` favors the position) and positional-premium weighting (QB/EDGE/OT/CB/WR). Pass 1's fallback is only `value*0.55 + need*0.45` — so all 29 non-profiled teams got *dumber* than today. Restore scheme-fit + premium in the fallback path.

**F-7 — Hoist `computeGMTendencies` out of the candidate loop.** It's called per-candidate inside `evaluateProspectForTeam`, so it re-aggregates the GM's picks for every prospect for every pick (hundreds of thousands of times in a 7-round instant sim). Compute it **once per team-on-clock** and pass it in.

**F-8 — `gmPosBias = roundPickCount * 35` is coarse and sample-biased.** It's a raw count over ~13 career picks, capped at 100; GMs with few day-2/3 picks (e.g. Baalke) get ~0 bias off round 1, so flavor only shows in R1. Normalize to a share/propensity within the round bucket. (S-1 tuning.)

**F-9 — Chaos coupling.** Noise is `±chaos*15` added to raw scores then argmax — fine and deterministic at chaos 0, but coupled to the raw score scale so low chaos barely reorders. Tune the range so mid-slider produces visible-but-sane variance. (S-1.)

---

## Open decisions for the user (before Pass 2)

- **S-4 — Athletic signal source. ✅ DECIDED — (a):** bias on **pool-relative `traits.athleticism`** this pass (no new data); unblocks Spec 06. Option (b) — populate prospect `athleticProfile.athleticScore`/`percentiles` per Spec 05 and bias on that — is a small later follow-up, not Pass 2.
- **S-5 — Baalke athletic-skew calibration. ✅ DECIDED — no nudging.** With real data, Baalke's athletic lean is weak (matched combine avg ~5.7 → `athleticLeanStrength` ≈ 0.14; the "athletic outlier" rationale, threshold 0.3, won't fire for him). We deliberately do **not** lower thresholds or rebaseline to force the "athletic gambler" narrative. His differentiation comes honestly from **position-share bias** (defensive trenches). The unbiased trend is the intended output — the whole point of the tool (VISION §7 + §11 D-2; Spec 02 §A6). This is a validation of the design, not a bug to tune away.

## Definition of done (Pass 2)

- [ ] `DraftSimulator.tsx` changed **only** in `simulateNextPick`, `simulateInstantDraft`, the setup UI (slider + indicator), and the draft-log row (rationale). Every other feature — trades, export, analytics, grades, user-pick UI — byte-for-byte preserved.
- [ ] `npm run lint` (`tsc --noEmit`) + `npm run build` green; no unused imports.
- [ ] Athletic bias = pool-relative `traits.athleticism` percentile × `athleticLean` strength (S-4a); no GM slugs in scoring.
- [ ] Fallback keeps scheme-fit + positional-premium.
- [ ] `computeGMTendencies` computed once per pick, not per candidate.
- [ ] Manual check: a Baalke-controlled team visibly skews vs. a Roseman-controlled team across a few R1–R3 runs.

---

## Build context — repo files for the Gemini Pass 2 handoff

> Per the **Engineering Handoff URL Rule**: every file below is given as a raw URL so Gemini reads the real thing and never reconstructs it. URLs point to `main` — **they resolve once this branch merges**; if handing off before merge, swap `main` → `claude/audit-chatgpt-spec-response-8rw2f7`.

| File | Why Pass 2 needs it | Raw URL |
|------|--------------------|---------|
| This review | The fix list + definition of done | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/specs/06-review-notes.md |
| Spec 06 | The build target | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/specs/06-ai-gm-simulator-behavior.md |
| `src/components/DraftSimulator.tsx` | **The real 2,240-line file to EDIT surgically** — the whole point | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/components/DraftSimulator.tsx |
| `src/utils/gmTendencies.ts` | `computeGMTendencies` → `roundMatrix`, `positionShare`, `athleticLean` | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/gmTendencies.ts |
| `src/data/gmData.ts` | `GM_PROFILES` (Roseman/Schoen/Baalke) + picks | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/gmData.ts |
| `src/data/gmPickAthletics.ts` | Per-pick athletic scores behind `athleticLean` | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/gmPickAthletics.ts |
| `src/utils/athleticOutlier.ts` | Athletic helpers if biasing on prospect athleticism | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/athleticOutlier.ts |
| `src/data/teams.ts` | `NFL_TEAMS` (`Team.needs`, `currentScheme`), `SCHEMES` — need + scheme-fit + team→GM | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/teams.ts |
| `src/types.ts` | `Player`, `PlayerTraits`, `Team`, `GMProfile`, `GMTendencies`, `AthleticProfile` | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/types.ts |
| `docs/VISION.md` | Phase 3 "why" — tendencies become behavior | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/VISION.md |

**Paste-ready Pass 2 brief.** URLs below are the **feature-branch** ref (`claude/audit-chatgpt-spec-response-8rw2f7`) so they resolve for a **pre-merge hand-off** — which is how this one goes out. After this branch merges, the `main` URLs in the table above are the canonical record.

```
TASK — Spec 06 AI-GM Simulator, PASS 2 (corrections). Your Pass 1 was reviewed; see the
review notes. Read every file below from its URL before writing — do NOT reconstruct any
file from memory. Your Pass 1 DraftSimulator.tsx was rejected because it regenerated a
2,240-line file as a ~715-line stub and deleted trades, analytics, grades, and the user-pick
UI.

HARD REQUIREMENT: EDIT src/components/DraftSimulator.tsx SURGICALLY. Change ONLY:
  - simulateNextPick + simulateInstantDraft  (call the CPU engine instead of the inline heuristic)
  - the setup UI (add the chaos slider + GM-strategy indicator)
  - the draft-log row (show the rationale + gmName)
Everything else in that file — trade desk, export modal, analytics, grade modal, user-pick
UI, AI commentary — must be preserved byte-for-byte.

Also apply util fixes F-4 through F-9 from the review notes:
  - F-4: athletic bias is DATA-DERIVED from tendencies.athleticLean — no per-GM-id if-ladder.
  - F-5 (S-4 decision = a): athletic signal is the candidate's PERCENTILE of traits.athleticism
    vs. the available pool (0..1), times an athleticLean strength (0 when the GM has no lean).
    Do NOT normalize as athleticism/99. Do NOT populate athleticProfile.athleticScore this pass.
  - F-6: keep scheme-fit (+SCHEMES) and positional-premium (QB/EDGE/OT/CB/WR) in the fallback path.
  - F-7: compute computeGMTendencies ONCE per team-on-clock, not per candidate.
  - F-8/F-9: normalize gmPosBias to a share (not raw count*35); tune chaos so mid-slider varies sanely.
Carry forward your Pass 1 gmDraftStrategy.ts (paste it back in) and correct it — do NOT reuse
your Pass 1 DraftSimulator.tsx.

Read these (raw URLs — read, don't predict):
- 06-review-notes.md   https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/docs/specs/06-review-notes.md
- 06 spec              https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/docs/specs/06-ai-gm-simulator-behavior.md
- DraftSimulator.tsx   https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/components/DraftSimulator.tsx   (EDIT this real file)
- gmTendencies.ts      https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/utils/gmTendencies.ts
- gmData.ts            https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/data/gmData.ts
- gmPickAthletics.ts   https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/data/gmPickAthletics.ts
- athleticOutlier.ts   https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/utils/athleticOutlier.ts
- teams.ts             https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/data/teams.ts
- types.ts             https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/src/types.ts
- VISION.md            https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/audit-chatgpt-spec-response-8rw2f7/docs/VISION.md

If any URL doesn't load (e.g. private repo), tell me and I'll paste the file — do not proceed
on a reconstructed version.
```
