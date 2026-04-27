# Codex Skills

This directory holds distributable skills for the Codex template.

Current active in-session workflow surface:

- `ea-north-star/`
- `ea-milestone/`
- `ea-brainstorming/`
- `ea-planning/`
- `ea-execute/`
- `ea-qa/`

`ea-north-star/` bootstraps a dedicated worktree, then locks a fuzzy target into one clear shared goal.
`ea-milestone/` splits a locked goal into ordered output milestones.
`ea-brainstorming/` turns one chosen code milestone into bounded Grace-led design brainstorming.
`ea-planning/` is downstream execution planning.
`ea-execute/` is downstream TC-first execution after an approved ea-planning handoff and before `$ea-qa`.
`ea-qa/` is the final cold-review gate before commit.

Support skills:

- `ea-setup/`
- `ea-doctor/`
- `ea-docs/`
- `ea-issue-capture/`
- `ea-issue-pick/`
- `ea-map/`
- `ea-upstream/`

`ea-setup/` is the setup and repair surface. Bootstrap installs it first.
`ea-doctor/` is the read-only health check surface.
`ea-docs/` sets up, checks, and maintains an LLM Wiki docs structure for project work.
`ea-issue-capture/` creates a real backlog GitHub issue in `bboddoFactory/everything-automate` from another project session.
`ea-issue-pick/` reads one open backlog issue and turns it into input for `$ea-brainstorming`.
`ea-map/` inspects the EA skill and agent graph and routes work to the smallest useful skill path. It can also point to the read-only M2 Workbench, which starts with `python3 -m src.workbench.server --host 127.0.0.1 --port 8765` or the thin launcher `python3 scripts/ea_workbench.py`.
`ea-upstream/` fixes shared Everything Automate harness issues from a project session.

Installed helper scripts live under the skill that uses them.

- `ea-execute/scripts/`
- `ea-qa/scripts/`

Workflow hooks live under:

- `templates/hooks.json`
- `templates/hooks/`
