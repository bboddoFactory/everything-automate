---
title: Decision Log Surface For Session Continuity
status: draft
approval_state: draft
task_id: decision-log-surface-for-session-continuity-2026-04-12
plan_path: .everything-automate/plans/2026-04-12-decision-log-surface-for-session-continuity.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - plan-arch
  - plan-devil
verification_lane: mixed
open_risks:
  - If decision notes become too long, they may turn into mini-specs and lose fast-recall value.
  - If plans and decisions repeat the same content, maintenance cost will go up.
  - If the decision rules are too weak, old sessions may still not be easy to recover after compaction.
---

# Decision Log Surface For Session Continuity

## Task Summary

Introduce a decision-log surface under `.everything-automate/` so settled choices survive compaction, agent switches, and long-running work more reliably than plan files alone.

## Desired Outcome

Have a follow-up change set that:

- creates `.everything-automate/decisions/` as a stable working-memory surface
- defines the difference between `plans/` and `decisions/`
- defines a small decision note format that is easy for humans and agents to scan
- adds enough guidance that future planning and execution can read decisions instead of re-arguing settled points
- seeds the new surface with the recent accepted decisions that shaped the Codex workflow work

## In Scope

- add `.everything-automate/decisions/`
- define decision-note purpose, fields, and lifecycle
- define when a choice belongs in a decision note versus a plan file
- decide naming and status rules for decision notes
- add a short index or README for the decision surface
- add initial decision notes for the already-settled workflow choices from recent work

## Non-Goals

- move long-term shipped product docs into `.everything-automate/`
- replace `.everything-automate/plans/`
- turn decision notes into full design specs
- build a full decision database or automation system
- require every small choice to become a decision note

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
- re-read the note template for simple English and fast recall
- check that each seed decision note is clearly different from a plan file
- check that recent settled workflow choices can be found in decision notes without reading full prior session history

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

### AC3. Define A Small Decision Note Format

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

### AC4. Seed The Surface With Recent Accepted Decisions

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

### AC5. Make The New Surface Easy To Use In Future Planning And Execute Work

Future work should be able to consume decisions without re-reading long prior sessions.

#### TC1

The guidance tells planning and execute work to consult relevant decision notes when a settled boundary already exists.

#### TC2

The new surface is simple enough that a future agent can quickly scan the current accepted decisions.

#### TC3

The structure leaves room for later indexing or automation without requiring it now.

## Execution Order

1. Create `.everything-automate/decisions/` and a short index or README.
2. Define the note format and plan-vs-decision split.
3. Add the first accepted decision notes from the recent Codex workflow work.
4. Re-read the new notes for brevity, clarity, and non-duplication.
5. Verify that a future session could recover the main settled choices quickly.

## Open Risks

- If the seed decision notes repeat too much plan detail, the surface will become noisy.
- If accepted and superseded states are not kept current, trust in the decision log will drop.
- If too many small choices are written down, signal-to-noise will get worse.

## Execute Handoff

- `task_id`: `decision-log-surface-for-session-continuity-2026-04-12`
- `plan_path`: `.everything-automate/plans/2026-04-12-decision-log-surface-for-session-continuity.md`
- `approval_state`: `draft`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`:
  - If decision notes become too long, they may turn into mini-specs and lose fast-recall value.
  - If plans and decisions repeat the same content, maintenance cost will go up.
  - If the decision rules are too weak, old sessions may still not be easy to recover after compaction.
