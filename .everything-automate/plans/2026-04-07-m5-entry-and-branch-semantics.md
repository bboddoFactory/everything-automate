---
title: M5 Entry and Branch Semantics
task_id: m5-entry-and-branch-semantics
status: approved
approval_state: approved
execution_mode: single_owner
verification_policy: doc-readthrough-and-spec-update
test_command: python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py
---

# Requirements Summary

- Lock the first hardening slice of `M5` for Codex `execute`.
- Define clear entry readiness semantics before execution begins.
- Define concrete `verify / decide` branch examples for `pass`, `fail`, `blocked`, and `scope_drift`.
- Define retry/escalation and scope-drift handling examples tightly enough that later progress/state design does not drift.
- Keep this slice at the contract/document level first rather than jumping into runtime implementation prematurely.

# Desired Outcome

After this work, `execute` should have a clear and reviewable contract for:

- when execution may start
- when execution must refuse entry
- what each `decide` branch means in practice
- when local retry is allowed vs when execution must stop or return to `$planning`
- when discovered work may be absorbed vs when it must be treated as scope drift

This slice should leave `M5` ready for the next question:

- where AC-level progress should live

# In-Scope

- `planning -> execute` handoff interpretation for M5 entry behavior
- explicit readiness refusal semantics
- branch examples for:
  - `pass`
  - `fail`
  - `blocked`
  - `scope_drift`
- retry bound / escalation examples
- in-bound vs out-of-bound scope drift examples
- corresponding updates to:
  - `templates/codex/skills/execute/SKILL.md`
  - `docs/specs/everything-automate-codex-execute-hardening.md`

# Non-Goals

- design the final AC-level progress artifact
- expand `ea_state.py` yet
- build separate `$verify` or `$decide` skills
- implement Claude or internal-service adaptation
- harden terminal summaries beyond the examples needed for branch semantics

# Decision Boundaries

- `execute` remains the single user-facing execution surface after `$planning`
- `verify` and `decide` stay inside `execute`
- `approval_state != approved` must refuse entry
- run-level state and AC-level progress are treated as separate concerns unless later evidence forces convergence
- `M5` should prefer example-driven contract hardening before runtime changes

# Problem Framing

## Problem Statement

`execute` already describes a useful flow, but its entry and branch semantics are still too abstract.
Without concrete examples, the same contract could be interpreted inconsistently across runs.

## Why Now

This is the first active `M5` slice.
If entry, branch, retry, and scope-drift semantics are not pinned first, later work on progress artifacts and state/runtime fit will be unstable.

## Success Definition

The project has a small set of concrete examples showing:

- when `execute` refuses entry
- what counts as `pass`
- what counts as `fail`
- what counts as `blocked`
- what counts as `scope_drift`
- when local retry stops
- when work returns to `$planning`

## Decision Drivers

- keep `execute` strict enough to prevent ambiguous starts
- keep branch semantics concrete enough to support later progress tracking
- align with stronger reference harness patterns without copying their full ceremony
- avoid premature runtime/state design while still preparing for it

## Viable Options

### Option A. Keep branch semantics high-level only

Pros:

- fastest
- no new examples to maintain

Cons:

- branch behavior stays open to interpretation
- later progress/state design will drift

### Option B. Add example-driven contract hardening now

Pros:

- clarifies `execute` before runtime expansion
- gives a stable base for later progress and state decisions
- fits current `M5` scope

Cons:

- adds some document weight before runtime changes

### Option C. Skip examples and jump directly to progress/state implementation

Pros:

- feels more concrete

Cons:

- risks implementing the wrong semantics
- makes runtime shape lead the contract instead of follow it

## Recommended Direction

Choose **Option B**.

Pin `execute` entry and branch behavior with explicit examples first, then use those examples to guide progress artifact and runtime/state work.

# Acceptance Criteria

- AC1. `execute` refusal behavior is explicit when entry readiness fails.
  - TC: a draft handoff example shows refusal output and a clear return to `$planning`.
- AC2. `pass / fail / blocked / scope_drift` each have a concrete example.
  - TC: the hardening doc includes one example for each branch and the skill contract matches the same meaning.
- AC3. Retry and escalation behavior is bounded and concrete.
  - TC: the hardening doc includes an example where repeated failure stops local retry.
- AC4. Scope drift distinguishes in-bound and out-of-bound discovered work.
  - TC: the hardening doc includes one example of each and ties out-of-bound work to `$planning`.
- AC5. This slice does not prematurely decide the final AC-progress storage model.
  - TC: the plan leaves progress artifact vs `ea_state.py` as the next stage question rather than smuggling in a hidden choice.

# Verification Steps

- Re-read:
  - `docs/specs/everything-automate-codex-execute-hardening.md`
  - `templates/codex/skills/execute/SKILL.md`
  - `runtime/ea_state.py`
  - `runtime/ea_codex.py`
- Cross-check against:
  - `references/superpowers/skills/executing-plans/SKILL.md`
  - `references/superpowers/skills/verification-before-completion/SKILL.md`
  - `references/oh-my-codex/skills/plan/SKILL.md`
  - `references/oh-my-codex/skills/ralph/SKILL.md`
  - `references/claude-automate/skills/implement/SKILL.md`
- Verify the resulting docs answer:
  - when `execute` may start
  - when it must refuse entry
  - what each decide branch means
  - when retry stops
  - when work returns to planning
- Run:
  - `python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py`

# Implementation Order

1. Lock the readiness refusal example in the hardening doc and `execute` skill
2. Add `pass / fail / blocked / scope_drift` examples to the hardening doc
3. Reflect the same branch semantics back into `templates/codex/skills/execute/SKILL.md`
4. Add retry/escalation example
5. Add in-bound / out-of-bound scope-drift examples
6. Re-check whether any branch wording now implies hidden progress/state requirements

# Risks and Mitigations

- Risk: examples become too specific and overfit one task shape.
  - Mitigation: use compact, generic AC-shaped examples.
- Risk: branch examples accidentally decide the progress artifact shape.
  - Mitigation: keep progress storage explicitly out-of-scope for this slice.
- Risk: readiness and branch semantics diverge between the hardening doc and the skill.
  - Mitigation: update both files in the same slice.

# Angel Expansion

Missing work items to carry into execution:

- add one compact example for each branch in both the hardening doc and the `execute` skill
- pin the minimal refusal/output wording so entry failure and later branch outcomes do not drift
- define a retry example that shows both local retry and the point where retry must stop
- define one in-bound and one out-of-bound scope drift example with the same AC shape

Missing validation points:

- verify that the `pass` example records evidence instead of only claiming success
- verify that the `fail` example does not silently re-open planning
- verify that the `blocked` example distinguishes external blocker from repeated local failure
- verify that the `scope_drift` example does not accidentally imply a progress artifact design

Edge cases:

- verification passes for the current AC, but a broader regression fails
- a blocker affects the current AC, but the run is otherwise still well-defined
- discovered work looks small, but crosses a declared decision boundary

Optional improvements:

- add a compact branch-output template so all four branches use parallel wording
- add a short "when to stop and ask" note under retry/escalation

# Architect Review

- Recommended approach: keep this slice document-first and example-driven.
- For `M5` v0, treat `execute` as a single-threaded AC-first loop.
- Therefore:
  - `blocked` should stop the run immediately rather than trying to continue with other ACs
  - out-of-bound `scope_drift` should return to `$planning`
  - `failed` should remain the outcome for exhausted retry or a blocker that prevents valid continuation

Structural conclusion:

```text
entry gate
  -> pass / fail / blocked / scope_drift examples
  -> retry / escalation example
  -> progress artifact decision later
```

This keeps branch semantics stable before touching progress/state design.

# Devil Validation

Verdict: approve

Critical points to preserve:

- do not let `blocked` and `failed` collapse into the same branch
- do not let `scope_drift` become a hidden replanning channel inside `execute`
- do not let branch examples smuggle in AC-progress storage decisions

Required revisions already carried in this draft:

- `blocked` stops the current run in v0
- out-of-bound `scope_drift` returns to `$planning`
- retry exhaustion is handled separately from `blocked`

# Self-Check

- placeholder scan: pass
- AC/testability check: pass
- handoff completeness check: pass
- implementation-order sanity check: pass
- contradiction check: pass for this slice

# Open Questions

- no blocking open question remains for this planning slice

# Execution Handoff

- task_id: `m5-entry-and-branch-semantics`
- plan_path: `.everything-automate/plans/2026-04-07-m5-entry-and-branch-semantics.md`
- approval_state: `approved`
- execution_unit: `AC`
- recommended_mode: `direct`
- recommended_agents:
  - `explorer`
  - `angel`
  - `architect`
  - `devil`
- verification_lane: `doc-readthrough + py_compile`
- open_risks:
  - `blocked` semantics may still need one more decision on whether non-blocked ACs can continue
  - scope-drift examples may accidentally smuggle in progress artifact assumptions
