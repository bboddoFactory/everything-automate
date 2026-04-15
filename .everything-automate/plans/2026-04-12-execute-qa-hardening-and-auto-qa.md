---
title: Execute QA Hardening And Auto QA
status: approved
approval_state: approved
task_id: execute-qa-hardening-and-auto-qa-2026-04-12
plan_path: .everything-automate/plans/2026-04-12-execute-qa-hardening-and-auto-qa.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - plan-arch
  - plan-devil
verification_lane: mixed
open_risks:
  - Packet validation may become awkward if AC and TC lookup rules are not kept simple.
  - Auto QA may blur execute and QA ownership if the final decision step stays weak.
  - Hiding the runtime policy in top-level docs may reduce discoverability unless execute and global guidance stay aligned.
---

# Execute QA Hardening And Auto QA

## Task Summary

Fix the two QA findings from the new execute advisor policy work and extend the design so `$execute` automatically enters QA when execution is truly complete.

This plan exists so both follow-up tracks stay in one place:

- harden the execute packet protocol
- design the new execute-to-QA automatic flow

## Desired Outcome

Have a follow-up change set that:

- binds execute packet artifacts to a real live execute state
- rejects bad task, AC, and TC context for durable packet files
- keeps the advisor runtime policy hidden from the top-level public workflow contract
- keeps `qa` as a real stage
- removes the need for the user to manually call `$qa` after a normal successful `$execute`
- strengthens QA so it is not only a cold reviewer call, but also a final judgment step

## In Scope

- fix `worker-report`, `advisor-handoff`, and `retry-packet` validation rules
- decide and document how AC and TC context is resolved and validated
- remove or narrow top-level documentation that wrongly exposes the hidden runtime policy
- redesign `$execute` completion so it can auto-enter QA
- redesign `$qa` so it supports:
  - cold reviewer output
  - main LLM judgment of those findings
  - clear return-to-execute behavior on `fix`
- update helper guidance and any small helper support needed for automatic QA handoff

## Non-Goals

- remove the QA stage entirely
- redesign planning around the advisor strategy
- add full hook-based or provider-native automation
- add commit automation
- redesign the full runtime or budget system
- reopen the earlier advisor design from scratch

## Design Direction

Use this shape:

```text
[Execute ACs and TCs]
   |
   v
[All ACs complete]
   |
   v
[Execute completion gate]
- changed files exist
- check results exist
- QA handoff can be built
   |
   +---- no ----> [Stay in execute and report what is missing]
   |
   v
[Auto QA handoff]
   |
   v
[Cold qa-reviewer]
   |
   v
[Main LLM QA judgment]
- pass
- fix
- planning only if truly needed
```

For the packet hardening work, use this rule:

- durable packet files are not free-form notes
- they are task-bound execute artifacts
- they must bind to an existing `execute-progress.json`
- AC and TC context must come from the live checklist or be validated against it

For the hidden-policy boundary, use this rule:

- keep the public workflow contract stable
- keep execute-only operating detail inside execute-oriented guidance
- do not promote experimental runtime policy into the top-level user-facing contract too early

## Test Strategy

The lane is `mixed`.

This work changes skill text and Python helper behavior.

Verification should include:

- `python3 -m py_compile` for changed Python files
- positive helper smoke tests for normal packet creation
- negative helper tests for:
  - missing `execute-progress.json`
  - bad `task_id`
  - bad `ac_id`
  - bad `tc_id`
  - inconsistent AC and TC pairing
- re-read updated execute and QA skill text for:
  - clean stage boundaries
  - auto-QA trigger clarity
  - clear `pass | fix` judgment ownership

## Task

### AC1. Harden Execute Packet Validation

Durable execute packet files must be tied to a real execute state.

#### TC1

`worker-report`, `advisor-handoff`, and `retry-packet` fail clearly when `execute-progress.json` does not exist for the target task.

#### TC2

If `ac_id` or `tc_id` is provided, the helper validates that the ID exists in the live checklist.

#### TC3

If both `ac_id` and `tc_id` are provided, the helper validates that the TC belongs to that AC.

#### TC4

If context is omitted, the helper resolves it from the current execute progress in a predictable way.

### AC2. Restore The Hidden Runtime Boundary

The advisor runtime policy must stay out of the top-level public workflow contract unless and until it is promoted intentionally.

#### TC1

`templates/codex/AGENTS.md` no longer exposes the execute controller/advisor policy as part of the top-level workflow note.

#### TC2

Any execute-specific hidden policy that still needs to guide the main LLM stays in execute-oriented guidance such as:

- `templates/codex/skills/execute/SKILL.md`
- `templates/codex/AGENTS.md.global` only if still justified

#### TC3

The documentation still makes it clear that the visible workflow remains:

- `$brainstorming`
- `$planning`
- `$execute`
- `$qa`

### AC3. Make QA Automatic After Normal Execute Completion

The user should not have to manually call `$qa` after a normal successful execute run.

#### TC1

The execute design clearly says that after all ACs complete, execute checks whether QA entry conditions are satisfied.

#### TC2

If changed files and test or check results exist, execute automatically prepares the QA handoff and enters QA.

#### TC3

If those conditions are missing, execute does not claim completion and instead reports what still needs to happen before QA.

### AC4. Strengthen QA As A Judgment Stage

QA should remain a stage, but it should do more than forward cold reviewer output.

#### TC1

The QA design clearly separates:

- cold reviewer findings
- main LLM judgment on those findings

#### TC2

The QA output still uses simple verdicts:

- `pass`
- `fix`

#### TC3

The QA design clearly says when a finding returns work to execute versus when it should truly reopen planning.

### AC5. Align Helper And Skill Text For Auto QA

The helper and skill surfaces must support the new auto-QA path without making the workflow confusing.

#### TC1

The execute skill text no longer ends with "move to `$qa`" as a separate user action.

#### TC2

The QA skill text remains useful for explicit reruns, but also reads naturally as an automatic follow-up stage after execute.

#### TC3

Any helper updates needed for building the QA handoff from execute are defined clearly and kept small.

### AC6. Verify Both Follow-Up Tracks

The final implementation must prove that both the packet hardening and auto-QA flow are real and understandable.

#### TC1

Changed Python files pass `python3 -m py_compile`.

#### TC2

Helper negative-path checks fail for bad task or bad checklist context and succeed for valid context.

#### TC3

The updated skill text reads as one clean flow:

```text
$planning
  -> $execute
  -> auto QA
  -> pass or fix
  -> commit only after pass
```

## Execution Order

1. Tighten packet helper validation and context binding.
2. Remove the top-level documentation leak for the hidden runtime policy.
3. Redesign execute completion around a QA entry gate.
4. Redesign QA as an automatic review-plus-judgment stage.
5. Add any small helper or handoff changes needed for auto QA.
6. Run positive and negative helper verification.
7. Re-read execute and QA text for simple English and clear stage boundaries.

## Open Risks

- If AC and TC context resolution is too clever, helper behavior may become harder to trust.
- If auto-QA is described too loosely, users may not know when execute is still missing verification.
- If QA judgment becomes too heavy, it may start to look like a second planning stage instead of a final review gate.

## Execute Handoff

- `task_id`: `execute-qa-hardening-and-auto-qa-2026-04-12`
- `plan_path`: `.everything-automate/plans/2026-04-12-execute-qa-hardening-and-auto-qa.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`:
  - `Packet validation may become awkward if AC and TC lookup rules are not kept simple.`
  - `Auto QA may blur execute and QA ownership if the final decision step stays weak.`
  - `Hiding the runtime policy in top-level docs may reduce discoverability unless execute and global guidance stay aligned.`
