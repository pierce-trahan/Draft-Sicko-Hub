# Spec 03 Foundation — NOW LANDED (reference for Gemini)

**Status:** ✅ The trait-grading foundation that Spec 03 (and Spec 04) depend on has been
**authored, committed, and verified** in the repo. `tsc --noEmit` passes with **0 errors**, and a
contract-check mirroring every pass-2 component call site typechecks clean.

**Why this doc exists:** Gemini can only emit text, not write repo files — so the "foundation" it
referenced never existed on disk. It has now been built here. **Gemini: do not re-emit these files.
Import from them as-is.** Their real source is at the URLs below.

**Branch:** `claude/gemini-specs-02-04-audit-maj9k4` · **Commit:** `b94da05`

---

## 1. File locations (read these — they are the source of truth)

| File | View (blob) | Raw (fetch this) |
|------|-------------|------------------|
| `src/types.ts` | https://github.com/pierce-trahan/Draft-Sicko-Hub/blob/claude/gemini-specs-02-04-audit-maj9k4/src/types.ts | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/gemini-specs-02-04-audit-maj9k4/src/types.ts |
| `src/data/traitSchemas.ts` | https://github.com/pierce-trahan/Draft-Sicko-Hub/blob/claude/gemini-specs-02-04-audit-maj9k4/src/data/traitSchemas.ts | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/gemini-specs-02-04-audit-maj9k4/src/data/traitSchemas.ts |
| `src/utils/traitGrading.ts` | https://github.com/pierce-trahan/Draft-Sicko-Hub/blob/claude/gemini-specs-02-04-audit-maj9k4/src/utils/traitGrading.ts | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/claude/gemini-specs-02-04-audit-maj9k4/src/utils/traitGrading.ts |

---

## 2. Exact API contract (what your components may import)

### `src/types.ts`
`Player` now has one new **optional** field (nothing else changed):
```ts
positionTraits?: Record<string, number>; // sub-trait key -> 50..99
```

### `src/utils/traitGrading.ts` — import these
```ts
import {
  getSchema,             // (position: string | undefined) => PositionTraitDef[]  (never empty; FLEX fallback)
  pillarRollup,          // (player) => PlayerTraits   (ALWAYS all 5 pillar keys)
  computePositionGrade,  // (player) => number         (50..99)
  topTraits,             // (player, n=3) => ScoredTrait[]  (highest value first)
  bottomTraits,          // (player, n=3) => ScoredTrait[]  (lowest value first)
  getWeightBadgeInfo,    // (weight: number) => { isKey: boolean; percentage: number }
} from '../utils/traitGrading';
```

Shapes:
```ts
interface PositionTraitDef { key: string; label: string; pillar: keyof PlayerTraits; weight: number; }
interface ScoredTrait      { key: string; label: string; pillar: keyof PlayerTraits; value: number; weight: number; }
```

- `pillar` is always one of `athleticism | technique | production | footballIQ | sizeAndFrame`
  (the only keys on `PlayerTraits`), so `player.traits[def.pillar]` is always valid.
- Fallback rule (single source of truth): a sub-trait resolves to
  `positionTraits[key] ?? traits[pillar] ?? 70`. **Use `70` as the inline fallback** anywhere you
  read a sub-trait directly, to match `DEFAULT_TRAIT_SCORE`.
- `getWeightBadgeInfo(weight).isKey` is `true` when `weight >= 0.16`.

Your pass-2 components already consume exactly this API — no changes needed on your side beyond
keeping these imports.

---

## 3. Real sub-trait keys per position (use these verbatim)

These are the **only** valid `positionTraits` keys. When you seed `positionTraits` on prospects, or
(for Spec 04) map role rewarded-traits, use these exact keys — anything else silently falls back to
the pillar value.

- **QB:** `arm_talent, accuracy_short, accuracy_deep, pocket_processing, mobility_creation, decision_making, production_efficiency`
- **RB:** `vision_patience, contact_balance, burst_acceleration, elusiveness, receiving_ability, pass_protection, production_volume`
- **WR:** `release_vs_press, route_running, hands_catching, separation_quickness, deep_speed, yac_ability, production_volume`
- **TE:** `inline_blocking, route_running, hands_catching, contested_catch, athleticism_seam, yac_ability, production_volume`
- **OT:** `pass_set_footwork, anchor_strength, hand_technique, lateral_agility, run_block_power, second_level_climb, iq_recognition`
- **IOL:** `drive_block_power, anchor_vs_bull, hand_technique, pull_mobility, pass_set_balance, iq_recognition, grip_finish`
- **EDGE:** `first_step_getoff, bend_flexibility, pass_rush_moves, power_conversion, run_defense_setedge, motor_pursuit, production_pressures`
- **DT:** `first_step_quickness, anchor_vs_double, pass_rush_power, hand_technique, gap_discipline, pursuit_range, production_disruption`
- **LB:** `range_sideline, tackling_form, coverage_zone, coverage_man, run_diagnosis, blitz_ability, production_tackles`
- **CB:** `man_coverage, press_technique, hip_fluidity, recovery_speed, ball_skills, zone_awareness, run_support_tackling`
- **S:** `range_deep, instincts_processing, tackling_form, run_support_trigger, coverage_versatility, ball_skills, physicality_frame`
- **FLEX:** `athletic_explosion, versatility_iq, technique_refinement, frame_size, production_impact, special_teams_value`

---

## 4. What this unblocks / next steps for Gemini

1. **Spec 03 pass 3 is now compilable** — your pass-2 `RadarChart.tsx`, `PlayerProfileModal.tsx`,
   and `PlayerComparer.tsx` will type-check against this foundation with no edits. If you re-emit
   them, keep the imports exactly as in pass 2.
2. **Spec 04 must be reworked to these keys.** The pass-1 `ROLE_CATALOG` used invented trait keys
   (`pass_rush_getoff`, `bend_flexibility`, …) that don't match §3. Rebuild each role's
   `rewardedTraits[].traitKey` from the real keys above (e.g. EDGE roles → `first_step_getoff`,
   `bend_flexibility` **exists**, `pass_rush_moves`, `power_conversion`, …). Also remap Spec 04's
   scheme IDs to the real `SCHEMES` ids: `westcoast, spread, zoneblock, gapblock, 34defense,
   43defense, pressman, quarters` (your `defense_34`/`offense_zone` values match none).
3. **Design note (not a bug):** the schema weights, sub-trait choices, and the 0.16 "key" threshold
   are reasonable defaults chosen here — the user can tune them later. If you want different
   sub-traits, propose them as an edit to `traitSchemas.ts`, not as new invented keys in a consumer.
