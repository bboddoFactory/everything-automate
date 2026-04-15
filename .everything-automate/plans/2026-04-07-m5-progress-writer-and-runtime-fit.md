---
title: M5 Progress Writer and Runtime Fit
task_id: m5-progress-writer-and-runtime-fit
status: approved
approval_state: approved
execution_mode: single_owner
verification_policy: doc-readthrough-and-py-compile
test_command: python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py
---

# Requirements Summary

- Decide who owns writing and updating `execute-progress.json`.
- Decide who writes `terminal-summary.json` at terminal or interrupted outcomes.
- Keep `loop-state.json` and progress artifacts separated in implementation, not just in docs.
- Fit the new writer/update flow into the current Codex runtime without turning `ea_codex.py` into the only source of truth.
- Keep the helper shape open enough for later non-Codex adapters without implementing those adapters now.

# Desired Outcome

After this slice, the project should have a clear v0 runtime plan for:

- how a run initializes `execute-progress.json`
- how current AC, evidence, retry count, and AC status are updated
- how `terminal-summary.json` is produced
- how `ea_state.py`, the new progress helper, and `ea_codex.py` divide responsibility

# In-Scope

- choose the writer/update architecture for progress artifacts
- define update trigger points for:
  - execute entry
  - AC selection
  - verification result
  - retry increment
  - blocked/fail/pass transitions
  - terminalization
- define ownership split between:
  - `runtime/ea_state.py`
  - a new progress helper
  - `runtime/ea_codex.py`
- define the minimum helper command surface needed for v0
- reflect the decision into:
  - `docs/specs/everything-automate-codex-execute-hardening.md`
  - future runtime implementation slice

# Non-Goals

- implement the helper yet
- redesign the `execute-progress.json` schema
- redesign `execute` branch semantics
- design Claude/internal adapter behavior
- build a UI around the progress artifacts

# Decision Boundaries

- `ea_state.py` remains run-level state only
- progress artifact writing should not be owned solely by `ea_codex.py`
- v0 may be Codex-first in usage, but the helper shape should stay provider-neutral
- terminal summaries should be derived from final progress + final run state, not hand-authored ad hoc

# Problem Framing

## Problem Statement

The project now knows what progress artifacts should exist, but not who maintains them.
If that responsibility is left vague, `execute-progress.json` and `terminal-summary.json` will remain conceptual artifacts instead of becoming real runtime support.

## Why Now

`M5` already locked:

- entry/readiness and branch semantics
- progress artifact shape and placement

The next stable step is defining the writer/update path before implementation starts.

## Success Definition

We have a small runtime architecture where:

- `ea_state.py` owns run-level state only
- one progress helper owns progress artifact writes
- `ea_codex.py` orchestrates the helper without swallowing its logic
- the update points are concrete enough to implement next

## Decision Drivers

- preserve clean ownership boundaries
- avoid overfitting progress updates to Codex-specific launch/runtime code
- keep the v0 implementation small
- make future provider adaptation possible without rewriting progress logic

## Viable Options

### Option A. Expand `ea_state.py` into a combined state+progress tool

Pros:

- one CLI
- fewer files

Cons:

- violates the state/progress split we just chose
- will make `ea_state.py` too broad

### Option B. Put all progress writes directly into `ea_codex.py`

Pros:

- fastest to implement for Codex
- no new runtime file

Cons:

- makes progress support provider-specific
- weakens future reuse
- mixes orchestration and artifact-writing logic

### Option C. Add a separate provider-neutral progress helper

Example name:

- `runtime/ea_progress.py`

Pros:

- preserves the run-state / progress split
- lets `ea_codex.py` remain an orchestrator
- keeps the helper reusable by later adapters

Cons:

- adds one more runtime tool
- needs a clear minimal command surface

## Recommended Direction

Choose **Option C**.

Use:

- `runtime/ea_state.py`
  - run-level lifecycle only
- `runtime/ea_progress.py`
  - `execute-progress.json` and `terminal-summary.json`
- `runtime/ea_codex.py`
  - orchestration / invocation of both helpers

Recommended v0 path contract:

```text
.everything-automate/state/tasks/{task_id}/loop-state.json
.everything-automate/state/tasks/{task_id}/execute-progress.json
.everything-automate/state/tasks/{task_id}/terminal-summary.json
```

v0 does not create a separate per-run subdirectory for progress artifacts.
`run_id` remains a required field inside the progress and terminal artifacts, but the file path stays task-scoped.

Recommended ownership boundary:

- `ea_state.py`
  - canonical run-level lifecycle
  - stage
  - terminal_reason
  - resume-from stage
- `ea_progress.py`
  - canonical writer for `execute-progress.json`
  - canonical writer for `terminal-summary.json`
  - no ownership of run lifecycle semantics
- caller (`execute` flow / `ea_codex.py`)
  - decides current AC
  - decides when progress must update
  - passes full snapshots to the helper

Recommended v0 update model:

- prefer full-snapshot writes over patch operations
- `ea_progress.py` stays a thin artifact writer plus deterministic terminal-summary derivation
- it does **not** become the canonical progress-state rule engine
- `best_resume_point` is caller-computed and written into the progress snapshot

Recommended minimum helper command surface:

- `init`
  - create the first `execute-progress.json`
- `write-snapshot`
  - replace the full progress snapshot in place
- `write-terminal-summary`
  - derive and write `terminal-summary.json` from:
    - final `execute-progress.json`
    - final `loop-state.json`
    - optional minimal outcome-specific metadata when needed

Recommended trigger points:

1. `execute` entry passes readiness
   - initialize `execute-progress.json`
2. current AC is selected
   - write a new progress snapshot with `current_ac`
3. verification produces evidence
   - write a new progress snapshot with updated `latest_evidence`
4. AC status changes
   - write a new progress snapshot reflecting `passed`, `blocked`, or `failed_verification`
5. retry count changes
   - write a new progress snapshot
6. terminal or interrupted outcome is reached
   - `ea_state.py` owns run-level terminal state
   - `ea_progress.py` writes `terminal-summary.json`

# Acceptance Criteria

- AC1. The plan chooses a separate provider-neutral progress helper.
  - TC: the plan rejects both `ea_state.py` expansion and `ea_codex.py`-only ownership.
- AC2. Update trigger points are explicit.
  - TC: the plan lists when progress is initialized and updated.
- AC3. The minimum helper command surface is explicit.
  - TC: the plan names the v0 commands/sub-operations needed.
- AC4. Terminal summary ownership is explicit.
  - TC: the plan states which helper writes `terminal-summary.json` and from what source.
- AC5. The Codex runtime role stays orchestration-only enough.
  - TC: the plan keeps progress artifact business logic outside `ea_codex.py`.

# Verification Steps

- Re-read:
  - `runtime/ea_state.py`
  - `runtime/ea_codex.py`
  - `docs/specs/everything-automate-codex-execute-hardening.md`
  - `templates/codex/skills/execute/SKILL.md`
- Verify the resulting plan answers:
  - who initializes progress
  - who updates current AC / evidence / retry counts
  - who writes terminal summary
  - how progress helper and state helper stay separate
  - whether progress writes are full snapshots or patch operations
- Run:
  - `python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py`

# Implementation Order

1. Define helper ownership split
2. Define path contract and snapshot model
3. Define update trigger points
4. Define minimal `ea_progress.py` command surface
5. Define how `ea_codex.py` calls the helper without swallowing progress rules
6. Carry the resulting implementation tasks into the next execute slice

# Risks and Mitigations

- Risk: adding another helper is overengineering for v0.
  - Mitigation: keep the command surface minimal and focused on artifact writes only.
- Risk: progress helper still ends up implicitly Codex-specific.
  - Mitigation: keep inputs plan/run/task oriented, not Codex session oriented.
- Risk: terminal summary generation becomes duplicated between runtime components.
  - Mitigation: make the progress helper the single writer for terminal summary artifacts.
- Risk: task-scoped progress paths make multi-run history ambiguous later.
  - Mitigation: keep `run_id` inside the artifacts and treat richer per-run layout as a later refinement.
- Risk: caller-computed snapshots may drift across adapters.
  - Mitigation: keep the helper command surface narrow and the snapshot schema canonical.

# Open Questions

- Should retry_count updates stay inside the full snapshot model only, or ever gain a convenience command later?
- Should `blocked` remain a run-stopping outcome in v0, or later become resumable without changing the summary model?

# Angel Expansion

Missing work items to carry into implementation:

- add a tiny shared path helper so `ea_state.py` and future `ea_progress.py` resolve the same task directory shape
- define failure behavior when state init succeeds but progress init fails
- define deterministic terminal-summary derivation from final progress + final state

Missing validation points:

- verify that `blocked` and `failed` summaries stay distinct
- verify interruption behavior during both `executing` and `verifying`
- verify that top-level `latest_evidence` and per-AC `latest_evidence` do not drift

Useful improvement:

- keep `ea_progress.py` as a thin writer using full-snapshot writes in v0 rather than patch-style update commands

# Architect Review

- Recommended approach: keep the split
  - `ea_state.py` for run-level lifecycle
  - `ea_progress.py` for progress + terminal artifacts
  - `ea_codex.py` as orchestrator only
- Alternatives considered:
  - extending `ea_state.py`
    - rejected because it collapses state and progress concerns
  - embedding progress writes in `ea_codex.py`
    - rejected because it makes the artifact model Codex-specific
- Tradeoff:
  - one more helper file exists in exchange for cleaner ownership and future adapter reuse
- Execution recommendation:
  - implement `ea_progress.py` as a provider-neutral full-snapshot writer first
  - keep terminal-summary generation in the same helper
- Architecture risks:
  - if callers reconstruct too much business logic, the helper split will be nominal only
  - if task-scoped files later need per-run history, path refinement will be needed

# Devil Validation

Verdict: approve

Critical gaps still to watch during implementation:

- do not let `ea_codex.py` become the hidden progress-state rule engine
- do not let `terminal-summary.json` turn into a second live progress source

Ambiguous points still tolerated for v0:

- convenience subcommands beyond full-snapshot writes
- future resumable treatment of `blocked`

Required revisions carried forward:

- keep the helper command surface minimal
- keep terminal summary deterministic from stored artifacts

# Self-Check

- placeholder scan: pass
- AC/testability check: pass
- handoff completeness check: pass
- implementation-order sanity check: pass
- contradiction check: pass

# Execution Handoff

- task_id: `m5-progress-writer-and-runtime-fit`
- plan_path: `.everything-automate/plans/2026-04-07-m5-progress-writer-and-runtime-fit.md`
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
  - minimal helper command surface may still be underspecified
  - trigger points may imply more progress granularity than v0 needs
