---
title: M2.5 Workbench Graph-First UI
task_id: m25-workbench-graph-first-ui-2026-04-27
plan_path: .everything-automate/plans/2026-04-27-m25-workbench-graph-first-ui.md
approval_state: approved
execution_unit: AC
test_strategy: mixed
source_brainstorming: .everything-automate/state/brainstorming/archive/20260427-084234-m25-workbench-graph-layout-interaction.md
related_decisions:
  - .everything-automate/decisions/DEC-014-workbench-m2-src-read-only-map.md
  - .everything-automate/decisions/DEC-015-workbench-m25-graph-first-interaction.md
---

# M2.5 Workbench Graph-First UI

## Task Summary

Improve the existing read-only `src/workbench/` UI so it looks and behaves like the accepted reference image.

This is a layout and interaction milestone.
It does not change the Workbench source or graph contract.

## Desired Outcome

The Workbench feels like a graph-first visual map:

- narrow left navigation
- source and filter rail
- graph-dominant canvas
- right inspector
- graph controls
- minimap
- stable hub-centered graph layout
- useful hover, click, pan, zoom, fit, node drag, and filter behavior

## In Scope

- Redesign `src/workbench/static/index.html`, `styles.css`, and `app.js` toward the reference image.
- Improve backend layout fields in `src/workbench/graph.py` only as needed for hub-centered layout.
- Keep `skill` and `agent` nodes only.
- Keep deterministic `detected` edges only.
- Add frontend-only view state for camera, hover, selection, filters, minimap, and temporary node drag.
- Add or update focused tests for graph layout data.
- Verify with Browser Use against desktop and responsive scenarios.
- Update Workbench docs if the visible behavior changes.

## Non-Goals

- No editing files from the Workbench.
- No apply-back or write approval flow.
- No agent-run or scenario-test execution.
- No hooks, runtime, support, or guidance nodes.
- No LLM-based edge detection.
- No saved layouts.
- No live force simulation.
- No provider support beyond Codex.
- No source contract, node identity, edge identity, or edge kind changes.
- No non-working Export placeholder.

## Design Direction

Use a stable deterministic graph with interactive camera behavior.

Backend responsibilities:

- keep source loading and graph facts stable
- keep `selection_id` and edge data stable
- provide deterministic `x`, `y`, `size`, and `degree` layout fields
- place high-degree nodes near the center
- keep a soft skill/agent bias without making two plain columns

Frontend responsibilities:

- own zoom, pan, fit, hover, selection, minimap, filters, and temporary node drag
- render nodes as compact visual graph nodes rather than large cards
- render connected edges with clear active and dim states
- keep the inspector selection-driven
- keep responsive layout usable

Exact M2.5 controls:

- top toolbar: Sources, Layout, Fit, Help, Menu
- graph controls: pan/select mode, zoom out, zoom level, zoom in, fit
- side filters: Skills checkbox, Agents checkbox
- inspector controls: collapse/close where responsive layout needs it

Every visible control must either work or be removed.
Do not add non-working placeholders.

## Test Strategy

Use a mixed strategy:

- unit-first for backend layout fields
- syntax/static checks for frontend files
- Browser Use visual and interaction checks for the actual UI
- docs/search checks for scope leaks

## Task

Build M2.5 graph-first read-only Workbench UI.

### AC1: Desktop Shell Matches Reference Structure

The desktop UI presents the same major zones as the reference image.

TC1.1: Browser Use desktop check shows a narrow left navigation, source/filter rail, graph-dominant canvas, right inspector, graph toolbar, graph controls, and minimap.

Use this concrete desktop visual pass list:

- server command: `python3 -m src.workbench.server --host 127.0.0.1 --port 8765`
- URL: `http://127.0.0.1:8765/?source=custom&path=/Users/yoohyuntak/.codex/worktrees/42b3/everything-automate/tests/fixtures/workbench/custom-codex-home`
- target desktop viewport: `1440x900` when the browser tool supports resizing; if not, use the active in-app viewport and state the limitation
- visible zones: narrow icon rail at far left, source/filter rail next, center canvas taking the largest width, right inspector, top toolbar, graph control cluster, minimap in the canvas bottom-right
- visual rules: graph nodes are compact circular or badge-like map nodes, not large rectangular cards; edges are visible curves/lines; canvas grid is visible; minimap is inside the canvas; inspector does not cover the main desktop graph
- capture one desktop screenshot or visible Browser Use screenshot evidence

TC1.2: Repo search shows no current edit/apply/agent-run controls and no non-working placeholder controls in the Workbench UI.

Run:

```bash
rg -n "Export|export|edit|apply|agent run|agent-run|work package|work-package|placeholder|coming soon" src/workbench/static docs/workbench-implementation-plan.md docs/workflow-map.md README.md
```

The search may only return historical non-goal docs, not current UI controls.

TC1.3: Text in compact controls, node labels, and inspector sections does not visibly overlap in the desktop Browser Use check.

### AC2: Hub-Centered Layout Data Exists

The backend produces deterministic layout fields that support a hub-centered graph.

TC2.1: Unit tests prove `x`, `y`, `size`, and `degree` are present for graph nodes.

TC2.2: Unit tests prove the highest-degree node is closer to the graph center than at least one lower-degree connected node in the fixture.

TC2.3: Unit tests prove deterministic repeatability by building the same fixture graph twice and comparing node layout fields and sorted edge identities.

TC2.4: Unit tests prove the layout is not two plain columns by checking at least one skill and one agent have x positions inside the center band while still preserving a soft type bias on average.

TC2.5: Unit tests prove node identity, edge identity, edge kind, and source contract remain unchanged.

### AC3: Graph Camera And Node Interaction Work

The frontend supports the core map interactions.

TC3.1: Browser Use check proves Fit recenters visible nodes into the canvas.

Use the same custom fixture URL as TC1.1.
Batch TC3 checks in one browser session.

TC3.2: Browser Use check proves zoom in and zoom out change the graph scale without detaching edges from nodes.

TC3.3: Browser Use check proves dragging the empty canvas pans the graph.

TC3.4: Browser Use check proves dragging a node moves it for the current session and its connected edges follow.

TC3.5: Browser Use check proves hover highlights one-hop neighbors and dims unrelated nodes without changing the inspector.

TC3.6: Browser Use check proves click pins selection and updates the inspector.

Required Browser Use evidence for AC3:

- after Fit, all visible nodes are inside the canvas and not hidden behind side panels
- after zoom in/out, the displayed zoom level changes and edges remain visually connected to node centers
- after background drag, the graph moves while the side panels remain fixed
- after node drag, that node moves and at least one connected edge endpoint follows
- after hover, one-hop nodes/edges are emphasized and the inspector content stays on the previously selected node or empty state
- after click, inspector title/name/path changes to the clicked node

### AC4: Filters, Inspector, And Minimap Are Useful

The supporting UI helps the user inspect the graph quickly.

TC4.1: Browser Use check proves skill and agent filters hide nodes and related edges.

Use the same custom fixture URL as TC1.1.
Batch TC4 checks with AC3 when practical.

TC4.2: Browser Use check proves hiding a selected node clears selection and returns the inspector to the empty state.

TC4.3: Browser Use check proves the inspector shows selected-node identity, relative path, aliases, degree, and incoming/outgoing edge evidence.

TC4.4: Browser Use check proves the minimap shows graph nodes plus a viewport rectangle.

Required Browser Use evidence for AC4:

- unchecking Skills hides skill nodes and edges attached only to hidden nodes
- unchecking Agents hides agent nodes and edges attached only to hidden nodes
- rechecking both restores the full graph without reloading the page
- minimap remains visible and its viewport rectangle changes after pan or zoom
- inspector separates incoming and outgoing detected edges or otherwise labels direction clearly

### AC5: Responsive Behavior And Docs Stay Honest

The Workbench is usable outside desktop and docs match the new behavior.

TC5.1: Browser Use tablet check proves the graph stays primary and side panels behave as drawers.

Tablet target:

- viewport: `900x900` when resizing is supported; otherwise use CSS/DOM breakpoint evidence
- side panels are hidden by default
- Sources button opens the source/filter drawer
- Inspector button or node click opens the inspector drawer
- graph canvas remains the main visible area when drawers are closed

TC5.2: Browser Use mobile check proves the graph stays primary and the inspector appears as a bottom sheet after selecting a node.

Mobile target:

- viewport: `390x844` when resizing is supported; otherwise use CSS/DOM breakpoint evidence
- source rail is hidden behind a Sources control
- selecting a node opens an inspector bottom sheet
- bottom sheet can close without clearing the loaded graph
- compact controls do not overlap the top toolbar or bottom sheet

TC5.3: `python3 -m unittest discover -s tests -p 'test_workbench*.py'` passes.

TC5.4: `python3 -m py_compile $(find src/workbench -name '*.py' -print) scripts/ea_workbench.py` passes.

TC5.5: `node --check src/workbench/static/app.js` passes.

TC5.6: `git diff --check` passes.

TC5.7: Workbench docs describe the graph-first M2.5 UI without claiming editing, apply-back, agent-run, live force simulation, or saved layouts.

Run:

```bash
rg -n "live force|force simulation|saved layout|saved layouts|edit files|apply-back|agent-run|agent run|scenario-test|scenario test" README.md docs/README.md docs/workbench-implementation-plan.md docs/workflow-map.md templates/skills/ea-map/SKILL.md
```

Matches must be non-goals or historical notes only.

## Execution Order

1. Update backend layout tests and layout fields for hub-centered graph data.
2. Redesign the static shell and visual CSS toward the reference structure.
3. Add frontend graph camera state, transforms, fit, zoom, pan, and node drag.
4. Add hover, selection, hidden filters, inspector evidence, and minimap behavior.
5. Update docs and run automated checks.
6. Run Browser Use visual and interaction verification.
7. Build QA handoff and enter `$ea-qa`.

## Open Risks

- Browser Use may not provide exact viewport resizing; if so, use the in-app active viewport plus CSS/DOM breakpoint evidence and be explicit.
- The reference image is in the conversation, not committed in the repo; visual verification must compare against the visible conversation baseline.
- Frontend transform math can detach SVG edges from HTML nodes if node and edge transforms diverge.
- The worktree contains unrelated dirty files from earlier work; M2.5 staging must stay scoped.

## Execute Handoff

- `task_id`: `m25-workbench-graph-first-ui-2026-04-27`
- `plan_path`: `.everything-automate/plans/2026-04-27-m25-workbench-graph-first-ui.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`: Browser Use viewport limits, reference image not in repo, transform math, mixed dirty worktree
