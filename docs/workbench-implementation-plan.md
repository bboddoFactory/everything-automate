---
title: M2.5 Graph-First Read-Only Workbench
description: Current M2.5 Workbench plan for the graph-first read-only src/workbench/ visual map.
doc_type: plan
scope:
  - workbench
  - read-only graph
  - skill and agent surfaces
  - current M2 docs
covers:
  - src/workbench/
  - docs/workflow-map.md
  - README.md
---

# M2.5 Graph-First Read-Only Workbench

## Goal

Build the current Workbench under `src/workbench/` as a graph-first read-only map for local Codex skill and agent surfaces.

The Workbench is for inspection.
It does not edit files, apply patches, build work packages, or run agents.

## Run Command

Start the M2.5 Workbench with:

```bash
python3 -m src.workbench.server --host 127.0.0.1 --port 8765
```

Then open:

```text
http://127.0.0.1:8765/
```

## M2.5 Limits

The current Workbench is limited to:

- read-only viewing
- skill nodes and agent nodes only
- detected edges only
- one selected source at a time
- local source discovery from Codex-home-like roots
- graph-first camera, hover, selection, filters, minimap, and temporary node drag

The graph is not a general editor.
It does not expose write controls.

## What The Workbench Shows

The current M2.5 Workbench should show:

- a narrow icon rail at far left
- a source and filter rail
- a graph-dominant canvas
- a right inspector
- a top toolbar
- graph controls and a minimap inside the canvas
- compact skill and agent nodes only
- edges created from detected text matches

The graph is meant to feel quiet and stable.
It should help a user understand the current source, not change it.

## Source Rules

The Workbench should read one source at a time:

- Global: expanded `~/.codex`
- Local: repo-root `.codex` when present
- Custom: a user-provided root path

A source is valid only when it is Codex-home-like.
That means it has `skills/` and/or `agents/` directly under the root.

## Historical Note

Older POC drafts described the Workbench as an editing studio with apply, work-package, and agent-run features.
That was the old shape.
It is kept here only as history and is not current behavior.

## Current Doc Links

- `README.md`
  project overview and doc entry point
- `docs/README.md`
  current docs index
- `docs/workflow-map.md`
  current workflow map and Workbench guide
