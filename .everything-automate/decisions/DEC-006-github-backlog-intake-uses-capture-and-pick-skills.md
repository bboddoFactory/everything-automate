---
title: GitHub Backlog Intake Uses Capture And Pick Skills
status: accepted
date: 2026-04-16
decision_id: DEC-006
---

## Context

EA improvement ideas can show up while working in other repositories.
Moving that context by hand into a separate EA session is slow and easy to skip.
The EA repo also needs a simple way to pull one backlog item into the normal in-session workflow without making the user browse GitHub manually each time.

## Decision

GitHub backlog intake should use two support skills:

- `issue-capture`
  - creates a real GitHub issue in `yhyuntak/everything-automate`
  - uses the `backlog` label
- `issue-pick`
  - reads open backlog issues
  - lets the user pick one
  - turns the picked issue into input for `$brainstorming`

These support skills do not replace the main workflow.
The main workflow order stays:

- `$brainstorming`
- `$planning`
- `$execute`
- `$qa`

## Consequences

- users can capture EA improvement ideas from other project sessions without moving the whole conversation
- backlog intake stays GitHub-issue based
- v1 keeps triage simple by using one label: `backlog`
- `issue-pick` stops at `$brainstorming` instead of jumping into later stages

## Related Plans Or Files

- .everything-automate/plans/2026-04-16-issue-backlog-support-skills.md
- templates/codex/skills/issue-capture/SKILL.md
- templates/codex/skills/issue-pick/SKILL.md
- templates/codex/skills/README.md
