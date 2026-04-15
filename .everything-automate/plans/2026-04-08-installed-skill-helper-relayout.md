---
title: Installed Skill Helper Relayout
status: draft
approval_state: draft
task_id: installed-skill-helper-relayout-2026-04-08
plan_path: .everything-automate/plans/2026-04-08-installed-skill-helper-relayout.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - explorer
  - plan-arch
  - plan-devil
verification_lane: docs-only
open_risks:
  - The current runtime edits may push the repo toward a shape that setup does not install.
  - If helper code is split badly, execute and qa may still depend on non-installed files.
---

# Installed Skill Helper Relayout

## Task Summary

Move execute and QA helper behavior into installed Codex template paths.

The goal is to stop depending on helper entrypoints that live only in `runtime/`.
If a helper is needed after setup, it must live under the installed template.

## Desired Outcome

Have a clear plan for:

- which helper scripts belong under `templates/codex/skills/execute/scripts/`
- which helper scripts belong under `templates/codex/skills/qa/scripts/`
- what, if anything, remains in `runtime/`
- how `execute` and `qa` call those helpers after setup
- how to remove or avoid non-installed runtime dependencies

## In Scope

- define the installed helper file layout
- define the execute helper command surface
- define the QA helper command surface
- define which current runtime behavior must move
- define what runtime code should be reduced or removed
- define required skill doc updates

## Non-Goals

- redesign brainstorming
- redesign planning
- redesign the user-facing execute loop itself
- build a full new packaging system
- keep a hidden shared engine just for convenience

## Decision Boundaries

- setup installs skills from `templates/codex/skills/*`
- installed skills must not depend on repo-only helper entrypoints
- if `execute` or `qa` calls a script directly, that script must be installed with the skill
- simple duplication is better than a hidden shared helper layer the user cannot reason about
- `runtime/` is not the place for installed skill behavior

## Design Direction

Follow this shape:

```text
templates/codex/skills/execute/
  -> SKILL.md
  -> scripts/
     -> init_checklist.py
     -> update_checklist.py

templates/codex/skills/qa/
  -> SKILL.md
  -> scripts/
     -> build_handoff.py
```

With this rule:

```text
if execute or qa needs to call it after setup
  -> the script lives under that installed skill
```

Do not keep a hidden repo-only helper entrypoint as the real dependency.

## Test Strategy

This is a structure-and-doc plan, so the test lane is `docs-only`.

Verification should confirm:

- the layout matches what setup installs
- execute and QA helper ownership is clear
- there is no required dependency on non-installed runtime entrypoints
- the wording stays simple

## Task

### AC1. Define Installed Helper Ownership

The plan must clearly say which helper scripts belong to `execute` and which belong to `qa`.

#### TC1

The plan shows an installed path for execute helpers.

#### TC2

The plan shows an installed path for QA helpers.

### AC2. Define Helper Commands

The plan must define the minimal commands each installed helper should support.

#### TC1

The execute helper surface covers the live checklist updates that `execute` needs.

#### TC2

The QA helper surface covers the review packet that `$qa` needs.

### AC3. Define What Leaves Runtime

The plan must clearly explain what current runtime behavior should move out.

#### TC1

The plan says that repo-only runtime entrypoints cannot remain the required installed dependency.

#### TC2

The plan leaves no confusion about whether a hidden shared engine will remain.

### AC4. Define Follow-Up Edits

The plan must list the files that will need changes next.

#### TC1

The plan includes execute and QA skill paths.

#### TC2

The plan includes installer or template paths only when they are truly needed.

## Execution Order

1. Confirm the installed template is the real dependency surface.
2. Define helper file ownership under `execute` and `qa`.
3. Define the minimal command surface for each helper.
4. Define what current runtime behavior must move or be dropped.
5. List the next files to edit.
6. Re-read for simple English.

## Open Risks

- The current runtime edits may push the repo toward a shape that setup does not install.
- If helper code is split badly, execute and qa may still depend on non-installed files.

## Execute Handoff

- `task_id`: `installed-skill-helper-relayout-2026-04-08`
- `plan_path`: `.everything-automate/plans/2026-04-08-installed-skill-helper-relayout.md`
- `approval_state`: `draft`
- `execution_unit`: `AC`
- `test_strategy`: `docs-only`
- `open_risks`:
  - `The current runtime edits may push the repo toward a shape that setup does not install.`
  - `If helper code is split badly, execute and qa may still depend on non-installed files.`
