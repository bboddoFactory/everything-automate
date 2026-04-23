---
title: Add Ea Upstream Skill
status: approved
approval_state: approved
task_id: ea-upstream-skill-2026-04-23
plan_path: .everything-automate/plans/2026-04-23-ea-upstream-skill.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - ea-harness-reviewer
verification_lane: mixed
source_blueprint: /home/yhyuntak/workspace/my-ai-buddy/.everything-automate/state/blueprint/archive/20260423-223511-ea-upstream-workflow.md
open_risks:
  - The skill edits a sibling source repo from a project session, so context boundaries must stay explicit.
  - Global setup changes runtime behavior for future Codex sessions.
  - Project-local `.codex` copies can hide whether retest used global `~/.codex`.
  - Push-by-default requires a clear evidence gate.
---

# Add Ea Upstream Skill

## Task Summary

Add a new Codex skill, `ea-upstream`, to Everything Automate.

The skill should guide a project session through fixing an Everything Automate harness issue upstream without losing the project-local context that revealed the issue.

## Desired Outcome

After this work:

- `templates/codex/skills/ea-upstream/SKILL.md` exists.
- The skill guides this flow:

```text
Capture Problem
  -> Locate Everything Automate Source
  -> Check Source Worktree
  -> Patch Source
  -> Gate Before Global Install
  -> Install Global
  -> Doctor Global Install
  -> Gate Before Retest Acceptance
  -> Retest From Current Project
  -> Gate Before Commit And Push
  -> Commit And Push Everything Automate
  -> Aftercare Notes
```

- The skill keeps two contexts visible:
  - problem context = current project
  - edit context = Everything Automate source
- The skill uses `/home/yhyuntak/workspace/everything-automate` as the default source checkout, after verification.
- The skill installs to global `~/.codex` by default.
- The skill does not make local `.codex` cleanup, sync/link, or plugin packaging part of the core workflow.
- Codex skill indexes and install docs mention `ea-upstream`.

## In Scope

- Add `templates/codex/skills/ea-upstream/SKILL.md`.
- Update `templates/codex/skills/README.md`.
- Update `templates/codex/INSTALL.md`.
- Update `templates/codex/AGENTS.md` only if needed to list the new support skill.
- Add or update a short decision note for the accepted workflow choice.
- Verify global install and doctor include the new skill.

## Non-Goals

- Do not build a local `.codex` cleanup skill.
- Do not design sync/link mode.
- Do not add a plugin marketplace flow.
- Do not change `ea-north-star`, `ea-blueprint`, `ea-planning`, `ea-execute`, or `ea-qa` behavior.
- Do not add new scripts unless the skill cannot be expressed clearly without one.
- Do not change project-specific local `.codex` assets.

## Design Direction

Create a procedural skill.

The skill should be explicit about repo ownership:

```text
problem context = current project
edit context = Everything Automate source
runtime context = global ~/.codex
```

It should treat global setup as the normal runtime update path:

```bash
python3 scripts/install_global.py setup --provider codex
python3 scripts/install_global.py doctor --provider codex
```

It should contain three gates:

```text
[Before Global Install]
- source diff is scoped enough to affect global runtime
- global runtime risk is acceptable

[Before Retest Acceptance]
- identify whether current project uses global ~/.codex or project-local override
- record any local override caveat

[Before Commit And Push]
- scoped source diff exists
- setup/doctor result is known
- current-project retest result is recorded
- local override caveat is recorded if present
```

Dirty Everything Automate worktree handling:

- classify dirty files as `related`, `unrelated`, or `unclear`
- `related` means part of this upstream fix
- `unrelated` means belongs to another task
- `unclear` means ownership is uncertain
- stop and ask when any dirty file is `unrelated` or `unclear`

Rewind retest evidence stays lightweight.
The note must include:

- what was rewound
- what behavior changed
- which runtime surface was believed active

## Test Strategy

Strategy: `mixed`

Use documentation, install, and scenario checks:

- Read `templates/codex/skills/ea-upstream/SKILL.md` and confirm it contains the expected stages and gates.
- Confirm the skill tells the agent to keep problem, edit, and runtime contexts separate.
- Confirm the skill includes dirty-file classification.
- Confirm the skill includes retest runtime-surface handling.
- Confirm the skill includes final evidence gate before commit/push.
- Confirm `templates/codex/skills/README.md` lists `ea-upstream`.
- Confirm `templates/codex/INSTALL.md` lists `ea-upstream` in installed skills.
- Run global setup into a temp Codex home and doctor it.
- Confirm the temp Codex home contains `skills/ea-upstream/SKILL.md`.
- Run `git diff --check`.
- Run harness QA after implementation.

## Task

### AC1: Add The `ea-upstream` Skill

`ea-upstream` exists as a Codex skill and explains when to use it.

#### TC1.1

Read `templates/codex/skills/ea-upstream/SKILL.md`.

Expected evidence:

- Front matter has `name: ea-upstream`.
- Description says it fixes Everything Automate source from the current project session.
- It says Everything Automate is the source of truth.
- It says global `~/.codex` is the default runtime update surface.

#### TC1.2

Read the skill's `Use When` and `Do Not Use When` sections.

Expected evidence:

- Use when a shared Everything Automate harness problem is discovered inside another project session and should be fixed now.
- Do not use for local `.codex` cleanup, sync-only/link-only work, plugin marketplace work, or project-local-only fixes.

### AC2: Encode The Upstream Workflow Stages

The skill gives a clear procedural flow for the full upstream loop.

#### TC2.1

Read the skill's core flow.

Expected evidence:

- It includes these stages in order:
  - Capture Problem
  - Locate Everything Automate Source
  - Check Source Worktree
  - Patch Source
  - Gate Before Global Install
  - Install Global
  - Doctor Global Install
  - Gate Before Retest Acceptance
  - Retest From Current Project
  - Gate Before Commit And Push
  - Commit And Push Everything Automate
  - Aftercare Notes

#### TC2.2

Read the source-location instructions.

Expected evidence:

- Default checkout path is `/home/yhyuntak/workspace/everything-automate`.
- The skill says to verify the path is a git repo and has expected template paths before editing.

### AC3: Preserve Context Boundaries And Dirty Worktree Safety

The skill makes repo ownership and dirty changes explicit.

#### TC3.1

Read the context-boundary section.

Expected evidence:

- It defines:
  - problem context = current project
  - edit context = Everything Automate source
  - runtime context = global `~/.codex`
- It warns not to fix the project-local `.codex` copy unless explicitly asked.

#### TC3.2

Read the dirty-worktree rule.

Expected evidence:

- It requires `git status --short` in the Everything Automate checkout.
- It classifies dirty files as `related`, `unrelated`, or `unclear`.
- It stops and asks when any dirty file is `unrelated` or `unclear`.

### AC4: Add The Three Safety Gates

The skill prevents global install, retest acceptance, and push from happening on weak evidence.

#### TC4.1

Read `Gate Before Global Install`.

Expected evidence:

- It requires a scoped source diff.
- It says global runtime risk must be acceptable before running setup.

#### TC4.2

Read `Gate Before Retest Acceptance`.

Expected evidence:

- It requires identifying whether the current project is using global `~/.codex` or a project-local override.
- It requires recording any local override caveat before accepting retest evidence.

#### TC4.3

Read `Gate Before Commit And Push`.

Expected evidence:

- It requires scoped source diff evidence.
- It requires setup/doctor result.
- It requires current-project retest result.
- It requires local override caveat if present.
- It says push happens only after this gate passes.

### AC5: Define Install, Doctor, Retest, And Rewind Evidence

The skill says how to update runtime and record lightweight verification.

#### TC5.1

Read the install and doctor instructions.

Expected evidence:

- Setup command is `python3 scripts/install_global.py setup --provider codex`.
- Doctor command is `python3 scripts/install_global.py doctor --provider codex`.
- Setup and doctor normally run once before commit/push.
- They run again if source files change after verified setup/doctor.

#### TC5.2

Read the retest evidence instructions.

Expected evidence:

- Rewind retest is optional interactive verification, not required.
- Rewind evidence records what was rewound, what behavior changed, and which runtime surface was believed active.

### AC6: Update Codex Skill Index And Install Docs

The new skill is discoverable and install documentation is current.

#### TC6.1

Read `templates/codex/skills/README.md`.

Expected evidence:

- `ea-upstream/` is listed as a support skill.
- Its description says it fixes shared Everything Automate harness issues from a project session.

#### TC6.2

Read `templates/codex/INSTALL.md`.

Expected evidence:

- Current support skills include `ea-upstream`.
- The global setup skill materialization list includes `ea-upstream`.

#### TC6.3

Run global setup into a temp Codex home and doctor it.

Expected evidence:

- Doctor reports missing assets = 0.
- Temp Codex home contains `skills/ea-upstream/SKILL.md`.

## Execute Handoff

Use `$ea-execute` after approval.

Start with AC1.

Keep implementation scoped to Everything Automate source files.
Do not modify current project `.codex` assets as part of this plan.
