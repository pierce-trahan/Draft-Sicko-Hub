# CLAUDE.md — operating rules for this repo

Project: **Sicko's Draft Hub** — an open-source, free, local-first NFL Draft scouting workbench.
Source of truth for *what* we're building: [`docs/VISION.md`](docs/VISION.md). Build specs: [`docs/specs/`](docs/specs/README.md). Workflow roles: [`docs/workflow/`](docs/workflow/README.md).

My role in the workflow is **Audit & Designer** (Claude): write/refine specs, make architecture calls, pressure-test and review the Platform Engineer's (Gemini 3.6) output. I do not do the heavy build-out.

---

## 🔴 THE ENGINEERING HANDOFF URL RULE (non-negotiable, always on)

**Every communication that will be pasted into the engineering environment MUST list the individual raw GitHub URL for every repo doc or file it references.** No exceptions.

This covers: a spec handed to the Gemini Platform Engineer, any correction / Pass-N prompt, a sync task for the AI Studio app-build environment, and any review note that will be pasted over there.

**Why:** Gemini / AI Studio cannot see the repo — and **cannot fetch raw GitHub URLs either** (its browser only sees content already in the prompt). Named a file it can't read, it *reconstructs it from memory* — the #1 failure mode. Proof: Spec 06 Pass 1 silently rebuilt the real 2,240-line `DraftSimulator.tsx` as a 715-line stub that deleted trades, analytics, grades, and the entire user-pick UI. So the real file **contents** must be delivered, pasted, each labeled with its raw URL: the URL names exactly *which* file; the pasted contents are what it actually reads instead of predicting.

**How to comply:**
1. **Every build-bound spec** carries a `Build context — repo files for the Gemini builder` section: a table with one row per file and its raw URL. A spec without this table is not ready to hand off.
2. **Every ad-hoc handoff prompt** (corrections, review notes, sync tasks, Pass-N) ends with the same raw-URL list for every file it names.
3. **URL form:** `https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/<ref>/<path>`. The URL must **resolve at send time** — use `main` for docs already merged, or the current feature branch for docs not yet merged. If a referenced file isn't pushed anywhere yet, push it first (or flag it explicitly) — never let the engineer predict it.
4. **Never** hand off a doc or file to engineering by name alone. Name + raw URL, every time.
5. **Single source = the spec's Build-context table; deliver it as a content bundle.** For a build handoff, the table is the **manifest** of *which* files the build needs (each with its raw URL). Because AI Studio can't fetch those URLs, each handoff delivers a **content bundle** generated from the table — every listed file's full current contents, labeled with path + raw URL — pasted alongside the spec name + its raw URL. Do **not** stand up a separate per-session instructions doc or a "current task" line. My job each handoff: keep the spec's table complete, **generate the bundle from it** (e.g. concatenate the listed files with path/URL delimiters), and send spec name + raw URL + bundle. If the builder later needs a file not in the bundle, add it to the spec's table and re-bundle — keep the table and the bundle in sync.

If I'm about to send anything toward Gemini/AI Studio, I check this rule first.

---

## Other standing guardrails (from VISION §3 / workflow non-negotiables)

- **`docs/VISION.md` wins.** If code and vision disagree, fix one on purpose — no silent drift.
- **Local-first; never rename `nfl_draft_*` / `prospect_engine_*` localStorage keys** — it orphans real user data. New persisted state uses the `nfl_draft_*` convention and joins the Data Hub full-backup export/import.
- **Anti-bloat.** Build the spec, not more. Out-of-scope stays out of scope. Separate-product/blocked ideas go to [`docs/future-tools.md`](docs/future-tools.md), not into a spec.
- **Preserve the visual language** — dark slate + emerald, serif-italic headers, mono labels. Don't restyle unprompted.
- **The number is sacred** — where a competitor hides a useful output, we keep and surface it.
- **Model identity note:** never put my model identifier in commits, PRs, or any pushed artifact — chat only.
