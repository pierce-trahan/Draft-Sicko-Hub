# Spec 01 — Pairwise Elo Preference Engine

> **Phase:** 1 (flagship). **Replaces:** `src/components/PlayerRankingMatrix.tsx` (currently a grade-sorted list mislabeled "Scouting Matrix").
> **Owner of this spec:** Claude (design). **Builder:** Gemini 3.6 (platform engineer) → AI Studio (implementation).
> **Reads with:** `docs/VISION.md` §6. This is the buildable expansion of that section. If this spec and VISION.md disagree, fix one on purpose.

---

## 1. What we're building (one paragraph)

Within a **single position group**, the user is shown **two prospects at a time** and picks a preference on a 5-point scale. An **Elo rating system** turns those head-to-head choices into a numerical ranking of that position group. The resulting **preference score is the product** — it reflects the user's gut/subconscious ordering *precisely because they never dragged a rank directly.* We keep and surface that number (Big Board Lab hides it), and we put the preference ranking **next to the user's deliberate grade ranking** so they can see where gut and grades diverge. That divergence view is the core learning payoff.

## 2. User flow

1. User opens **Scouting Matrix** → picks a position (QB, RB, WR, …).
2. App presents a **matchup**: two player cards side by side.
3. User chooses one of five outcomes:
   `Strongly Prefer A · Prefer A · Toss-Up · Prefer B · Strongly Prefer B`.
4. App records the comparison, updates both players' Elo ratings, and serves the **next informative matchup**.
5. A progress/confidence indicator shows how "settled" the position's ranking is.
6. At any time the user can view the **Preference Board** (players ranked by Elo within the position) and the **Gut vs. Grades** comparison.
7. User can **Commit** the preference order to a real board (seed/overwrite), or leave it standalone.

Keyboard support (desktop): `1–5` map to the five outcomes; `←/→` optional. Sessions are resumable — never wipe progress on navigation.

## 3. Rating model (Elo)

Standard Elo, scoped **per position group** (a WR's rating only means something against other WRs — never mix pools).

- **Initial rating:** `1500` for every player in a position on first comparison.
- **Expected score:** `E_A = 1 / (1 + 10^((R_B − R_A) / 400))`, and `E_B = 1 − E_A`.
- **Actual score `S_A`** from the 5-way choice:

  | Choice | `S_A` | `S_B` |
  |---|---|---|
  | Strongly Prefer A | 1.00 | 0.00 |
  | Prefer A | 0.75 | 0.25 |
  | Toss-Up | 0.50 | 0.50 |
  | Prefer B | 0.25 | 0.75 |
  | Strongly Prefer B | 0.00 | 1.00 |

- **Update:** `R_A' = R_A + K · (S_A − E_A)`, `R_B' = R_B + K · (S_B − E_B)`.
- **K-factor (provisional decay for stability):** `K = 32` while a player has `< 10` recorded comparisons, else `K = 16`. (The preference margin is already carried by `S_A`, so K stays constant within a tier.)

> **Note (open item #2):** Elo is confirmed as Big Board Lab's approach and is correct for an *online, one-at-a-time* flow. If we later want a single maximum-likelihood full ranking computed from the whole comparison set, revisit **Bradley–Terry** as an alternative/complement. Not for v1.

## 4. Pair selection (do NOT brute-force all N² pairs)

Goal: converge a position's ranking in as few, as *informative* matchups as possible.

Algorithm for choosing the next pair within the active position:
1. **Coverage floor first:** any player with fewer than `MIN_COMPARISONS = 3` is eligible priority; ensure everyone is seen early.
2. **Informativeness:** prefer pairs whose current ratings are **close** (expected score near 0.5 → outcome is maximally informative).
3. **Uncertainty:** prefer players with **fewer** comparisons (less-settled ratings).
4. **Anti-repeat:** don't reshow the exact same unordered pair until other candidate pairs are exhausted.
5. Combine 2–4 into a weight, e.g. `weight = 1/(1+|R_A−R_B|) · 1/(1+min(nA,nB))`, then sample from the top-weighted candidates (a little randomness avoids deterministic loops).

Stop/"settled" heuristic: a position is **settled** when every player has `≥ TARGET_COMPARISONS` (start `TARGET = 6`) and the last M updates moved ratings by less than a small epsilon. Show this as a % progress + a "settled" badge; never hard-block more comparisons.

## 5. Data model

Add to `src/types.ts` (new interfaces; do not break existing `Player`):

```ts
export type PreferenceOutcome =
  | 'strong_a' | 'slight_a' | 'toss_up' | 'slight_b' | 'strong_b';

export interface PreferenceComparison {
  position: string;         // 'QB', 'WR', ... — the pool this belongs to
  playerAId: string;
  playerBId: string;
  outcome: PreferenceOutcome;
  timestamp: number;
}

export interface PreferenceRating {
  playerId: string;
  position: string;
  rating: number;           // Elo, starts 1500
  comparisons: number;      // count this player has been in
}

// Per-position preference state, keyed by position.
export interface PreferenceState {
  [position: string]: {
    ratings: Record<string, PreferenceRating>;  // by playerId
    history: PreferenceComparison[];
    updatedAt: number;
  };
}
```

**Storage:** new localStorage key `nfl_draft_preferences` (follows the existing `nfl_draft_*` convention). **Include this key in the Data Hub full-backup export/import** (`handleExportFullBackup` / import in `src/App.tsx`) so preference work is portable and survives backup/restore. Do not touch existing keys.

## 6. Outputs & views

**A. The Preference Board (the sacred number).**
Players in the active position ranked by Elo descending. Each row shows: rank, name/school, **preference rating** (the number — surfaced, never hidden), and comparison count / confidence. This is a first-class readout.

**B. Commit to a board.**
An explicit action ("Commit to board…") that writes the current preference order into a chosen board key in `rankings` (existing `saveRankingsToStorage` mechanism) — e.g. `my_board`, a position board, or a new custom board. Separate-by-default; commit only on user action. Never auto-overwrite a board.

**C. Gut vs. Grades (the learning payoff — build this, it's the differentiator).**
Side-by-side for the active position:
- **Preference rank** (Elo order) vs. **Grade rank** (existing `overallGrade` order).
- A per-player **divergence delta** (grade-rank minus preference-rank) with clear up/down highlighting.
- Call out the biggest disagreements: "Your gut ranks _X_ well above where your grades put them," and the inverse. This is the self-audit insight the whole product exists for — make it legible, not buried.

## 7. Component work

- **Replace** `PlayerRankingMatrix.tsx` with the new engine (or rename to `ScoutingMatrix.tsx` and gut the internals — keep the `appMode === 'scouting_matrix'` wiring and the sidebar nav label in `App.tsx` intact).
- Preserve the existing dark, dense, mono-accented visual language (slate + emerald, `font-serif italic` headers, `font-mono` labels). Reuse `RadarChart.tsx` if showing trait shape on the matchup cards.
- Selecting a player name still opens the existing `PlayerProfileModal` via the `onSelectPlayer` prop already passed from `App.tsx`.

## 8. Acceptance criteria

- [ ] Picking outcomes updates both players' Elo per the formulas in §3 (unit-verifiable).
- [ ] Ratings are per-position; pools never mix.
- [ ] Pair selection covers all players quickly and avoids immediate repeats; converges without brute-forcing N².
- [ ] Progress/"settled" indicator reflects comparison coverage.
- [ ] Preference Board shows the numeric rating for every player.
- [ ] "Commit to board" writes into `rankings` only on explicit action.
- [ ] Gut vs. Grades view shows preference-rank, grade-rank, and divergence deltas.
- [ ] State persists in `nfl_draft_preferences` and is included in full-backup export/import.
- [ ] No existing localStorage key renamed; existing modules unaffected.
- [ ] Sessions are resumable; navigation never wipes in-progress comparisons.

## 9. Out of scope for Phase 1 (don't build yet)

Bradley–Terry MLE ranking; cross-position "positional value" normalization; AI-assisted matchup suggestions; sharing preference boards between users. Note them, don't build them.
