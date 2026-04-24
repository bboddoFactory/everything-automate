---
name: ea-upstream
description: Fix Everything Automate source from the current project session, then install the result into the global Codex runtime.
argument-hint: "upstream fix | shared harness fix | global install fix"
---

# ea-upstream

Use this skill when a shared Everything Automate harness problem shows up inside another project session and you want to fix the source now without losing the problem context.

Everything Automate is the source of truth for shared Codex harness assets.
The default runtime update surface is global `~/.codex`.

## Use When

Use `ea-upstream` when:

- a shared Everything Automate harness problem was discovered in the current project session
- the project session has the best context for the failure
- the fix belongs in the Everything Automate source
- you want to patch source, install globally, retest from the current project, then commit and push the source change

## Do Not Use When

Do **not** use `ea-upstream` when:

- the work is only local `.codex` cleanup
- the work is only sync mode or link mode
- the work is plugin marketplace packaging
- the fix belongs only to the current project and not to shared Everything Automate source
- the user has not confirmed that a shared upstream fix is the right path

If the work looks local-only, stop and use the project flow instead.

## Context Boundaries

Keep these contexts explicit at all times:

- problem context = current project
- edit context = Everything Automate source
- runtime context = global `~/.codex`

Do not blur those contexts together.

Do not fix the project-local `.codex` copy unless the user explicitly asked for that.

## Core Workflow

```text
[Capture Problem]
   |
   v
[Locate Everything Automate Source]
   |
   v
[Check Source Worktree]
   |
   v
[Patch Source]
   |
   v
[Gate Before Global Install]
   |
   +---- fail ----> [Stop And Ask]
   |
   v
[Install Global]
   |
   v
[Doctor Global Install]
   |
   v
[Gate Before Retest Acceptance]
   |
   +---- fail ----> [Stop And Ask]
   |
   v
[Retest From Current Project]
   |
   v
[Gate Before Commit And Push]
   |
   +---- fail ----> [Stop And Ask]
   |
   v
[Commit And Push Everything Automate]
   |
   v
[Aftercare Notes]
```

## 1. Capture Problem

Start from the current project session.

Record:

- what failed
- what the user expected
- which prompt, skill, or harness path was involved
- whether the problem came from a shared Everything Automate asset

Keep the failure context from the current project intact.

## 2. Locate Everything Automate Source

Use `/home/yhyuntak/workspace/everything-automate` as the default source checkout after verification.

Before editing, verify:

- the path exists
- the path is a git repo
- the expected template paths are present

If the path is not the expected repo, stop and ask before changing anything.

The edit context stays in the Everything Automate source checkout, not the current project.

## 3. Check Source Worktree

Run `git status --short` in the Everything Automate checkout before you patch.

Classify every dirty path as one of these:

- `related`
- `unrelated`
- `unclear`

Meaning:

- `related` means the file belongs to this upstream fix
- `unrelated` means the file belongs to another task
- `unclear` means ownership is not obvious yet

If any dirty file is `unrelated` or `unclear`, stop and ask before editing.

Do not silently absorb unrelated source changes into the fix.

## 4. Patch Source

Make the smallest source change that solves the shared harness problem.

Keep the diff scoped to the Everything Automate source files needed for the fix.

Do not turn this stage into cleanup work.
Do not fold in local `.codex` cleanup, sync, link, or plugin packaging work here.

## 5. Gate Before Global Install

Do not run global setup until both of these are true:

- the source diff is scoped enough to affect global runtime
- the global runtime risk is acceptable

If the diff is still too broad, stop and narrow it first.

If the risk is not acceptable, stop and ask.

## 6. Install Global

Update the global runtime from the Everything Automate source.

Use:

```bash
python3 scripts/install_global.py setup --provider codex
```

Keep this stage focused on runtime install, not on cleanup or packaging.

## 7. Doctor Global Install

Check the global install right after setup.

Use:

```bash
python3 scripts/install_global.py doctor --provider codex
```

If the source files changed after a verified setup and doctor run, rerun setup and doctor before accepting new evidence.

That rerun rule matters because the runtime can drift after the first verification.

## 8. Gate Before Retest Acceptance

Before you accept retest evidence from the current project, identify which runtime surface is active:

- global `~/.codex`
- project-local override

If a project-local override exists or is suspected, record that caveat.

Do not accept the retest as clean until the active runtime surface is known.

## 9. Retest From Current Project

Retest from the current project session so you keep the original failure context.

Use the project that exposed the issue as the test lens.

Record what changed in behavior after the global install.

Keep this retest tied to the current project, not to a fresh Everything Automate-only session.

### Rewind Retest Evidence

If you do a rewind-style retest, keep the evidence lightweight.

Template:

```text
rewind retest:
- rewound: <what was rewound>
- behavior change: <what changed>
- runtime surface believed active: <global ~/.codex | project-local override | unclear>
```

Use this only as a short evidence note.

## 10. Gate Before Commit And Push

Do not commit or push until all of these are true:

- a scoped source diff exists
- setup and doctor results are known
- the current-project retest result is recorded
- any local override caveat is recorded if present

Push happens only after this gate passes.

If any part is missing, stop and close the gap first.

## 11. Commit And Push Everything Automate

Commit and push the Everything Automate source change after the final gate passes.

Keep the commit focused on the upstream fix.

Do not add unrelated cleanup, sync/link, or plugin packaging work to the commit.

## 12. Aftercare Notes

Write down the final state in short notes:

- what source file changed
- what global install command ran
- what doctor reported
- what the current project retest showed
- whether a project-local override caveat existed
- whether the change was committed and pushed

Keep the note short and factual.

## Full Stage Summary

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
