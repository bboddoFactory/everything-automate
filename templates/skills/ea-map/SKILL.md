---
name: ea-map
description: Inspect the EA skill and agent graph, choose a workflow entry point, and open the read-only M2 Workbench when a graph view helps.
argument-hint: "<workflow question, skill graph question, or read-only workbench request>"
---

# ea-map

Use this when the user wants to understand or route the Everything Automate workflow itself.

`ea-map` is a support skill.
It is not a required stage in normal code work.

## Purpose

`ea-map` helps the user see and choose the right EA surface.

Its job is to:

- explain which skill should start the current request
- show which stages can be skipped
- show which inputs are missing
- inspect skill and agent connections
- open the local M2 Workbench when a graph view is useful
- keep the workflow as a graph, not a forced pipeline

## Use When

Use `ea-map` when:

- the user asks what skill to use
- the user asks how skills or agents connect
- the user wants to inspect harness structure
- the user wants to inspect the read-only M2 Workbench
- the user says the workflow is hard to hold in their head
- a skill may be too tightly coupled to an upstream stage
- a new skill, agent, or route is being considered

## Do Not Use When

Do not use `ea-map` when:

- the user already gave a clear implementation request
- the user already has an approved plan and wants execution
- the user wants QA on finished work
- the question is about product code rather than the EA workflow

In those cases, route to the right skill instead of staying in map mode.

## Core Rule

Skills should be independently enterable, but they must not guess past missing inputs.

That means:

```text
clear enough for this skill
  -> start here

missing only a small boundary
  -> create a lightweight local boundary

missing a serious upstream input
  -> route to the upstream skill
```

`ea-map` only reasons about skill and agent surfaces.

## Workbench

When a graph view would help, start the M2 Workbench with:

```bash
python3 -m src.workbench.server --host 127.0.0.1 --port 8765
```

Or use the thin launcher:

```bash
python3 scripts/ea_workbench.py
```

Then open:

```text
http://127.0.0.1:8765
```

The Workbench reads one selected Codex-home-like root at a time:

- Global: expanded `~/.codex`
- Local: repo-root `.codex` when present
- Custom: a user-provided root with direct `skills/` and/or `agents/`

Within that selected root, it reads:

- `skills/*/SKILL.md`
- `agents/*.toml`
- legacy `agents/*/AGENT.md` directories when present

The M2 Workbench is read-only.
It shows skill nodes and agent nodes only, with detected edges only.
The files are still the source of truth.
The UI is only a workbench for seeing and checking them.

The workbench exposes:

- one graph view for the selected source
- detected edges from matching skill and agent text
- a simple inspector for the current source

## Output

For a routing question, answer with:

- recommended entry skill
- why
- skipped stages
- missing inputs, if any
- likely next skill

For a graph or workbench question, answer with:

- relevant nodes
- connected agents
- likely related files
- safest next read path

Keep the answer short and practical.
