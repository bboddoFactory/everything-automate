---
title: Execute Skill Design v0
task_id: execute-skill-v0
status: draft
execution_mode: single_owner
verification_policy: fresh_evidence_required
test_command: python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py
---

# Context

`everything-automate` needs a user-facing execution skill that sits after `$planning`.

Current reference ingredients already exist in pieces:

- `references/claude-automate/skills/implement/SKILL.md`
  - practical plan-as-source-of-truth execution discipline
- `references/superpowers/skills/executing-plans/SKILL.md`
  - readiness and blocker discipline
- `references/superpowers/skills/subagent-driven-development/SKILL.md`
  - stronger completion and review discipline
- `references/oh-my-codex/skills/ralph/SKILL.md`
  - persistence, verification, and terminal-state discipline
- `references/oh-my-claudecode/skills/ralph/SKILL.md`
  - stricter reviewer verification and terminalization rules
- `references/oh-my-openagent/*`
  - handoff and continuation-oriented execution thinking
- `runtime/ea_state.py`
  - local loop-state primitive
- `runtime/ea_codex.py`
  - internal Codex runtime helper

The gap is that there is no agreed user-facing execution skill contract in `templates/codex/skills/` yet.

This work defines that contract under the name `execute`.

# Requirements Summary

- Introduce a Codex in-session execution skill named `execute`.
- Define it as a new canonical execution contract for `everything-automate`, using `claude-automate` `implement` only as one reference rather than as the conceptual base.
- Keep planning upstream and explicit; `execute` must consume approved planning output rather than recreate planning inside execution.
- Keep the v0 surface single-owner, in-session, and future-friendly for later state/runtime hardening.
- Pull in the strongest execution ideas from `superpowers`, `OMO`, `OMC`, and `OMX` without importing their full ceremony or runtime weight.

# Desired Outcome

After this work, `templates/codex/skills/execute/SKILL.md` should define a concrete execution workflow that:

- starts from a richer approved planning handoff, not a thin “plan exists” signal
- runs an entry readiness check before real execution begins
- works acceptance-criteria-first, while tolerating story-shaped input only when each story resolves to verifiable ACs
- loops through `execute -> verify -> decide -> fix -> repeat`
- applies bounded retry and explicit stop/escalation rules
- requires fresh evidence before claiming completion
- distinguishes `complete`, `cancelled`, `failed`, and `suspended/interrupted`
- emits progress and terminal summaries that later runtime/state work can support
- refers to runtime/state support as internal implementation support, not as the main UX

# Goal

Design the first `execute` skill contract for Codex so it can become the primary execution surface after `$planning`, as a C-lite / Ralph-lite canonical executor for `everything-automate`.

# In-Scope

- Define `execute` as a new Codex skill under `templates/codex/skills/`
- Decide what parts of `claude-automate` `implement` should be preserved
- Decide what Ralph-loop semantics should be added
- Decide which review, blocker, and continuation concepts from the reference systems belong in v0
- Define entry preconditions, loop semantics, verification requirements, and terminal outcomes
- Define the approved-plan handoff contract that `execute` consumes
- Define the execution readiness gate, bounded retry rule, and progress-summary expectations
- Update immediately adjacent Codex template guidance if the new `execute` surface changes current wording materially

# Non-Goals

- Recreate planning or brainstorming inside `execute`
- Generate PRDs or story scaffolds inside execution
- Make `execute` team-first, tmux-first, or wrapper-first
- Fully implement state/resume/cancel runtime mechanics in this step
- Finalize Claude adaptation in this step
- Add mandatory heavy review lanes for every low-risk run

# Decision Boundaries

- `execute` sits strictly after `$planning`
- `execute` requires an approved plan or equivalent approved handoff artifact
- v0 stays `single_owner`
- runtime helpers and state tools remain internal support surfaces
- `execute` may mention cancel/resume expectations, but does not own the entire runtime implementation
- `execute` should not silently widen scope; if scope changes materially, it must push work back to planning or update the plan explicitly
- `execute` owns execution discipline, not plan authoring discipline
- `execute` is a canonical contract, not a renamed `implement`
- `execute` must lock readiness, retry, blocker, and terminal semantics in the skill contract now rather than deferring them to later runtime milestones
- reviewer verification is conditional in v0, not universally mandatory

Approved plan means, at minimum:

- a concrete plan artifact exists on disk
- the plan includes explicit non-goals and decision boundaries
- the plan includes problem framing
- the plan includes decision drivers, viable options when relevant, and recommended direction
- the plan includes acceptance criteria and verification steps
- the plan includes an execution handoff block
- the user has explicitly approved the plan, or the plan carries an equivalent explicit approval state

The execution input contract should reuse planning handoff fields instead of inventing a parallel schema.
At minimum, `execute` consumes:

- `task_id`
- `plan_path`
- `approval_state`
- `execution_unit`
- `recommended_mode`
- `recommended_agents`
- `verification_lane`
- `open_risks`
- `problem_framing`
- `decision_drivers`
- `viable_options`
- `recommended_direction`
- explicit unit-of-work source (`AC` or `story->AC`)

Before implementation begins, `execute` must run an entry readiness check:

- approved handoff present
- verification steps are concrete enough to run
- execution unit is explicit
- major open risks are understood
- no unresolved ambiguity remains about scope boundaries
- no missing decision context would force execution to reopen already-set direction choices

# Acceptance Criteria

- AC1. `execute` is defined as an in-session Codex skill with clear entry preconditions.
  - TC: `templates/codex/skills/execute/SKILL.md` explicitly requires an approved plan or approved handoff block and redirects vague work back to `$planning`.
- AC2. `execute` is framed as a new canonical execution contract rather than as a renamed `implement`.
  - TC: The skill text uses `claude-automate` `implement` as a reference for practical discipline, but centers the contract on `planning -> execute -> verify -> decide` and C-lite execution semantics.
- AC3. `execute` adds Ralph-lite execution semantics without importing planning/PRD ceremony.
  - TC: The skill documents `execute -> verify -> decide -> fix -> repeat`, fresh evidence requirements, explicit terminal outcomes, and bounded retry while avoiding PRD generation or planning loops.
- AC4. `execute` defines completion, cancellation, failure, and interruption distinctly.
  - TC: The skill names at least `complete`, `cancelled`, `failed`, and `suspended/interrupted`, and does not collapse them into one generic stop condition.
- AC5. `execute` exposes a richer planning-consumption contract that later state/runtime work can support.
  - TC: The skill names the minimum handoff fields it consumes, including planning decision context, and the minimum runtime/state expectations it assumes.
- AC6. `execute` preserves disciplined progress and scope handling from the best references.
  - TC: The skill explains how it progresses AC/story work, how completion gets reflected back into the plan or execution record, and what happens when new work is discovered mid-run.
- AC7. `execute` fixes the unit-of-work rule explicitly.
  - TC: The skill states that execution is AC-first and only accepts story-shaped work when the approved input already resolves stories into verifiable ACs.
- AC8. `execute` fixes the v0 reviewer-verification floor explicitly.
  - TC: The skill states that fresh evidence is always mandatory, and reviewer verification is mandatory for higher-risk or architecture-sensitive runs while optional for low-risk runs.
- AC9. `execute` fixes readiness, retry, blocker, and terminal semantics explicitly as part of the contract.
  - TC: The skill includes an execution readiness check, bounded retry / escalation rules, explicit blocker-stop rules, and exhaustive terminal outcomes including partial-progress expectations.
- AC10. Adjacent Codex guidance remains consistent with the new `execute` skill surface.
  - TC: `templates/codex/AGENTS.md` and directly relevant planning/execution specs do not contradict the new `execute` contract.

# Verification Steps

- Re-read:
  - `references/claude-automate/skills/implement/SKILL.md`
  - `references/superpowers/skills/executing-plans/SKILL.md`
  - `references/superpowers/skills/subagent-driven-development/SKILL.md`
  - `references/oh-my-codex/skills/ralph/SKILL.md`
  - `references/oh-my-claudecode/skills/ralph/SKILL.md`
  - any directly relevant `oh-my-openagent` execution/handoff docs
  and verify the new `execute` skill selectively carries:
  - AC-driven execution
  - blocker / escalation discipline
  - fresh evidence gating
  - explicit terminal outcomes
  - continuation and state/runtime assumptions
- Verify `templates/codex/skills/execute/SKILL.md` includes:
  - purpose
  - use/do-not-use
  - entry contract
  - entry readiness check
  - loop steps
  - verification policy
  - retry / escalation rules
  - blocker / stop rules
  - terminal outcomes
  - handoff/runtime expectations
  - progress/update discipline
  - partial-progress and terminal-summary expectations
- Verify the execution input contract is explicit about at least:
  - `task_id`
  - `plan_path`
  - `approval_state`
  - `execution_unit`
  - `recommended_mode`
  - `recommended_agents`
  - `open_risks`
  - `problem_framing`
  - `decision_drivers`
  - `viable_options`
  - `recommended_direction`
  - accepted AC/story source
  - `verification_lane`
- Verify the skill explicitly names user-facing terminal outcomes:
  - `complete`
  - `cancelled`
  - `failed`
  - `suspended/interrupted`
- Verify the skill explicitly states the v0 reviewer-verification floor:
  - fresh evidence always required
  - reviewer verification conditional on run risk/impact
- Re-read:
  - `templates/codex/AGENTS.md`
  - `templates/codex/INSTALL.md`
  - `templates/codex/skills/planning/SKILL.md`
  - `docs/specs/everything-automate-planning-workflow.md`
  and confirm the `planning -> execute` boundary is explicit and consistent.
- Run:
  - `python3 -m py_compile runtime/ea_state.py runtime/ea_codex.py`
  to ensure referenced internal support artifacts are still valid Python entry points.

# Implementation Order

1. Reframe `execute` as a new canonical execution contract rather than an `implement` rename.
2. Pull only the strongest reusable references from prior systems:
   - from `claude-automate`: plan-as-source-of-truth, AC-driven progress, verification-first discipline
   - from `superpowers`: readiness and blocker discipline, stronger completion review expectations
   - from Ralph variants: explicit loop semantics, entry readiness, fresh evidence, bounded retry, explicit terminal states, continuation thinking
3. Draft `templates/codex/skills/execute/SKILL.md` around:
   - purpose
   - use/do-not-use
   - entry readiness gate
   - context intake
   - execution loop
   - verification contract
   - retry / escalation rules
   - blocker / stop rules
   - terminal outcomes
   - progress and terminal summaries
   - runtime support assumptions
4. Define the minimum approved-plan / handoff contract `execute` consumes so it matches current planning output:
   - `task_id`
   - `plan_path`
   - `approval_state`
   - `execution_unit`
   - `recommended_mode`
   - `recommended_agents`
   - `verification_lane`
   - `open_risks`
   - `problem_framing`
   - `decision_drivers`
   - `viable_options`
   - `recommended_direction`
   - AC-first source or story-to-AC source
5. Fix the v0 execution semantics explicitly in the skill contract:
   - entry readiness check before implementation begins
   - fresh evidence is mandatory for all runs
   - reviewer verification is conditional by run risk/impact
   - retries are bounded and escalate instead of looping forever
   - terminal outcomes must include `complete`, `cancelled`, `failed`, and `suspended/interrupted`
   - small discovered sub-work may only be folded into the current AC when it remains inside existing non-goals and decision boundaries
   - boundary-crossing scope drift must trigger `update the plan or stop`
6. Define the progress/update contract:
   - how AC/story completion is reflected
   - how retries are bounded and escalated
   - what happens when new work is discovered
   - what evidence is required for `complete`
   - what partial-progress summary is required on stop/interruption
   - what summary is required on cancellation
   - what terminal summary is required on completion
7. Align `templates/codex/AGENTS.md` and any immediately adjacent execution wording if needed.
8. Run lightweight verification and leave runtime-mechanics hardening for later milestones.

# Risks and Mitigations

- Risk: `execute` becomes just a rename of `implement` and fails to gain real Ralph-loop value.
  - Mitigation: Recenter the plan around a new canonical executor contract and force explicit readiness, loop, and terminal semantics into the skill.
- Risk: `execute` absorbs too much Ralph complexity and becomes PRD-heavy or orchestration-heavy.
  - Mitigation: Ban planning/PRD generation and keep v0 `single_owner`.
- Risk: `planning` and `execute` boundaries blur.
  - Mitigation: Make approved-plan input a hard precondition and redirect ambiguity back to `$planning`.
- Risk: runtime/state support leaks into wrapper-first UX.
  - Mitigation: Keep state/runtime helper mentions internal and secondary.
- Risk: `execute` stays too weakly opinionated about blockers, so it continues on invalid assumptions.
  - Mitigation: Import explicit blocker and escalation rules from stronger reference executors.
- Risk: `claude-automate` migration loses useful implementation discipline.
  - Mitigation: Preserve AC-driven execution, verification-first behavior, and clear progress/terminal semantics.
- Risk: `execute` never resolves the AC-vs-story distinction and ends up underspecified.
  - Mitigation: Allow `AC` or `story->AC` as the unit of work, but require the source unit to be explicit in the approved plan/handoff block.
- Risk: cancellation, interruption, and failure blur together in the user-facing skill text.
  - Mitigation: Make `complete`, `cancelled`, `failed`, and `suspended/interrupted` explicit outcomes, even if runtime ownership differs.
- Risk: reviewer verification is left implicit and different callers assume different completion standards.
  - Mitigation: Fix the v0 rule now: fresh evidence always, reviewer verification conditional by risk/impact.
- Risk: execution starts with approval but without enough decision context from planning, so the executor drifts from the chosen direction.
  - Mitigation: Make `problem_framing`, `decision_drivers`, `viable_options`, and `recommended_direction` part of the consumed handoff contract.
- Risk: wrap/summary behavior stays vague and later runtime work has no stable execution terminal contract.
  - Mitigation: Define terminal summary and partial-progress summary requirements now, even if runtime storage remains a later milestone.

# Open Questions

- For v0, should `suspended/interrupted` remain a user-visible terminal outcome in the skill text, or be documented as an execution stop state that later runtime helpers may surface?

# Angel Expansion

Missing work items to carry into the skill contract:

- define progress/update rules for AC/story completion
- define what happens when execution discovers scope drift or new sub-work
- define whether `suspended/interrupted` is a user-facing outcome or an internal runtime-only state
- define the minimum terminal summary or wrap expectation

Missing validation points:

- verify the skill against `templates/codex/skills/planning/SKILL.md` handoff fields, not just against the reference Ralph skills
- verify that the user-facing skill text covers partial progress and partial evidence on cancellation
- verify that the execution unit terminology stays coherent if the input plan is AC-shaped in one case and story-shaped in another
- verify that readiness check failure returns cleanly to planning instead of starting a half-valid run

Edge cases:

- plan exists but is not explicitly approved
- plan has ACs but weak or missing verification steps
- some ACs are complete when the run is cancelled or interrupted
- new work is discovered mid-execution that materially changes scope
- verification passes for one AC/story but overall task is not yet complete

Optional improvements:

- include a small entry checklist in the skill
- include a `plan update or stop` rule for scope drift
- include a bounded escalation policy for repeated failed retries
- include a short blocker matrix so low-risk runs know when not to over-escalate

# Architect Review

- Recommended approach: make `execute` a focused C-lite / Ralph-lite execution contract that consumes approved planning output and stabilizes the execution kernel for later runtime hardening.
- Carry over from references:
  - from `claude-automate`:
    - source-of-truth plan discipline
    - AC-driven progress
    - verification-first mentality
  - from `superpowers`:
    - readiness and blocker discipline
    - stronger completion review expectations
  - from Ralph variants:
    - explicit loop semantics
    - entry readiness and context intake
    - fresh evidence gate
    - bounded retry / escalation
    - explicit terminal outcomes
    - partial-progress and terminal-summary expectations
    - continuation/state assumptions as support contracts
- Do not carry over:
  - PRD ceremony
  - team orchestration
  - heavy reviewer/tooling matrix as a v0 hard dependency

Alternatives considered:

- pure `implement` rename
  - rejected because it does not materially improve persistence or terminal-state discipline
- full Ralph import
  - rejected because it pulls planning/PRD/orchestration complexity back into v0
- runtime-first execute design
  - rejected because the user-facing skill contract should stabilize before deeper runtime glue

Structural conclusion:

```text
planning
  -> approved plan
  -> execute
     -> readiness check
     -> execute
     -> verify
     -> decide
     -> fix
     -> repeat
  -> progress or terminal summary
```

# Devil Validation

Verdict: iterate

Critical gaps still to close in implementation:

- `execute` still needs its actual skill text written; this plan only locks the contract
- `approved` must be reflected in the final skill as an explicit handoff contract, not left as an informal adjective
- the final skill must state reviewer verification as conditional in v0, not vague
- readiness, bounded retry, blocker, and terminal-summary rules must be fixed in the actual skill text, not implied
- terminal outcomes should include interruption/suspension expectations, not only complete/cancelled/failed
- the execution input contract should mirror current planning handoff fields exactly in the final skill
- the final skill must state what happens when readiness check fails before execution begins

Required revisions carried forward:

- reframe `execute` as C-lite / Ralph-lite canonical execution
- make approval semantics explicit
- widen the execution input contract to include planning decision context
- make readiness, retry, blocker, partial-progress, and scope-drift handling explicit
- make terminal-outcome language exhaustive enough for later runtime support

# Execution Handoff

- task_id: `execute-skill-v0`
- plan_path: `.everything-automate/plans/2026-04-05-execute-skill-design.md`
- approval_state: `draft`
- execution_unit: `AC`
- recommended_mode: `direct`
- recommended_agents:
  - `explorer`
  - `angel`
  - `architect`
  - `devil`
- verification_lane: `doc-contract-review + python-py_compile`
- open_risks:
  - runtime assumptions can still drift from the future actual implementation
  - terminal-summary contract still needs to be reflected in the final skill text
  - richer planning handoff fields must be mirrored exactly in the final execute skill
  - v0 still needs a clean policy for surfacing `suspended/interrupted` in user-facing language
