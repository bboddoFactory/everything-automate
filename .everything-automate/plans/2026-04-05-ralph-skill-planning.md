---
title: Ralph Skill Workflow Implementation and Hardening Plan
task_id: ralph-skill-workflow-hardening
status: approved
execution_mode: single_owner
verification_policy: fresh_evidence_required
test_command: null
---

# Ralph Skill Workflow Implementation and Hardening Plan

## Context

`everything-automate` treats Codex as the current `v0` execution path, with the primary user workflow staying inside the session and runtime helpers operating underneath that surface.

`$ralph` is already defined as a durable execution mode for approved plans, and `runtime/ea_codex.py` already exposes `ralph`, `status`, `cancel`, and `resume`. The gap is that the planning-side handoff contract and the runtime-side handoff/state behavior are not yet fully aligned:

- planning and Ralph expect an execution handoff block with `task_id`, `plan_path`, `recommended_mode`, `recommended_agents`, `verification_lane`, and `open_risks`
- `runtime/ea_codex.py` currently writes a thinner `handoff.json` and only checks plan-file existence
- `runtime/ea_state.py` supports init/suspend/resume-check/cancel, but does not yet provide bounded terminal artifact handling for Ralph completion/failure
- the repo milestone contract requires keeping `M4` in-session workflow/handoff separate from `M5` runtime/recovery hardening

This plan is intentionally contract-first so implementation does not harden the wrong interface.

## Requirements Summary

- Produce a Ralph workflow that can be executed from an approved plan artifact without reopening scope or approval questions.
- Keep the approved plan artifact as the execution source of truth.
- Define how the in-plan handoff block maps to runtime `handoff.json` and loop-state fields.
- Operationalize what counts as an approved plan for Ralph entry and resume.
- Preserve the repo’s `M4` vs `M5` boundary:
  - `M4`: in-session workflow, handoff contract, and minimal runtime alignment
  - `M5`: runtime/recovery hardening, status/cancel/resume semantics, and bounded terminalization behavior
- Keep implementation focused on the listed source files unless a small verification helper or fixture is strictly necessary.

## Goal / Desired Outcome

The repository has an execution-ready Ralph workflow plan that lets a follow-on implementation pass through contract lock, preflight validation, runtime alignment, and verification in order, without drifting between skill text, docs, handoff metadata, and state transitions.

## In-Scope

- Canonical Ralph authority model:
  - approved plan artifact is authoritative
  - in-plan execution handoff block is the canonical execution summary
  - runtime `handoff.json` is a derived manifest for launch/resume convenience
  - loop-state records runtime progression, not planning authority
- Ralph preflight rules for `start`/`ralph`/`resume`
- Field mapping between:
  - plan frontmatter
  - in-plan handoff block
  - runtime `handoff.json`
  - loop-state fields
- Minimal Ralph runtime alignment in `runtime/ea_codex.py`
- Bounded state/runtime hardening in `runtime/ea_state.py` for Ralph-related invariants only
- Concrete verification scenarios using real CLI entry points
- Focused doc and skill updates needed to keep the workflow contract coherent

Primary files in scope for implementation:

- `templates/codex/skills/ralph/SKILL.md`
- `templates/codex/skills/planning/SKILL.md`
- `templates/codex/AGENTS.md`
- `docs/specs/everything-automate-planning-workflow.md`
- `docs/specs/everything-automate-codex-execution-model.md`
- `docs/specs/everything-automate-implementation-milestones.md`
- `docs/specs/everything-automate-plan-artifact-contract.md`
- `docs/specs/everything-automate-stage-transition-contract.md`
- `docs/specs/everything-automate-resume-cancel-contract.md`
- `runtime/ea_codex.py`
- `runtime/ea_state.py`

Conditionally allowed additions:

- one focused verification helper or fixture if the existing runtime CLIs are not enough to exercise the contract cleanly

## Non-Goals

- Do not implement provider expansion beyond the Codex path.
- Do not redesign the entire planning workflow beyond Ralph-related contract normalization.
- Do not turn runtime helpers into the primary user UX.
- Do not add team runtime, subagent tree recovery, or broader adapter work.
- Do not introduce a second authority model where `handoff.json` can disagree with the approved plan and still proceed.
- Do not broaden terminal artifact design beyond the minimum Ralph outputs needed for `complete`, `failed`, and `cancelled` semantics.

## Decision Boundaries

- Source of truth:
  - The approved plan artifact is authoritative.
  - The in-plan handoff block is authoritative for execution handoff fields.
  - `handoff.json` must be derived from the approved plan and must not become a peer authority.
- Approved-plan gate:
  - Ralph entry requires frontmatter `status: approved`.
  - Required sections must be present.
  - `Open Questions` must be empty.
  - The handoff block must be present and valid.
  - `task_id` must be coherent across frontmatter, handoff block, and runtime invocation.
- Recommended metadata:
  - `recommended_agents` remains part of the planning handoff contract even if runtime support is initially pass-through only.
  - `recommended_mode` must remain explicit and must be reconciled with runtime action naming.
- Resume/cancel:
  - Resume continues the same task/run conservatively unless the implementation explicitly enters supersession logic.
  - `cancelled` remains distinct from `failed`.
  - Cancelled runs are not auto-resumable.
- Stage hardening:
  - This milestone only hardens Ralph-relevant invariants.
  - If full state-transition enforcement exceeds the file budget, the implementation must enforce the Ralph-critical subset and document deferred invariants.
- File budget:
  - No new broad docs or runtime subsystems unless the existing files cannot express a required contract or verification path.

## Acceptance Criteria

- AC1. A canonical Ralph handoff contract is defined across plan artifact, skill text, runtime guidance, and runtime manifest mapping.
  - TC: The implementation defines which fields live in plan frontmatter, which live in the in-plan handoff block, which are projected into `handoff.json`, and what happens when they mismatch.

- AC2. Ralph entry is gated by an operational definition of an approved plan artifact instead of simple file existence.
  - TC: The implementation names the exact approval checks for `ralph` and `resume`, including required sections, `status: approved`, empty open questions, valid handoff block, and coherent `task_id` / `plan_path`.

- AC3. The implementation order and file ownership preserve the repo milestone split between `M4` contract lock and `M5` runtime/recovery hardening.
  - TC: The plan separates contract/document/skill work from runtime/state hardening, and explicitly defers any broader runtime recovery work that is outside the Ralph-critical lane.

- AC4. Ralph runtime behavior is hardened only within bounded invariants that are testable from existing CLIs.
  - TC: The implementation specifies Ralph-critical invariants for prepare, resume, cancel, and terminalization behavior, and does not claim broader state-machine enforcement than it actually adds.

- AC5. Ralph leaves or references the minimum required durable outputs for execution evidence, final status, and wrap or terminal reason.
  - TC: The implementation defines artifact ownership and expected paths or explicitly narrows claims until those paths exist.

- AC6. Verification is concrete and executable from the local repository without requiring a hypothetical test harness.
  - TC: The verification lane names exact CLI scenarios, expected pass/fail outcomes, and required negative-path checks.

## Verification Plan / Steps

Use the runtime CLIs as the primary verification lane. If a small helper or fixture is added during implementation, it must support these scenarios rather than invent a new workflow.

1. Approved-plan happy path
   - Prepare an approved Ralph-ready plan fixture.
   - Run:
     ```bash
     python3 runtime/ea_codex.py ralph --workspace-root . --task-id ralph-happy --plan-path <approved-plan>
     ```
   - Pass:
     - command succeeds
     - `.everything-automate/codex/tasks/ralph-happy/handoff.json` is written
     - `.everything-automate/state/tasks/ralph-happy/loop-state.json` is written
     - reported mode/action align with Ralph semantics

2. Status coherence after Ralph preparation
   - Run:
     ```bash
     python3 runtime/ea_codex.py status --workspace-root . --task-id ralph-happy
     ```
   - Pass:
     - status reports coherent handoff, current run, and state data
     - `plan_path`, `task_id`, and mode fields match the approved plan

3. Reject non-approved or malformed plans
   - Run the Ralph prepare path against:
     - missing plan
     - `status: draft`
     - missing required sections
     - non-empty open questions
     - missing or malformed handoff block
     - mismatched `task_id`
   - Pass:
     - command fails before preparing runtime state
     - failure reason is explicit enough to diagnose the contract violation

4. Resume eligibility and conservative re-entry
   - Prepare a resumable Ralph run, suspend it, then run:
     ```bash
     python3 runtime/ea_codex.py resume --workspace-root . --task-id <task-id>
     ```
   - Pass:
     - resume uses the same task/run identity unless supersession was explicitly triggered
     - `resume_from_stage` is conservative and coherent with the contract
     - missing plan or superseded/terminal runs are rejected explicitly

5. Cancel semantics
   - Run:
     ```bash
     python3 runtime/ea_codex.py cancel --workspace-root . --task-id <task-id> --summary "test cancel"
     ```
   - Pass:
     - state becomes `cancelled`
     - `terminal_reason = cancelled`
     - cancel summary and preserved artifact information are recorded
     - a cancelled run is not reported as resumable

6. Terminalization and bounded stage invariants
   - Verify the Ralph-critical stage rules that are explicitly implemented.
   - Minimum checks:
     - no direct `executing -> complete`
     - wrapping is required before `complete`
     - terminal runs reject further state mutation
   - Pass:
     - each enforced invariant fails closed with a clear error

7. Artifact presence and output claims
   - Verify that the implementation either:
     - writes or references Ralph evidence/final-summary artifacts at documented paths, or
     - narrows the runtime/skill claim so the docs no longer promise artifacts that do not exist
   - Pass:
     - documentation and runtime behavior match

## Implementation Order

1. Lock the Ralph contract and authority hierarchy.
   - Normalize the meaning of:
     - approved plan artifact
     - in-plan handoff block
     - runtime `handoff.json`
     - loop-state ownership
   - Resolve the naming overlap between `recommended_mode`, runtime action names, and `execution_mode`.

2. Close the `M4` contract/docs/skill lane before runtime hardening.
   - Update the planning and Ralph skill contracts.
   - Update Codex runtime guidance and planning/execution specs so they all describe the same Ralph handoff model.
   - Keep this phase focused on contract lock and preflight semantics, not full runtime recovery.

3. Define Ralph preflight validation and failure policy.
   - Specify exact entry checks for `ralph`.
   - Specify which of those checks are re-run on `resume`.
   - Define mismatch behavior between approved plan content and derived runtime metadata.

4. Implement the minimal `M5` runtime alignment in `runtime/ea_codex.py`.
   - Make runtime handoff generation project from the approved plan contract.
   - Refuse preparation when the approved-plan gate fails.
   - Keep `status`, `resume`, and `cancel` aligned with the same contract.

5. Harden Ralph-critical runtime/state behavior in `runtime/ea_state.py`.
   - Enforce only the invariants needed for Ralph preparation, cancellation, resumability, and bounded terminalization.
   - Define how `complete` / `failed` output handling is represented, or narrow the claim if not fully implemented in this pass.

6. Add focused verification fixtures or helper coverage only if required.
   - Prefer shell-level CLI verification using the existing runtime entry points.
   - Add one small helper or fixture only if direct CLI validation becomes too brittle or repetitive.

7. Run the verification lane and only then mark the work execution-ready for Ralph.
   - Happy path
   - malformed-plan rejection
   - resume edge cases
   - cancel semantics
   - terminal artifact or claim alignment

## Risks and Mitigations

- Risk: source-of-truth drift between approved plan, handoff block, `handoff.json`, and loop-state.
  - Mitigation: treat the approved plan as authoritative and make `handoff.json` a derived projection with explicit mismatch rejection.

- Risk: `M4` and `M5` collapse into one broad runtime rewrite.
  - Mitigation: finish contract lock first and keep runtime hardening limited to Ralph-critical behavior.

- Risk: the repo currently promises fresh verification evidence, but evidence persistence is still thin.
  - Mitigation: either define the minimum Ralph evidence artifact path in this lane or narrow the output claim until that artifact exists.

- Risk: stage-hardening work expands into a full state-machine rewrite.
  - Mitigation: enforce only the Ralph-critical invariants in scope and document deferred enforcement explicitly.

- Risk: no established automated test harness exists in the repo today.
  - Mitigation: use real `python3 runtime/ea_codex.py ...` and `python3 runtime/ea_state.py ...` CLI scenarios as the required verification lane, with a small helper only if strictly needed.

- Risk: resume behavior becomes optimistic after partial or external changes.
  - Mitigation: resume must stay conservative and prefer verification-oriented re-entry when prior execution completeness is uncertain.

## Open Questions

None. This plan is execution-ready because the authority model, scope boundary, and verification lane are explicit.

## Execution Handoff

```yaml
task_id: ralph-skill-workflow-hardening
plan_path: /home/yhyuntak/workspace/everything-automate/.everything-automate/plans/2026-04-05-ralph-skill-planning.md
recommended_mode: ralph
recommended_agents:
  - explorer
  - devil
verification_lane: cli-smoke-plus-negative-path-runtime-checks
open_risks:
  - Minimal Ralph evidence artifact ownership may still need a small contract addition during execution.
  - Full state-transition enforcement beyond Ralph-critical invariants is intentionally deferred.
  - A small verification fixture/helper may be needed if raw CLI scenarios become too repetitive.
```
