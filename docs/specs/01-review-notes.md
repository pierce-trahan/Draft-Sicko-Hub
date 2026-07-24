# Spec 01 — Build Review & Fix List

> **Reviewer:** Claude (design/audit). **Build:** Gemini 3.6 first pass of the Pairwise Elo Preference Engine.
> **RESOLVED — Spec 01 LANDED.** All blockers/significant/minors below were fixed in the revision; a further commit-fallback fix (grade-sorted base order) and the `getDraftRange` extraction were applied on landing. Verified: `tsc --noEmit` clean + `vite build`/esbuild bundle succeed. Kept as the audit record.
>
> **Original verdict:** Core engine is excellent; **revise before merge** — 3 blockers, 1 significant, 2 minor, all in the *integration layer* (not the Elo math).
> **How to use:** items 2–4 + minors → hand to **Gemini** (platform engineer). Item 1 (the surgical `App.tsx` edit) → **AI Studio implementation engineer**, applied exactly as written here — do **not** use Gemini's proposed `App.tsx` rewrite.

---

## Acceptance-criteria scorecard (Spec 01 §8)

| Criterion | Status |
|---|---|
| Elo math per formulas | ✅ Pass (matches the Python harness) |
| Per-position pools | ✅ Pass |
| Pair selection: coverage + anti-repeat, no brute force | ✅ Pass |
| Progress / "settled" indicator | ✅ Pass |
| Preference Board surfaces the number | ✅ Pass |
| Gut vs. Grades view | ✅ Pass |
| Commit to board (explicit only) | ⚠️ Partial → Fix 4 |
| Persists in `nfl_draft_preferences` + full-backup | ⚠️ Partial → Fix 1 |
| No existing key renamed; existing modules unaffected | ❌ Fail as written → Fixes 1 & 2 |
| Sessions resumable | ✅ Pass |

**Keep as-is (good work):** all of `src/utils/elo.ts` — correct Elo with per-player K-decay, coverage-boosted weighted pair selection, and undo-by-replay (rebuild from history = zero drift). The three-view structure and the sleeper/skeptic framing are on-spec.

---

## BLOCKER 1 — `App.tsx` Data Hub: apply a surgical edit, NOT Gemini's rewrite

Gemini proposed a new `handleExportFullBackup`/`handleImportFullBackup` with schema `{version:1, exportedAt, rankings, customBoards, preferences}`. **Do not use it** — it drops `players`, removes the `type:"full_backup"` tag the importer keys on, and adds a `window.location.reload()`. That regresses draft-class backups and import type-detection.

**Do this instead — two tiny additions to the EXISTING functions:**

In the existing `handleExportFullBackup`, add the `preferences` line to the object:
```ts
const exportData = {
  version: "1.0",
  type: "full_backup",
  players,
  rankings,
  customBoards,
  preferences: JSON.parse(localStorage.getItem('nfl_draft_preferences') || 'null'), // ADD
};
```

In the existing `handleImportJsonFile`, inside the current `full_backup` branch, add one restore line:
```ts
else if (json.type === "full_backup" && Array.isArray(json.players) && json.rankings) {
  savePlayersToStorage(json.players);
  saveRankingsToStorage(json.rankings);
  if (Array.isArray(json.customBoards)) setCustomBoards(json.customBoards);
  if (json.preferences) localStorage.setItem('nfl_draft_preferences', JSON.stringify(json.preferences)); // ADD
  setImportStatus({ /* unchanged */ });
}
```
Nothing else in `App.tsx`'s Data Hub changes. (The Matrix reads `nfl_draft_preferences` from storage on mount, so a restored backup shows after remount — acceptable.)

---

## BLOCKER 2 — Prop contract mismatch (won't compile / won't wire)

The component expects `{ prospects, onSelectPlayer:(id:string)=>void, activeBoardId }`. `App.tsx` renders it as `players={players} onSelectPlayer={setSelectedPlayer}` where `setSelectedPlayer` expects a **`Player`**, and passes no board prop. As written: wrong prop name, wrong callback type (component passes `player.id` → would set `selectedPlayer` to a string and break `PlayerProfileModal`), and `activeBoardId` defaults to the non-existent `'default'` board.

**Fix in the component — match the existing contract:**
```ts
interface PlayerRankingMatrixProps {
  players: Player[];                                   // was: prospects
  onSelectPlayer: (player: Player) => void;            // was: (id: string) => void
  activeBoardKey: string;                              // was: activeBoardId
  rankings: Record<string, string[]>;                 // NEW (for commit)
  onCommitToBoard: (boardKey: string, orderedIds: string[]) => void; // NEW
}
```
- Rename every internal `prospects` → `players`.
- Every `onSelectPlayer(player.id)` → `onSelectPlayer(player)` (and in the table, `onSelectPlayer(item.player)`).
- In `ProspectMatchupCard`, change its `onSelectPlayer` prop type to `(player: Player) => void` and call `onSelectPlayer(player)`.

**And update the `App.tsx` render call (implementation engineer):**
```tsx
{appMode === 'scouting_matrix' && (
  <PlayerRankingMatrix
    players={players}
    onSelectPlayer={setSelectedPlayer}
    activeBoardKey={activeBoardKey}
    rankings={rankings}
    onCommitToBoard={(boardKey, orderedIds) =>
      saveRankingsToStorage({ ...rankings, [boardKey]: orderedIds })
    }
  />
)}
```

---

## BLOCKER 3 — TypeScript errors (`npm run lint` = `tsc --noEmit` fails)

**(a) `player.class` does not exist on `Player`.** The type has `year`, not `class`.
- Replace `item.player.class || item.player.year || 'SR'` → `item.player.year || 'SR'`.

**(b) `player.traits` is an OBJECT, not an array.** `Player.traits` is `PlayerTraits { athleticism, technique, production, footballIQ, sizeAndFrame }`. The `Array.isArray(player.traits)` block is always false (traits never render) and the `t.name`/`t.score` shape doesn't exist.
- Replace that block in `ProspectMatchupCard` with the real pillars:
```tsx
{player.traits && (
  <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
      Trait Pillars
    </span>
    <div className="flex flex-wrap gap-1.5">
      {(['athleticism','technique','production','footballIQ','sizeAndFrame'] as const).map((k) => (
        <span key={k} className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[11px] rounded">
          {k.slice(0,3).toUpperCase()}: {player.traits[k]}
        </span>
      ))}
    </div>
  </div>
)}
```

---

## SIGNIFICANT 4 — Commit-to-board hits the wrong board and bypasses app state

Current `handleCommitToBoard` writes `nfl_draft_rankings['default']` directly via `localStorage`. `'default'` is a board key nothing in the app reads (real keys: `league`, `my_board`, `pos_QB`, `team_GB`, `custom_cb_…`), and the direct write means App's in-memory `rankings` won't update until reload.

**Fix:** use the new props from Fix 2. Rework `handleCommitToBoard` to:
- Sort the position's players by Elo → `prefOrderIds`.
- `const currentBoardList = rankings[activeBoardKey] || players.map(p => p.id);`
- Keep the existing merge logic (replace the position's slots in order; append any missing).
- **Call `onCommitToBoard(activeBoardKey, updatedBoardList)`** instead of touching `localStorage`.
- In the modal, show `activeBoardKey` as the target label (not `'default'`).

This routes through App's `saveRankingsToStorage` (updates state *and* storage) and targets the real active board.

---

## MINOR

**5 — Position constant convention.** The hardcoded default list uses `OG`, `C`, `SAF`; the app/data use **`IOL`** and **`S`**. It still works (positions filter to those with players), but align the constant:
```ts
const defaultPositions = ['QB','RB','WR','TE','OT','IOL','EDGE','DT','LB','CB','S'];
```

**6 — Unused imports.** `Info`, `RefreshCw` (and possibly others) are imported but unused; strip them so a strict `tsconfig` doesn't flag `noUnusedLocals`.

---

## Definition of done (re-check after fixes)

- [ ] `npm run lint` (`tsc --noEmit`) passes.
- [ ] `App.tsx` Data Hub unchanged except the 2 added `preferences` lines; draft-class + board backups still work.
- [ ] Component renders via `players` / `onSelectPlayer(player)` / `activeBoardKey`; selecting a player opens `PlayerProfileModal`.
- [ ] Commit writes to the real active board through `saveRankingsToStorage` and shows in the board UI without reload.
- [ ] Trait pillars render on matchup cards; no `player.class` reference.
- [ ] Full-backup export/import round-trips `nfl_draft_preferences`.
</content>
