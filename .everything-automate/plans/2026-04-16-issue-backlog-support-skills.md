---
title: Issue Backlog Support Skills
status: approved
approval_state: approved
task_id: issue-backlog-support-skills-2026-04-16
plan_path: .everything-automate/plans/2026-04-16-issue-backlog-support-skills.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - explorer
verification_lane: mixed
open_risks:
  - `issue-capture` may become too chatty if it asks for too much before creating the issue.
  - `issue-pick` may drift into planning if its output is too detailed.
  - support-skill wording may blur the main workflow if the docs do not keep the boundary clear.
---

# Issue Backlog Support Skills

## Task Summary

Add two Codex support skills for GitHub issue backlog intake:

- `issue-capture`
- `issue-pick`

These skills should help users capture EA improvement ideas from other project sessions and later pull one backlog issue into `$brainstorming`.

## Desired Outcome

Have a small and clear support flow that:

- lets another project session create a real backlog GitHub issue in `yhyuntak/everything-automate`
- uses one simple label: `backlog`
- lets an EA repo session list open backlog issues and let the user pick one
- turns the picked issue into a brainstorming-ready note
- keeps the main workflow order unchanged:
  - `$brainstorming`
  - `$planning`
  - `$execute`
  - `$qa`

## In Scope

- add `templates/codex/skills/issue-capture/SKILL.md`
- add `templates/codex/skills/issue-pick/SKILL.md`
- update skill docs so the new support skills are visible
- update install docs so the installed skill set stays accurate
- record the settled workflow choice in a short decision note

## Non-Goals

- add runtime scripts for issue handling
- add duplicate detection
- add more labels than `backlog`
- add milestone, assignee, or board automation
- make `issue-pick` jump straight into `$planning` or `$execute`
- redesign the main workflow

## Design Direction

Use this support flow:

```text
other project session
  -> issue-capture
  -> create backlog issue

EA repo session
  -> issue-pick
  -> user picks one issue
  -> reshape it into brainstorming input
  -> $brainstorming
```

Keep the v1 contract simple:

- target repo is fixed to `yhyuntak/everything-automate`
- label is fixed to `backlog`
- `issue-capture` uses a short fixed issue template
- `issue-pick` shows a short backlog list, lets the user choose, reads the issue, and turns it into a brainstorming-ready note

## Relevant Accepted Decisions

This work should respect:

- `DEC-004` Stable Workflow Contract Lives In AGENTS And Skills

## Test Strategy

The lane is `mixed`.

Verification should include:

- re-read the new skill text for simple English and clear boundaries
- verify that `issue-capture` owns capture and `issue-pick` owns backlog intake into `$brainstorming`
- re-read updated docs so main workflow and support skills are not mixed together
- run `python3 scripts/install_codex_local_test.py`
- confirm the local install manifest includes the new skill names

## Task

### AC1. Add The `issue-capture` Skill

The repo must contain a support skill that creates a real backlog GitHub issue for EA improvement ideas.

#### TC1

`templates/codex/skills/issue-capture/SKILL.md` exists.

#### TC2

The skill text clearly says:

- when to use it
- when not to use it
- the target repo
- the `backlog` label rule
- the fixed issue body template

#### TC3

The skill says the result should include the created issue number and URL.

### AC2. Add The `issue-pick` Skill

The repo must contain a support skill that pulls one backlog issue into a brainstorming-ready state.

#### TC1

`templates/codex/skills/issue-pick/SKILL.md` exists.

#### TC2

The skill text clearly says it should:

- list open backlog issues
- show a short shortlist to the user
- let the user pick one
- read the issue body and comments
- reshape the result into a brainstorming-ready note

#### TC3

The skill clearly says it should stop at `$brainstorming` and not skip ahead into `$planning` or `$execute`.

### AC3. Update Template Docs

The installed-skill docs must describe the new support skills without changing the main workflow contract.

#### TC1

`templates/codex/skills/README.md` describes the new support skills separately from the main workflow skills.

#### TC2

`templates/codex/INSTALL.md` reflects the new installed skill set correctly.

#### TC3

Any top-level workflow note that mentions the new skills keeps them as support surfaces, not main workflow stages.

### AC4. Record The Settled Workflow Choice

The repo must keep a short decision note for the new GitHub backlog intake rule.

#### TC1

A new decision note exists for the `issue-capture` and `issue-pick` split.

#### TC2

The decision note explains that:

- backlog intake is GitHub-issue based
- `issue-capture` writes backlog issues
- `issue-pick` reads backlog issues and feeds `$brainstorming`
- the main workflow order does not change

## Implementation Order

1. Add the plan and decision note.
2. Add `issue-capture`.
3. Add `issue-pick`.
4. Update skill and install docs.
5. Run local install verification and re-read the changed text.

## Final Handoff Block

- `task_id`: `issue-backlog-support-skills-2026-04-16`
- `plan_path`: `.everything-automate/plans/2026-04-16-issue-backlog-support-skills.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `recommended_mode`: `execute`
- `recommended_agents`: `explorer`
- `verification_lane`: `mixed`
- `open_risks`:
  - `issue-capture` may become too chatty if it asks for too much before creating the issue.
  - `issue-pick` may drift into planning if its output is too detailed.
  - support-skill wording may blur the main workflow if the docs do not keep the boundary clear.
