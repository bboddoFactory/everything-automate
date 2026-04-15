---
title: M5 Progress and Terminal Artifacts
task_id: m5-progress-and-terminal-artifacts
status: approved
approval_state: approved
execution_mode: single_owner
verification_policy: doc-readthrough-and-contract-check
test_command: python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py
---

# Requirements Summary

- Define how `execute` keeps AC-level progress visible without overloading `ea_state.py`.
- Choose the v0 artifact shape for structured execution progress.
- Define partial-progress output and terminal summary output for:
  - `complete`
  - `cancelled`
  - `failed`
  - `suspended/interrupted`
- Keep run-level state and execution-progress concerns separate unless strong evidence forces convergence.
- Make the artifact shape concrete enough to guide later `M5` runtime/state fit work.

# Desired Outcome

After this slice, the project should have a clear v0 answer for:

- where AC-level progress lives
- what fields a structured progress artifact must contain
- how partial-progress is represented mid-run
- what a terminal summary must contain for each terminal outcome
- how progress artifacts relate to, but do not replace, `loop-state.json`

# In-Scope

- choose the v0 progress artifact model
- define the minimum JSON schema shape for AC-level progress
- define the relationship between:
  - `loop-state.json`
  - progress artifact
  - terminal summary artifact or terminal summary section
- define example outputs for:
  - partial progress
  - `complete`
  - `cancelled`
  - `failed`
  - `suspended/interrupted`
- update:
  - `docs/specs/everything-automate-codex-execute-hardening.md`
  - `templates/codex/skills/execute/SKILL.md`

# Non-Goals

- implement the progress artifact writer in runtime code yet
- expand `ea_state.py` yet
- design team-mode or multi-lane execution
- redesign `execute` branch semantics
- decide final installed UX around status viewers

# Decision Boundaries

- v0 chooses **Option B**: separate structured progress artifact in JSON
- `ea_state.py` remains run-level state first
- progress artifact must be machine-readable before it is human-optimized
- terminal summary may be a separate artifact or a terminalized snapshot, but it must stay structurally clear
- v0 remains single-threaded and AC-first

# Problem Framing

## Problem Statement

`execute` already requires AC-level visibility, but the current runtime contract only covers run-level state.
Without a separate progress artifact, later `M5` work will either overload `ea_state.py` or leave progress ambiguous.

## Why Now

`M5` 1번 묶음 already fixed entry and branch semantics.
The next stable step is deciding how progress and terminal artifacts are represented, because later runtime/state work depends on that boundary.

## Success Definition

We have a recommended JSON-first progress artifact model and concrete examples showing:

- how an in-progress run is represented
- how a partial-progress snapshot looks
- how terminal outcomes summarize the run
- how these artifacts coexist with `loop-state.json`

## Decision Drivers

- keep run-level state and AC-level progress separated
- prefer structured JSON over text-first logs in v0
- keep artifacts easy to read later and easy to consume programmatically
- align with stronger reference patterns without copying their full runtime complexity
- avoid forcing runtime implementation decisions too early

## Viable Options

### Option A. Expand `loop-state.json`

Put AC progress directly into `loop-state.json`.

Pros:

- one file
- fewer artifact names

Cons:

- mixes run lifecycle and AC progress
- makes later recovery/runtime semantics heavier
- diverges from stronger reference patterns

### Option B. Separate `execute-progress.json`

Keep `loop-state.json` for run-level state and add `execute-progress.json` for AC-level progress and evidence snapshots.

Pros:

- clear ownership boundary
- matches the current `M5` direction
- aligns with the references that separate state and progress
- easier to evolve independently later

Cons:

- one more artifact to manage
- terminal summaries still need a clear place

### Option C. Text-first progress log

Use a `progress.txt` or `progress.md` as the primary progress source.

Pros:

- human-readable
- easy to append during execution

Cons:

- weaker machine readability
- harder to build later status/resume logic from
- not ideal as the canonical v0 source

## Recommended Direction

Choose **Option B**.

Use:

- `loop-state.json` for run-level state
- `execute-progress.json` for AC-level progress
- `terminal-summary.json` for end-state output derived from progress + final run state

Recommended placement:

- `loop-state.json`
  - `.everything-automate/state/tasks/{task_id}/loop-state.json`
- `execute-progress.json`
  - `.everything-automate/state/tasks/{task_id}/execute-progress.json`
- `terminal-summary.json`
  - `.everything-automate/state/tasks/{task_id}/terminal-summary.json`

Recommended ownership split:

- `loop-state.json`
  - stage
  - iteration
  - resume-from stage
  - terminal reason
  - run-level lifecycle
- `execute-progress.json`
  - AC-level progress
  - retry counts
  - latest evidence snapshot
  - best resume point for work progression
- `terminal-summary.json`
  - final outcome summary for humans and later tooling
  - derived from the final progress snapshot and terminal state

Recommended v0 artifact behavior:

- `execute-progress.json` is updated in place
- `terminal-summary.json` is written only when the run reaches a terminal or interrupted outcome
- `latest_evidence` exists in two places:
  - per-AC summary under the relevant AC entry
  - top-level cached pointer for the most recent evidence in the whole run

Recommended minimum `execute-progress.json` shape:

```json
{
  "schema_version": 1,
  "task_id": "m5-progress-and-terminal-artifacts",
  "run_id": "uuid",
  "plan_path": ".everything-automate/plans/...",
  "status": "in_progress",
  "current_ac": {
    "ac_id": "AC2",
    "title": "Define partial-progress summary example"
  },
  "completed_acs": [],
  "blocked_acs": [],
  "failed_verification_acs": [],
  "acs": [
    {
      "ac_id": "AC1",
      "title": "Choose separate JSON progress artifact",
      "status": "passed",
      "retry_count": 0,
      "latest_evidence": {
        "kind": "doc-review",
        "summary": "artifact ownership boundary documented"
      }
    }
  ],
  "latest_evidence": {
    "ac_id": "AC1",
    "kind": "doc-review",
    "summary": "artifact ownership boundary documented"
  },
  "best_resume_point": "resume current AC from verify",
  "updated_at": "2026-04-07T00:00:00Z"
}
```

# Acceptance Criteria

- AC1. The plan chooses a separate JSON progress artifact for v0.
  - TC: the plan explicitly rejects `loop-state.json` expansion as the primary v0 path.
- AC2. The minimum `execute-progress.json` shape is explicit.
  - TC: the plan names the required top-level fields and AC-level fields.
- AC3. Partial-progress output is defined.
  - TC: the plan includes a concrete in-progress or partial-progress example.
- AC4. Terminal summary output is defined for all current terminal outcomes.
  - TC: the plan includes concrete examples for `complete`, `cancelled`, `failed`, and `suspended/interrupted`.
- AC5. The relationship between progress artifact and run-level state is explicit.
  - TC: the plan states what belongs in `loop-state.json` vs `execute-progress.json`.
- AC6. Terminal summary placement is explicit.
  - TC: the plan chooses whether terminal summary is separate or embedded and explains why.

# Verification Steps

- Re-read:
  - `docs/specs/everything-automate-codex-execute-hardening.md`
  - `templates/codex/skills/execute/SKILL.md`
  - `runtime/ea_state.py`
  - `references/oh-my-codex/docs/contracts/ralph-state-contract.md`
  - `references/oh-my-claudecode/src/hooks/ralph/progress.ts`
  - `references/claude-automate/skills/implement/SKILL.md`
- Verify the resulting design answers:
  - where current AC lives
- where completed/blocked/failed-verification ACs live
- where latest evidence lives
- what an interrupted or cancelled run leaves behind
- how terminal summaries relate to the progress artifact
- Run:
  - `python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py`

# Implementation Order

1. Define the ownership boundary between `loop-state.json` and `execute-progress.json`
2. Define artifact location and update behavior
3. Define the minimum `execute-progress.json` schema
4. Define partial-progress example
5. Define terminal summary examples
6. Reflect the model into:
   - `docs/specs/everything-automate-codex-execute-hardening.md`
   - `templates/codex/skills/execute/SKILL.md`
7. Carry the remaining runtime/state fit questions into the next `M5` slice

# Risks and Mitigations

- Risk: the progress artifact duplicates too much state from `loop-state.json`.
  - Mitigation: keep run lifecycle and AC progress ownership separate on purpose.
- Risk: terminal summary becomes a second competing source of truth.
  - Mitigation: define it as a derived summary of progress + final state, not a replacement.
- Risk: JSON shape becomes too detailed for v0.
  - Mitigation: keep fields minimal and AC-focused.
- Risk: progress artifact duplicates run-level state accidentally.
  - Mitigation: keep stage/terminal ownership in `loop-state.json` and AC progression ownership in `execute-progress.json`.

# Open Questions

- Should `latest_evidence` capture only the most recent evidence per AC, or a short rolling list?
- Should `blocked` and `failed` both write `terminal-summary.json` immediately, or should `blocked` remain resumable in a later phase?

# Angel Expansion

Missing work items to carry into implementation:

- define artifact location explicitly in the hardening doc, not only in this plan
- define top-level identity fields for `execute-progress.json`
- define the minimum AC entry shape explicitly
- define whether `execute-progress.json` is updated in place or append-driven
- define whether `latest_evidence` is per-AC only or also cached at top level

Missing validation points:

- verify that the chosen shape can represent all current end states
- verify that `blocked` and `failed` do not collapse into the same summary shape
- verify that partial progress still makes sense when no AC has passed yet
- verify that the progress artifact does not duplicate run-level state ownership

Useful improvements:

- include `schema_version`
- keep a canonical `best_resume_point`
- prefer JSON as the canonical source and leave human-readable rendering for later

# Architect Review

Recommended approach:

- keep `loop-state.json` small and lifecycle-oriented
- add `execute-progress.json` as the canonical AC-progress ledger
- write a separate `terminal-summary.json` only when the run reaches a terminal or interrupted outcome

Alternatives considered:

- embedding AC progress into `loop-state.json`
  - simpler file count, but worse ownership boundaries
- text-first progress log
  - easier for humans, but worse as the canonical v0 source

Tradeoffs:

- separate artifacts cost one more file, but preserve a much clearer state/progress boundary
- separate `terminal-summary.json` costs another file, but prevents `execute-progress.json` from becoming a terminal-state dumping ground

Execution recommendation:

- use this slice to define artifact shapes and example outputs only
- defer runtime writing logic until the next `M5` state/runtime-fit slice

Architecture risks:

- top-level and per-AC evidence fields may drift if ownership is not defined narrowly
- terminal summary may become a second source of truth if it is not explicitly derived from progress + loop state

# Devil Validation

Verdict: iterate

Critical gaps still to close:

- the plan recommends a separate `terminal-summary.json`, but the exact minimum schema is still not shown
- `latest_evidence` retention policy is still slightly ambiguous
- `blocked` vs `failed` terminal behavior may still need one more pass to avoid overlapping semantics

Required revisions carried forward:

- make terminal summary shape explicit during execution
- keep `blocked` and `failed` summaries distinguishable
- keep progress ownership separate from stage ownership

# Self-Check

- placeholder scan: pass
- AC/testability check: pass at plan level
- handoff completeness check: pass
- implementation-order sanity check: pass
- contradiction check: one open design question remains on evidence retention granularity

# Execution Handoff

- task_id: `m5-progress-and-terminal-artifacts`
- plan_path: `.everything-automate/plans/2026-04-07-m5-progress-and-terminal-artifacts.md`
- approval_state: `draft`
- execution_unit: `AC`
- recommended_mode: `direct`
- recommended_agents:
  - `explorer`
  - `angel`
  - `architect`
  - `devil`
- verification_lane: `doc-readthrough + py_compile`
- open_risks:
  - terminal summary placement may still need one more decision
  - evidence retention granularity may still be underspecified
