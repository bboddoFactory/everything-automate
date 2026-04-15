---
title: QA Behavior Contract Redesign And Checklist Hardening
status: approved
approval_state: approved
task_id: qa-behavior-contract-redesign-and-checklist-hardening-2026-04-12
plan_path: .everything-automate/plans/2026-04-12-qa-behavior-contract-redesign-and-checklist-hardening.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - plan-arch
  - plan-devil
verification_lane: mixed
open_risks:
  - The QA handoff may grow too wide if behavior and contract fields are not kept short.
  - Skill-level auto QA still depends on the main LLM following the skill text; it is not runtime-enforced.
  - If AGENTS.md and the skill files drift, the workflow contract may become unclear again.
---

# QA Behavior Contract Redesign And Checklist Hardening

## Task Summary

Refine the current execute and QA direction so the system stays LLM-led instead of sliding into script-led orchestration.

This work has three linked goals:

- harden execute packet state rules
- redefine QA as a behavior-and-contract review stage, not only a code review stage
- keep auto QA as a skill-level continuation rule instead of a runtime-enforced automation feature

## Desired Outcome

Have a follow-up change set that:

- makes durable execute packets valid only for the live execute context
- keeps scripts limited to state, artifacts, and validation
- updates QA so it reviews both:
  - code and tests
  - behavior, prompt/skill contract, and decision ownership
- expands the QA handoff so the reviewer can evaluate LLM-facing behavior changes
- keeps auto QA as a main-LLM skill rule after normal execute completion
- treats `templates/codex/AGENTS.md` and the skill files as the stable source of truth

## In Scope

- harden `templates/codex/skills/execute/scripts/checklist.py`
- redefine the purpose and reviewer lens in `templates/codex/skills/qa/SKILL.md`
- update `templates/codex/agents/qa-reviewer.md`
- reshape `templates/codex/skills/qa/scripts/build_handoff.py`
- align `templates/codex/skills/execute/SKILL.md` with skill-level auto QA
- move stable workflow policy out of `templates/codex/AGENTS.md.global` and into stable docs where needed

## Non-Goals

- add runtime-enforced QA orchestration
- let scripts decide verdicts, retry policy, or advisor policy
- redesign the full advisor strategy from scratch
- split QA into multiple agents in this change
- add provider-native automation hooks

## Design Direction

Use this ownership model:

```text
[Main LLM]
   |
   +---- owns planning, execution judgment, QA judgment
   |
   +---- may delegate bounded review or implementation work
   |
   v
[Scripts]
- persist state
- write packets
- validate schema and live context
- do not decide behavior
```

Use this QA model:

```text
[Execute Result]
   |
   v
[QA Entry Check]
   |
   v
[Build Focused QA Handoff]
- code and test evidence
- behavior goal
- contract changes
- LLM-owned decisions
- script-owned validation
   |
   v
[Cold Reviewer]
- code lens
- behavior/contract lens
   |
   v
[Main LLM Judge]
- pass
- fix
- planning only if truly needed
```

For auto QA, use this rule:

- after normal execute completion, the main LLM should continue into `$qa` when review inputs are ready
- this is a skill-level operating rule
- it is not a runtime-enforced orchestration promise in this change

For stable policy placement, use this rule:

- `templates/codex/AGENTS.md` holds the stable top-level workflow contract
- skill files hold detailed stage behavior
- `templates/codex/AGENTS.md.global` should not become the long-term source of truth for stable workflow policy

## Test Strategy

The lane is `mixed`.

Verification should include:

- `python3 -m py_compile` for changed Python helpers
- helper smoke tests for valid live-context packet writes
- helper negative tests for:
  - missing `execute-progress.json`
  - missing live `current_ac`
  - mismatched current AC or TC
  - stale completed AC context
- re-read execute and QA skill text for:
  - clean LLM ownership boundaries
  - clear code lens plus behavior/contract lens
  - no runtime-enforced auto QA promise
- re-read `templates/codex/AGENTS.md` and `templates/codex/AGENTS.md.global` for correct source-of-truth placement

## Task

### AC1. Harden Execute Packets Around Live Context

Durable execute packets must describe the live execution boundary, not any historical checklist item.

#### TC1

`worker-report`, `advisor-handoff`, and `retry-packet` fail when no live `current_ac` exists.

#### TC2

If `tc_id` is required for the current packet, the helper fails when no live `current_tc` exists.

#### TC3

If `ac_id` or `tc_id` is provided, it must match the live current context instead of resolving any historical AC or TC from the checklist.

#### TC4

Packets cannot be written against a completed AC that is no longer current.

### AC2. Redefine QA As Behavior And Contract Review

QA must review whether the result will lead the LLM or agent system toward the intended behavior, not only whether the diff looks correct.

#### TC1

`templates/codex/skills/qa/SKILL.md` explicitly says QA reviews both:

- code and tests
- behavior and contract quality

#### TC2

The QA flow still keeps one cold reviewer and one main-LLM judgment stage.

#### TC3

The QA judgment section clearly says the main LLM must judge:

- code defects
- behavior-shaping defects
- contract and ownership defects

### AC3. Expand QA Handoff For Behavior And Contract Review

The QA handoff must give the reviewer enough context to review LLM-facing behavior changes without dumping the whole working conversation.

#### TC1

The QA handoff still includes code-review basics such as:

- task summary
- desired outcome
- scope and non-goals
- plan summary
- changed files or diff
- test or check results

#### TC2

The QA handoff adds short behavior-and-contract fields such as:

- behavior goal
- LLM reads or decision inputs
- LLM-owned decisions
- script-owned validation
- contract changes

#### TC3

The QA helper validates the new fields and removes internal runtime-policy leakage such as `verification_policy` from the reviewer packet.

### AC4. Keep Auto QA As A Skill-Level Continuation Rule

Auto QA should remain part of the LLM-operated workflow without turning scripts into the workflow controller.

#### TC1

`templates/codex/skills/execute/SKILL.md` says normal execute completion should continue into `$qa` when review inputs are ready.

#### TC2

The execute and QA docs do not claim that runtime scripts enforce the QA transition.

#### TC3

The QA docs still support explicit reruns, but the normal flow reads as:

```text
$planning
  -> $execute
  -> $qa
  -> commit
```

with the main LLM carrying that transition.

### AC5. Put Stable Workflow Policy In Stable Docs

Stable workflow rules should live in the top-level contract and stage skills, not drift into temporary global guidance.

#### TC1

`templates/codex/AGENTS.md` keeps the stable high-level workflow contract.

#### TC2

`templates/codex/AGENTS.md` says `$execute` leads into `$qa` before `commit` without exposing internal execute runtime details.

#### TC3

`templates/codex/AGENTS.md.global` no longer carries stable policy that should instead live in `AGENTS.md` or the skill files.

### AC6. Verify The New Boundaries

The final implementation must prove that the system is still LLM-led and that helper behavior matches the new contracts.

#### TC1

Changed Python helpers pass `python3 -m py_compile`.

#### TC2

Packet helper smoke tests prove that only live execute context can produce durable packets.

#### TC3

The updated QA docs and reviewer prompt clearly show a two-lens review:

- code lens
- behavior/contract lens

#### TC4

The final docs no longer imply that scripts own QA judgment or runtime-enforced auto QA.

## Execution Order

1. Tighten live-context validation in execute packet helpers.
2. Redefine QA purpose and reviewer focus around code plus behavior/contract review.
3. Expand the QA handoff schema and remove runtime-policy leakage.
4. Align execute and QA skill text around skill-level auto QA.
5. Move stable workflow policy into `AGENTS.md` and trim `AGENTS.md.global`.
6. Run helper verification and re-read the docs for ownership clarity.

## Open Risks

- If the new QA handoff fields are too abstract, the reviewer may get weaker rather than stronger.
- If the execute skill text is too soft, the main LLM may skip QA too easily.
- If the stable top-level contract becomes too detailed, it may leak internal runtime strategy again.

## Execute Handoff

- `task_id`: `qa-behavior-contract-redesign-and-checklist-hardening-2026-04-12`
- `plan_path`: `.everything-automate/plans/2026-04-12-qa-behavior-contract-redesign-and-checklist-hardening.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`:
  - The QA handoff may grow too wide if behavior and contract fields are not kept short.
  - Skill-level auto QA still depends on the main LLM following the skill text; it is not runtime-enforced.
  - If AGENTS.md and the skill files drift, the workflow contract may become unclear again.
