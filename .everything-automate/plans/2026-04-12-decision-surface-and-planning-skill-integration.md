---
title: Decision Surface And Planning Skill Integration
status: approved
approval_state: approved
task_id: decision-surface-and-planning-skill-integration-2026-04-12
plan_path: .everything-automate/plans/2026-04-12-decision-surface-and-planning-skill-integration.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - plan-arch
  - plan-devil
verification_lane: mixed
open_risks:
  - If the planning skill writes decision notes too often, the decision surface will become noisy.
  - If the planning skill does not read prior decisions early enough, repeated discussion may still happen.
  - If plans and decisions duplicate the same details, maintenance cost will rise.
---

# Decision Surface And Planning Skill Integration

## Task Summary

Introduce a decision-log surface under `.everything-automate/` and wire the planning workflow to use it so settled choices survive compaction and future sessions do not need to rediscover the same decisions.

## Desired Outcome

Have a follow-up change set that:

- creates `.everything-automate/decisions/` as a stable working-memory surface
- defines the difference between `plans/` and `decisions/`
- updates the planning skill so it reads relevant accepted decisions before writing a new plan when they matter
- updates the planning skill so it creates or updates a decision note when a meaningful choice becomes settled during planning
- seeds the new surface with the recent accepted Codex workflow decisions

## In Scope

- add `.everything-automate/decisions/`
- define decision-note purpose, format, naming, and status rules
- define when planning should read decision notes
- define when planning should create or update decision notes
- update `templates/codex/skills/planning/SKILL.md`
- add a short index or README for the decision surface
- add initial decision notes for the already-settled Codex workflow choices

## Non-Goals

- replace `.everything-automate/plans/`
- turn decision notes into full design specs
- require every small implementation detail to become a decision note
- make execute or qa the primary creators of decision notes
- build a full automation or database layer for decisions

## Design Direction

Use this split:

```text
.everything-automate/
  -> plans/
     - execution prep
     - Task -> AC -> TC
     - current work handoff

  -> decisions/
     - settled choices
     - why they were chosen
     - what stays true unless changed later
```

Use this workflow rule:

```text
$brainstorming
  -> explore options
  -> no decision note yet

$planning
  -> read relevant accepted decisions if a settled boundary already exists
  -> settle direction for this work
  -> create or update decision note if a meaningful choice becomes accepted
  -> write plan

$execute / $qa
  -> only update a decision note when a prior decision is clearly changed, replaced, or superseded
```

Use this rule of thumb:

- `plan` answers: how do we execute this work now?
- `decision` answers: what did we already choose, and why?

Decision notes should stay short and high-signal.
They should support fast recall after compaction.
They should not become long narrative documents.

## Test Strategy

The lane is `mixed`.

Verification should include:

- create the new `decisions/` directory and any small index file cleanly
- re-read the planning skill text for:
  - when to read decision notes
  - when to create or update a decision note
  - when not to write one
- re-read the note template for simple English and fast recall
- check that each seed decision note is clearly different from a plan file
- check that a future planning session could recover recent accepted choices from decision notes without reading full prior session history

## Task

### AC1. Introduce A Decision Surface Under `.everything-automate`

The repo should have a clear place for working-memory decisions that is separate from plan files.

#### TC1

A new `.everything-automate/decisions/` directory exists.

#### TC2

The new directory includes a short index or README that explains what belongs there.

#### TC3

The decision surface clearly reads as working memory for future sessions and agents, not as shipped docs.

### AC2. Define The Difference Between Plans And Decisions

The system should not make agents guess whether a settled choice belongs in a plan or a decision note.

#### TC1

The new guidance clearly says that plans are for execution handoff and decisions are for settled choices.

#### TC2

The guidance includes simple rules for when to write or update a decision note.

#### TC3

The guidance includes simple rules for when not to create a decision note.

### AC3. Integrate Decision Handling Into The Planning Skill

Planning should be the main stage that creates and maintains decision notes.

#### TC1

`templates/codex/skills/planning/SKILL.md` tells planning to read relevant accepted decisions when a settled boundary already exists.

#### TC2

`templates/codex/skills/planning/SKILL.md` tells planning to create or update a decision note when a meaningful choice becomes accepted during planning.

#### TC3

The planning guidance clearly says brainstorming should not write decision notes yet.

#### TC4

The planning guidance clearly says execute and qa only update a decision note when an accepted decision is clearly changed or superseded.

### AC4. Define A Small Decision Note Format

Decision notes should be short, durable, and easy to scan after compaction.

#### TC1

A standard note format exists with fields such as:

- title
- status
- date
- decision id
- context
- decision
- consequences
- related plans or files

#### TC2

The format stays short enough for fast recall and does not turn into a full spec template.

#### TC3

The format supports later states such as accepted, superseded, or dropped when needed.

### AC5. Seed The Surface With Recent Accepted Decisions

The new surface should be useful immediately, not only after future work.

#### TC1

At least the recent Codex workflow decisions are recorded in decision notes.

#### TC2

Seed decisions include the choices that materially shaped the current system, such as:

- scripts are state and validation helpers, not behavior owners
- QA is behavior and contract review, not only code review
- auto QA is a skill-level workflow rule, not runtime-enforced orchestration
- stable workflow contract lives in `templates/codex/AGENTS.md` and skill files

#### TC3

The seed notes are short and point back to related plan artifacts when useful.

### AC6. Make The New Surface Easy To Use In Future Planning Work

Future work should be able to consume decisions without re-reading long prior sessions.

#### TC1

The guidance tells future planning work to consult relevant decision notes before reopening a settled boundary.

#### TC2

The new surface is simple enough that a future agent can quickly scan the current accepted decisions.

#### TC3

The structure leaves room for later indexing or automation without requiring it now.

## Execution Order

1. Create `.everything-automate/decisions/` and a short index or README.
2. Define the note format and the plan-vs-decision split.
3. Update the planning skill with decision read and write rules.
4. Add the first accepted decision notes from the recent Codex workflow work.
5. Re-read the new notes and planning skill text for brevity, clarity, and non-duplication.
6. Verify that a future planning session could recover the main settled choices quickly.

## Open Risks

- If the planning skill writes decision notes too often, the decision surface will become noisy.
- If accepted and superseded states are not kept current, trust in the decision log will drop.
- If plans and decisions repeat too much of the same detail, the surface will lose value.

## Execute Handoff

- `task_id`: `decision-surface-and-planning-skill-integration-2026-04-12`
- `plan_path`: `.everything-automate/plans/2026-04-12-decision-surface-and-planning-skill-integration.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`:
  - If the planning skill writes decision notes too often, the decision surface will become noisy.
  - If the planning skill does not read prior decisions early enough, repeated discussion may still happen.
  - If plans and decisions duplicate the same details, maintenance cost will rise.
