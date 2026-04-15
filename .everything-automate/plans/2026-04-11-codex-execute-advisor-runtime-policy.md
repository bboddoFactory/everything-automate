---
title: Codex Execute Advisor Runtime Policy
status: approved
approval_state: approved
task_id: codex-execute-advisor-runtime-policy-2026-04-11
plan_path: .everything-automate/plans/2026-04-11-codex-execute-advisor-runtime-policy.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - explorer
  - plan-arch
  - plan-devil
verification_lane: mixed
open_risks:
  - The execute loop may become too heavy if the controller writes too many artifacts on small retries.
  - Advisor packet fields may overlap with execute progress unless ownership stays explicit.
  - Model routing remains instruction-driven unless later runtime hooks or config surfaces enforce it.
---

# Codex Execute Advisor Runtime Policy

## Task Summary

Add an advisor-style hidden runtime policy to the Codex template without changing the visible user workflow.

The public flow stays:

```text
$brainstorming
  -> $planning
  -> $execute
  -> $qa
```

The change happens inside `$execute`.

## Desired Outcome

Have a v1 Codex design and implementation that:

- keeps the current public skill surface
- treats the main LLM as the `controller`
- uses a `worker` for bounded implementation work
- uses an `advisor` only for hard execution moments
- keeps `worker -> advisor` ownership with the controller, not the worker
- uses a hybrid context rule
  - short retries in memory
  - important execution boundaries in files
- leaves `$planning` mostly unchanged

## In Scope

- redesign the internal `$execute` policy around `controller -> worker -> advisor -> retry`
- define advisor trigger rules for `$execute`
- define the minimal file protocol for:
  - worker report
  - advisor handoff
  - controller retry packet
- update Codex template guidance so the hidden policy is stated clearly
- add or adjust minimal helper support needed to write the new execute artifacts
- keep the existing checklist/progress model aligned with the new policy

## Non-Goals

- add a new public skill such as `$advisor`
- redesign `$planning` around the advisor strategy
- make workers call the advisor directly
- implement full hook-based automation
- build a full budget engine or model router
- redesign `$qa`
- finalize provider-wide enforcement for model selection

## Decision Boundaries

- the visible Codex workflow stays the same
- the top-level main LLM in `$execute` is the controller
- the worker handles implementation and checks
- the advisor only gives diagnosis, critique, and next-step guidance
- the controller decides whether to retry, narrow scope, ask the advisor, or return to planning
- worker/advisor exchanges should not require full transcript dumps
- plan, execute progress, advisor handoff, and QA handoff must stay separate artifacts with clear roles

## Design Direction

The new `$execute` should follow this shape:

```text
[Read approved plan]
   |
   v
[Controller]
- pick AC
- pick TC
- decide direct work vs worker
   |
   v
[Worker]
- read code
- implement
- run check
- report result
   |
   +---- pass --------------------> [Controller marks progress]
   |
   +---- fail / blocked / risky --> [Controller decides]
                                      |
                                      +---- retry directly
                                      |
                                      +---- build advisor handoff
                                                |
                                                v
                                           [Advisor]
                                           - diagnosis
                                           - recommended path
                                           - next steps
                                                |
                                                v
                                      [Controller writes retry packet]
                                                |
                                                v
                                           [Worker retries]
```

The main policy rule is:

- `controller` owns the loop
- `worker` does bounded implementation work
- `advisor` is called only when needed

The preferred file targets for v1 are:

- `templates/codex/skills/execute/SKILL.md`
- `templates/codex/skills/execute/scripts/checklist.py`
- `templates/codex/skills/execute/scripts/` for any new advisor packet helper
- `templates/codex/AGENTS.md.global`
- `templates/codex/AGENTS.md`
- `runtime/ea_progress.py` only if progress artifact support needs a small extension

## Test Strategy

The lane is `mixed`.

This work changes skill text, guidance text, and likely one or more Python helpers.

Verification should include:

- re-read the updated skill and guidance text for simple English and clear role boundaries
- run `python3 -m py_compile` on any changed Python helper or runtime file
- run a small helper smoke check if a new advisor packet script is added
- confirm the plan, progress, advisor handoff, and QA handoff roles stay distinct

## Task

### AC1. Redesign `$execute` Around Controller Ownership

`$execute` must clearly describe the controller-owned advisor policy.

#### TC1

The skill text clearly says the main LLM in `$execute` is the controller that owns:

- AC and TC selection
- worker delegation
- advisor delegation
- retry and stop decisions

#### TC2

The skill text clearly says the worker does not call the advisor directly.

#### TC3

The core flow in the skill shows `controller -> worker -> controller -> advisor when needed -> worker retry`.

### AC2. Define Advisor Trigger Rules Inside `$execute`

`$execute` must say when advisor use is expected instead of leaving it vague.

#### TC1

The skill defines a short trigger set such as:

- repeated failure on the same TC
- design fork during execution
- scope growth beyond the approved plan
- final risk pass before completion

#### TC2

The trigger rules are framed as execution policy, not as optional brainstorming advice.

### AC3. Define The Minimal Execute Artifact Protocol

The design must define which parts stay in memory and which parts become files.

#### TC1

The plan and resulting implementation define a hybrid rule:

- short local retries can stay in memory
- advisor boundaries and durable resume points must be written to files

#### TC2

The implementation defines minimal required fields for:

- worker report
- advisor handoff
- controller retry packet

#### TC3

The artifact paths and ownership make it clear how these differ from:

- the approved plan
- `execute-progress.json`
- the final QA handoff

### AC4. Add Minimal Helper Support For Advisor Boundaries

The template must have a simple way to create or update advisor-boundary artifacts without forcing manual JSON guessing.

#### TC1

The execute helper surface can write an advisor handoff artifact with task and AC/TC context, recent attempts, open question, and candidate next steps.

#### TC2

The execute helper surface can write the controller's post-advisor retry packet or append an advisor decision summary to progress in a clear way.

#### TC3

The helper design stays small and does not turn execute into a heavy runtime protocol.

### AC5. Align Global Guidance With The New Hidden Policy

The Codex template guidance must make the new execute behavior coherent without changing the visible workflow.

#### TC1

`templates/codex/AGENTS.md.global` and any needed local guidance mention the controller-owned delegation rule clearly.

#### TC2

The guidance keeps planning and QA roles stable while describing advisor use as an execute-stage runtime policy.

### AC6. Verify The New Policy And Leave A Clean Execute Handoff

The final change set must be easy for `$execute` to follow and easy for later QA to review.

#### TC1

Changed Python files pass `python3 -m py_compile`.

#### TC2

The updated skill/guidance text is re-read and does not force guessing about:

- who owns advisor calls
- when files are written
- when to return to planning

#### TC3

The final plan and implementation leave a simple execute handoff with explicit risks.

## Execution Order

1. Rewrite the `$execute` skill around controller ownership.
2. Add explicit advisor trigger rules to `$execute`.
3. Define the hybrid memory/file artifact policy and packet shapes.
4. Add the smallest helper support needed for advisor boundary files.
5. Update Codex guidance so the hidden policy is visible to the main LLM.
6. Verify changed helpers with `py_compile` and smoke checks.
7. Re-read the final text for simple English and clean role boundaries.

## Open Risks

- The controller may overuse advisor packets unless the trigger rules stay short and strict.
- The helper layer may become too abstract if packet writing is split across too many scripts.
- Execute progress and advisor artifacts may blur together unless each file has one clear job.
- Because model routing is prompt-driven in v1, user or agent drift may still happen until stronger runtime controls exist.

## Execute Handoff

- `task_id`: `codex-execute-advisor-runtime-policy-2026-04-11`
- `plan_path`: `.everything-automate/plans/2026-04-11-codex-execute-advisor-runtime-policy.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`:
  - `The execute loop may become too heavy if the controller writes too many artifacts on small retries.`
  - `Advisor packet fields may overlap with execute progress unless ownership stays explicit.`
  - `Model routing remains instruction-driven unless later runtime hooks or config surfaces enforce it.`
