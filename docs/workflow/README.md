# Build Workflow — Sicko's Draft Hub

Three roles, one pipeline. Each role has a lane; work flows left to right, and problems flow back right to left.

```
┌─────────────────────┐   spec    ┌──────────────────────────┐  tested code  ┌──────────────────────────┐
│  CLAUDE              │  ───────► │  GEMINI 3.6 (AI Studio   │  ───────────► │  AI STUDIO — APP BUILD   │
│  Audit & Designer    │           │  chat)                   │               │  environment             │
│                      │ ◄──────── │  Platform Engineer       │ ◄──────────── │  Implementation Engineer │
└─────────────────────┘  questions └──────────────────────────┘   integration └──────────────────────────┘
                          / review                                    issues        (orchestrator)
```

## The three roles

| Role | Who | Owns | Does NOT do |
|---|---|---|---|
| **Audit & Designer** | Claude | Vision, specs, architecture decisions, code review, catching what "doesn't click" | Heavy build-out; final assembly |
| **Platform Engineer** | Gemini 3.6 in the regular AI Studio chat (large token budget) | Implementing specs into complete, working, **tested** code and logic | Re-litigating the vision; inventing product decisions |
| **Implementation Engineer** | The AI Studio **app build** environment | Assembling the tested pieces into the actual runnable/publishable product; integration; deploy readiness | Re-architecting; rewriting working logic from scratch |

## How work moves

1. **Design (Claude).** A feature gets a spec in `docs/specs/NN-*.md`, precise enough to build from — intent → mechanic → data model → acceptance criteria → out-of-scope. Product decisions are resolved here (or logged as open in `docs/VISION.md` §11).
2. **Build & test (Gemini 3.6).** The platform engineer implements the spec as complete, runnable code, tests it in the chat/build sandbox, and reports what it built + how it was verified. Spec ambiguities go *back* to Claude/the user — they are not resolved by guessing.
3. **Integrate & ship (AI Studio app build).** The implementation engineer wires the tested pieces into the product inside AI Studio, handles environment/config (`GEMINI_API_KEY`), and gets it to a runnable/publishable state. Integration problems go *back* to the platform engineer.
4. **Review (Claude).** Claude audits the result against the spec and the design tenets, and either accepts or writes the next spec / fix note.

## Non-negotiables every role inherits (from `docs/VISION.md`)

- **`docs/VISION.md` is the source of truth.** If code and vision disagree, one gets fixed on purpose — no silent drift.
- **Local-first; the user owns their data.** Never rename the `nfl_draft_*` or `prospect_engine_*` localStorage keys — it orphans real user data. New state uses the same `nfl_draft_*` convention and joins full-backup export/import.
- **Anti-bloat.** Build the spec, not more. A half-built module is worse than a missing one. Out-of-scope items stay out of scope.
- **Preserve the visual language.** Dark slate + emerald, serif-italic headers, mono labels. Match the existing patterns; don't restyle unprompted.
- **The number is sacred.** Where a competitor hides a useful output, we keep and surface it.

## Paste-ready system instructions

- Platform Engineer → [`gemini-3.6-platform-engineer.md`](gemini-3.6-platform-engineer.md)
- Implementation Engineer → [`aistudio-implementation-engineer.md`](aistudio-implementation-engineer.md)
</content>
