---
title: Ralph Skill Design v0
task_id: ralph-skill-v0
status: draft
execution_mode: single_owner
verification_policy: fresh_evidence_required
test_command: python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py
---

# Context

`everything-automate` already has the lower-level state and Codex runtime helper pieces for Ralph-like execution:

- `runtime/ea_state.py`
- `runtime/ea_codex.py`
- `docs/specs/everything-automate-loop-state-contract.md`
- `docs/specs/everything-automate-stage-transition-contract.md`
- `docs/specs/everything-automate-evidence-contract.md`

What is still missing is a stronger `templates/codex/skills/ralph/SKILL.md` design that turns those contracts into a usable in-session execution surface.

This plan treats Codex as:

```text
inside Codex
  -> planning and execution intent selection

under the hood
  -> handoff
  -> runtime preparation
  -> state/recovery support
```

That means the Ralph skill must stay primarily user-facing and in-session, while still producing a handoff shape that the runtime helper can consume.

# Requirements Summary

- Redesign the Codex Ralph skill so it is a first-class in-session execution surface.
- Make the skill consume approved planning artifacts instead of bypassing planning.
- Make the skill explicit about handoff, execution loop behavior, verification expectations, and terminal outcomes.
- Keep runtime/state glue as support, not the primary user workflow.

# Desired Outcome

After this work, `templates/codex/skills/ralph/SKILL.md` should define a concrete, execution-ready Ralph workflow that:

- can be invoked after `$planning`
- clearly states preconditions and refusal cases
- explains the inner loop in terms of `execute -> verify -> decide -> fix`
- leaves behind a handoff shape and runtime expectations compatible with `runtime/ea_state.py` and `runtime/ea_codex.py`
- preserves the distinction between `cancelled`, `failed`, and verified completion

# Goal

Turn the current minimal Ralph skill stub into a complete v0 Codex Ralph execution contract that can serve as the user-facing execution surface for later implementation work.

# In-Scope

- Redesign `templates/codex/skills/ralph/SKILL.md`
- Tighten the relationship between:
  - planning output
  - Ralph handoff block
  - runtime support expectations
- Define Ralph entry rules, execution loop rules, verification rules, and terminalization rules
- Define how Ralph should reference state/evidence/runtime support without exposing wrapper-first UX
- Add or update adjacent Codex template guidance if the Ralph skill contract changes materially

# Non-Goals

- Implement the full durable runtime in this step
- Add Claude-specific Ralph behavior
- Add team mode, subagent mode, or browser/reviewer orchestration
- Finalize global install packaging
- Solve all resume/cancel runtime mechanics inside the skill itself

# Decision Boundaries

- Codex primary UX stays in-session
- Runtime helpers remain internal support, not the main UX
- Ralph does not replace planning
- Ralph may assume an approved plan artifact exists
- v0 stays `single_owner`; do not design team/subagent semantics into the first Ralph skill
- The first Ralph redesign should describe the contract clearly before adding more automation

# Acceptance Criteria

- AC1. Ralph skill defines clear entry preconditions and redirects vague work back to planning.
  - TC: `templates/codex/skills/ralph/SKILL.md` explicitly refuses execution when scope, non-goals, decision boundaries, or approved plan are missing.
- AC2. Ralph skill defines the full v0 execution loop in a way that matches the shared kernel contracts.
  - TC: The skill documents `execute -> verify -> decide -> fix -> repeat` and keeps completion gated by fresh evidence.
- AC3. Ralph skill defines its handoff and runtime contract clearly enough for `runtime/ea_codex.py` and `runtime/ea_state.py` to support it later.
  - TC: The skill names the required handoff fields and the expected output artifacts.
- AC4. Ralph skill defines terminal outcomes without collapsing cancel into failure.
  - TC: The skill separately describes verified completion, explicit cancel, and failure/max-iteration style exits.
- AC5. Codex template guidance remains consistent with the redesigned Ralph skill.
  - TC: `templates/codex/AGENTS.md` and any immediately relevant Codex template guidance no longer contradict the Ralph skill contract.

# Verification Steps

- Verify the updated `templates/codex/skills/ralph/SKILL.md` includes:
  - preconditions
  - refusal / redirect cases
  - core loop
  - handoff contract
  - verification contract
  - terminal outcomes
- Re-read:
  - `templates/codex/AGENTS.md`
  - `docs/specs/everything-automate-planning-workflow.md`
  - `docs/specs/everything-automate-codex-execution-model.md`
  and confirm the Ralph description is consistent.
- Run:
  - `python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py`
  to ensure the documented runtime support references still point to valid Python artifacts.
- Optionally run a focused local Codex planning/execution dry run later, but this plan does not require a full runtime loop test yet.

# Implementation Order

1. Re-read the current Ralph skill stub and extract the exact gaps versus the planning and execution model specs.
2. Rewrite the Ralph skill structure around:
   - purpose
   - preconditions
   - entry gate
   - loop contract
   - handoff/runtime expectations
   - terminal outcomes
3. Align the skill language with the shared contracts:
   - loop-state
   - evidence
   - stage transition
4. Update `templates/codex/AGENTS.md` if its surface description of `$ralph` no longer matches the revised skill.
5. Sanity-check adjacent docs for direct contradiction, but do not widen into unrelated documentation cleanup.
6. Run lightweight verification and keep the result ready for a later handoff into actual runtime implementation.

# Risks and Mitigations

- Risk: The Ralph skill stays too abstract and does not materially help later implementation.
  - Mitigation: Force explicit handoff fields, terminal outcomes, and runtime expectations into the skill.
- Risk: The skill leaks wrapper-first UX back into the user surface.
  - Mitigation: Keep runtime helpers referenced as internal support only, not primary commands.
- Risk: The skill overreaches into team/subagent/runtime behavior and becomes unstable.
  - Mitigation: Keep v0 strictly `single_owner` and defer wider execution modes.
- Risk: Planning and Ralph semantics drift apart.
  - Mitigation: Reuse the planning handoff block and require approved plan artifacts as a hard precondition.

# Open Questions

- Should the first Ralph redesign include an explicit `max_iterations` policy in the skill text, or defer that to runtime/state docs only?
- Should Ralph mention a future `$ralplan` alias explicitly, or only refer to `$planning` until `ralplan` is formalized in this repo?
- Should execution evidence be described as a separate file path convention in the skill, or only as a contract concept for now?

# Architect Review

- Recommended approach: make Ralph a stronger execution contract first, not a launcher surface.
- Alternative considered: design Ralph around direct runtime helper invocation.
- Why not now: that would pull M5 runtime concerns back into M4 and blur the in-session UX boundary.
- Structural conclusion: the right v0 move is to harden the skill contract and keep runtime glue behind it.

# Angel Expansion

- Add an explicit refusal path for missing approval state, not just missing plan file.
- Add a rule that Ralph must not silently widen scope when new tasks emerge; it must update the plan or stop.
- Add a note about preserving evidence and terminal summaries even when execution is cancelled.

# Devil Validation

Verdict: iterate

Critical gaps that must be closed in implementation:

- The Ralph skill must explicitly describe what "approved plan" means in practice.
- The skill must name all terminal outcomes rather than only saying "explicitly stopped."
- The handoff block should mention `recommended_mode` and `recommended_agents`, not just the narrower runtime subset, so it stays aligned with planning output.

# Execution Handoff

- task_id: `ralph-skill-v0`
- plan_path: `.everything-automate/plans/2026-04-05-ralph-skill-design.md`
- recommended_mode: `start`
- recommended_agents:
  - `explorer`
  - `architect`
  - `devil`
- verification_lane: `doc-contract-review + python-py_compile`
- open_risks:
  - `approved` semantics are still partly implicit
  - evidence file-path convention is not yet fixed
  - runtime helper and in-session skill wording can drift if not updated together
