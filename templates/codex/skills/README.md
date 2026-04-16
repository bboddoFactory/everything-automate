# Codex Skills

This directory holds distributable skills for the Codex template.

Current active in-session workflow surface:

- `brainstorming/`
- `planning/`
- `execute/`
- `qa/`

`brainstorming/` is upstream ideation and design shaping.
`planning/` is downstream execution planning.
`execute/` is downstream TC-first execution after an approved planning handoff and before `$qa`.
`qa/` is the final cold-review gate before commit.

Support skills:

- `issue-capture/`
- `issue-pick/`

`issue-capture/` creates a real backlog GitHub issue in `yhyuntak/everything-automate` from another project session.
`issue-pick/` reads one open backlog issue and turns it into input for `$brainstorming`.

Installed helper scripts live under the skill that uses them.

- `execute/scripts/`
- `qa/scripts/`

Other workflow skills should not be added here until their contracts are explicitly agreed.
