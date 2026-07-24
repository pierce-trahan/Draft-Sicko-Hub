# Formation-Trends Data — Audit & Decisions

> **What this is:** an audit of the formation-trends data already in the build, plus the decisions made about it. Feeds **Spec 04 (Positional Usage & Projection)**, which consumes this data.
> **Status:** decisions recorded; no code changed yet. Apply when the formation data is next touched (naturally alongside Spec 04).

---

## 1. Where it lives

- **Schema + data:** `src/data/coachesData.ts` — the `FormationTrend` interface, the `PlayerArchetype` interface, and the `FORMATION_TRENDS` array (**5 entries**).
- **Consumer:** `src/components/CoachingReports.tsx` — renders the list (trend color-coding + usage bar) and a hover-to-inspect detail panel (EPA, run/pass, key attributes, preferred archetypes).

## 2. Schema — the core finding

`FormationTrend` fields: `name`, `personnel`, `leagueUsage`, `runPassRatio`, `epaPerPlay` (number), `trend` (`rising|stable|declining`), `description`, `advantage`, `primaryUsers[]`, `preferredArchetypes[]` (role/archetype/attributes/examples), `keyAttributes[]`.

**The finding:** almost everything quantitative is stored as **prose strings**, not numbers:
- `leagueUsage: "61.8% (NFL Baseline standard)"` — number + label + aside in one string.
- `runPassRatio: "34% Run / 66% Pass"` — two numbers in text.
- `keyAttributes: ["Short-Area Agility (Agility/COD >= 90)", …]` — thresholds in English.

Only `epaPerPlay` and `trend` are machine-usable today.

## 3. Data inventory

| Formation | Usage | Run/Pass | EPA/play | Trend | Primary users |
|---|---|---|---|---|---|
| 11 Personnel | 61.8% | 34/66 | +0.05 | stable | McVay, Reid, O'Connell |
| 12 Personnel | 21.4% | 51/49 | +0.08 | rising | Campbell, Reid, LaFleur |
| 21 Personnel | 7.2% | 58/42 | +0.12 | stable | Shanahan, McDaniel |
| 13 Personnel | 4.5% | 74/26 | +0.02 | rising | J./J. Harbaugh |
| Spread/Empty | 5.1% | 8/92 | +0.04 | declining | Reid, Taylor, Payton |

Each entry carries 3 `preferredArchetypes` (with real-player examples) and 3 `keyAttributes`.

## 4. Accuracy & provenance

Football-literate and directionally plausible, but **hand-authored and unsourced.** 11/12/13 personnel usage is realistic; 21 personnel runs a bit hot (real league-wide fullback usage is closer to 3–5%). No season, no source, no citation — notable given the app ships a `CitedSources` component and a "contextualize honestly" ethos.

## 5. Rendering — one fragile spot

The usage bar uses `width: ${parseFloat(f.leagueUsage) * 1.3}%`. It works only because the % is the first number in the string, then multiplies by a magic `1.3` for visual fullness. Reword `leagueUsage` to not lead with the number and the bar silently breaks. (Resolved by Decision F-1 below.)

## 6. Relationship to Spec 04

Spec 04 (Positional Usage & Projection) explicitly consumes `FormationTrend.preferredArchetypes` and `keyAttributes` to place a prospect in a real formation spot. In their current **prose** form, Spec 04 can't compute against them. Decision F-2 (below) normalizes them so the projection math can use them.

---

## 7. Decisions

### F-1 — Split quantitative fields out of prose · ✅ ACCEPTED
Add clean numeric fields (`usagePct: number`, `runPct`/`passPct: number`) alongside the prose label. Removes the `parseFloat × 1.3` hack and makes the data chartable. **This split is also what makes the F-3 upgrade painless later** (the UI reads a number, not a sentence).

### F-2 — Structure `keyAttributes` + link `preferredArchetypes` · ✅ ACCEPTED
Turn `keyAttributes` from prose (`"Agility/COD >= 90"`) into structured `{ trait, op, value }`, and link `preferredArchetypes` to the app's real position groups. This is what lets **Spec 04** actually consume formation data for projections. (Cross-referenced in Spec 04.)

### F-3 — Source of the numbers: illustrative vs. data-derived · ✅ DECIDED — **Hybrid: illustrative now, swap-ready later**
**This decision is about where the numbers come from, NOT how the UI looks — the clean UI stays identical either way.**
- **Illustrative (today):** numbers are hand-typed, plausible but unsourced and frozen in time.
- **Data-derived (option):** numbers counted from real play-by-play (**nflverse `load_participation()` tags every play's `offense_personnel`/`defense_personnel`**), giving real, dated, sourced usage % and EPA — behind the *same* clean card.
- **DECISION:** keep the current hand-typed numbers and the exact UI for now (don't build a pipeline yet). Because F-1 splits numbers into clean fields, a future swap is trivial. When the nflverse pipeline gets built anyway (GM-profile work, Specs 02/05), formation usage/EPA can be refreshed from the same source with **zero UI change**.
- **One honesty tweak now:** label the current numbers as *illustrative/approx.* (a small tag) so we never imply measured precision we don't have — consistent with the cited-sources ethos.

### F-4 — Add defensive formations/fronts · ✅ ACCEPTED
Today the data is offense-only, even though the app has defensive `SCHEMES`. Add defensive fronts/formations to match the offensive coverage. (nflverse also carries `defense_personnel`, so F-3's data-derived path covers this too when built.)

---

## 8. Not doing now (noted, not scoped)

Expanding beyond the 5 groupings (10/20/22 personnel, pistol, wildcat); cross-linking to each `Coach`'s `personnelPreferences`/`keyPlayType` and to `SCHEMES` to remove conceptual duplication. Revisit if/when useful.

## 9. Why the F-3 framing matters (plain-English, preserved)

The choice is **not** "clean illustrative UI vs. an ugly data thing." It's **"keep guessing the numbers forever"** vs. **"measure them from real games someday, behind the same clean UI."** A formation card looks identical whether `61.8%` was typed by hand or counted from the 2025 season — the difference is only whether it's real, dated, and sourced. The hybrid keeps it clean today and upgrades trustworthiness later without redesigning anything.
