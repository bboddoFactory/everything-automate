---
title: Workbench M2.5 Uses Graph-First Stable Interaction
status: accepted
date: 2026-04-27
decision_id: DEC-015
---

## Context

M2 created a functional read-only Workbench under `src/workbench/`.
It proved source loading, skill and agent discovery, detected edges, and node inspection.

The user judged the UI as too far from the accepted reference image.
The gap is visual and interaction quality, not the graph source contract.

## Decision

M2.5 will keep the M2 graph contract and redesign the Workbench as a graph-first visual map.

It will use:

- stable deterministic graph layout, not live force simulation
- hub-centered node placement with high-degree nodes nearer the center
- frontend-owned view state for hover, selection, zoom, pan, fit, minimap, filters, and temporary node drag
- hidden-node filters for skill and agent types
- strong Browser Use visual verification against the reference structure

M2.5 may improve backend layout fields such as `x`, `y`, `size`, and `degree`.
It must not change node identity, edge identity, edge kind, or the source contract.

## Consequences

- The Workbench should look like a usable visual workbench, not a scrollable card map.
- The desktop view should have a narrow left navigation, source/filter rail, graph-dominant canvas, right inspector, graph controls, and minimap.
- Tablet and mobile must stay usable with drawers and a bottom-sheet inspector.
- Saved layouts, live physics, editing, apply-back, agent-run flows, hooks/runtime/support nodes, LLM edge detection, and non-Codex providers remain out of scope.

## Related Artifacts

- `.everything-automate/state/brainstorming/archive/20260427-084234-m25-workbench-graph-layout-interaction.md`
- `.everything-automate/decisions/DEC-014-workbench-m2-src-read-only-map.md`
- `src/workbench/`
