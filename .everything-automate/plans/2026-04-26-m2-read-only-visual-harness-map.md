---
title: M2 Read-Only Visual Harness Map
status: approved
date: 2026-04-26
task_id: m2-read-only-visual-harness-map-2026-04-26
source_milestone: M2 Read-Only Visual Harness Map V1
approval_state: approved
execution_unit: AC
test_strategy: mixed
---

# Task Summary

Build the first real Workbench map for the M1 source contract.

The new Workbench should live under `src/workbench/`, replace the old POC UI, and show a read-only visual graph of local Codex `skill` and `agent` surfaces.

# Desired Outcome

A user can open the Workbench, choose Global, Local, or Custom Codex-home-like source, see a stable graph map of discovered skills and agents, click nodes, and inspect details without any write path.

# In Scope

- Create `src/workbench/` as the official Workbench source area.
- Add a small Python server and static HTML/CSS/JS UI.
- Support one selected source at a time:
  - Global: expanded `~/.codex`
  - Local: repo-root `.codex` when present
  - Custom: user-provided root path
- Treat a source as Codex-home-like only when it has `skills/` and/or `agents/` directly under the root.
- Discover only `skill` and `agent` surfaces.
- Use fixed source ids:
  - `global-codex-home`
  - `local-codex-home`
  - `custom-codex-home`
- Use M1 `selection_id` exactly:
  - `${source_id}:${surface_type}:${logical_name}:${relative_path}`
- Create deterministic script-based `detected` edges only.
- Compute a precomputed Tidy Map with `x`, `y`, `size`, and `degree`.
- Render a screenshot-inspired read-only graph UI with source rail, graph canvas, and inspector.
- Add light deterministic UI motion for load, selection, and edge emphasis.
- Remove the old `workbench/` POC folder.
- Remove `scripts/ea_workbench.py`, or replace it with only a thin launcher that imports the new `src/workbench/` entrypoint.
- Update the user-facing Workbench docs in `README.md`, `docs/README.md`, `docs/workbench-implementation-plan.md`, and `docs/workflow-map.md` when they mention the old POC or old write features.

# Non-Goals

- No editing.
- No apply-back.
- No work packages.
- No agent scenario tests.
- No hooks.
- No runtime/support/guidance/setup nodes.
- No route, fallback, reference, or LLM-suggested edge kinds.
- No arbitrary template or repo scanning.
- No Node, Vite, or frontend build system.
- No live force-directed graph simulation.

# Design Direction

Use a Python plus static frontend shape.

Suggested structure:

- `src/workbench/__init__.py`
- `src/workbench/graph.py`
- `src/workbench/server.py`
- `src/workbench/static/index.html`
- `src/workbench/static/app.js`
- `src/workbench/static/styles.css`

Keep source discovery and graph JSON in Python.
Keep responsive rendering and interactions in static JavaScript and CSS.

Source selection contract:

- Server command: `python3 -m src.workbench.server --host 127.0.0.1 --port 8765`
- Browser URL: `http://127.0.0.1:8765/`
- Graph API:
  - `GET /api/graph?source=global`
  - `GET /api/graph?source=local`
  - `GET /api/graph?source=custom&path={absolute-or-expanded-root-path}`
- The Custom source path is entered in the source rail and sent as the `path` query value.
- Invalid sources return HTTP 400 with JSON `ok: false` and error code `invalid_source`.
- The UI must show an invalid-source state and must not silently fall back to another source.

The UI should follow the accepted graph-map screenshot direction:

- quiet workbench feel
- left source rail
- center graph canvas
- right inspector
- compact node cards
- deeper details in inspector
- crisp edges
- no editing controls

Tidy Map rules:

- Use type bands as the stable frame: skills left, agents right.
- Calculate node degree from incoming plus outgoing `detected` edges.
- Sort within each type by degree descending, then `selection_id` ascending.
- Place high-degree nodes closer to the visual center.
- Make high-degree nodes slightly larger.
- Run exactly two deterministic ordering passes based on connected-neighbor positions.
- Use `selection_id` as the final tie-breaker.
- Include computed `x`, `y`, `size`, and `degree` in graph JSON.

Detected-edge match rules:

- Scan the source surface text, including Markdown frontmatter when present.
- Match target `logical_name`, target `name`, and target `aliases`.
- Use case-insensitive literal matching.
- Use simple token boundaries: the character before and after the matched term must be absent or not one of `A-Z`, `a-z`, `0-9`, `_`, or `-`.
- De-duplicate candidate terms by lowercase text before matching.
- Keep one edge per source-target pair.
- Direction is from the surface whose text contains the match to the target surface that was mentioned.

# Test Strategy

Use a mixed strategy:

- backend fixture checks for source discovery, identity, edges, invalid sources, and layout fields
- Python syntax checks
- local server startup check
- Browser Use checks for rendering, node inspection, responsive layout, and absence of write controls

Expected check commands:

- `python3 -m unittest discover -s tests -p 'test_workbench*.py'`
- `python3 -m py_compile $(find src/workbench -name '*.py' -print) $(test -f scripts/ea_workbench.py && printf '%s\n' scripts/ea_workbench.py)`
- `python3 -m src.workbench.server --host 127.0.0.1 --port 8765`

Fixture roots:

- `tests/fixtures/workbench/custom-codex-home`
- `tests/fixtures/workbench/local-repo/.codex`
- `tests/fixtures/workbench/invalid-source`

Browser and responsive evidence:

- Use Browser Use on the active in-app browser viewport.
- If Browser Use viewport resizing is unavailable, record that limit and verify responsive behavior with the live available viewport plus CSS/DOM breakpoint checks.
- Desktop layout contract: CSS grid has source rail, graph canvas, and inspector columns above the tablet breakpoint.
- Tablet layout contract: `max-width: 1100px` shows drawer buttons and drawer panels.
- Mobile layout contract: `max-width: 720px` uses graph plus bottom-sheet inspector behavior.

# Task

## AC1: Official Workbench Source Replaces The POC

The Workbench implementation lives under `src/workbench/`, and the old POC is no longer the implementation base.

### TCs

- `find src/workbench -maxdepth 3 -type f | sort` shows the new server, graph code, and static assets.
- `test ! -d workbench` passes after implementation.
- `scripts/ea_workbench.py` is either absent or is a thin launcher that imports from `src/workbench/`; it must not contain the old POC server, edit/apply handlers, or graph model.
- Repo search under `src/workbench/` and `scripts/ea_workbench.py` finds no live write endpoints or write controls:
  - no `/api/apply`
  - no `/api/preview`
  - no `/api/agent/start`
  - no `contenteditable`
  - no `<textarea`
  - no user-facing `Apply`, `Save`, `Edit`, `Run Agent`, or `Work package` controls.

## AC2: Source Discovery Follows The M1 Contract

The backend can read Global, Local, and Custom Codex-home-like roots and discover only skills and agents.

### TCs

- A fixture Custom root with `skills/` and `agents/` returns only `skill` and `agent` nodes.
- `GET /api/graph?source=global` resolves to expanded `~/.codex` and returns source id `global-codex-home`.
- A backend check using `tests/fixtures/workbench/local-repo/.codex` as the repo-local `.codex` root returns source id `local-codex-home`.
- `GET /api/graph?source=custom&path={fixture}` with `tests/fixtures/workbench/custom-codex-home` returns source id `custom-codex-home`.
- Every node has `selection_id`, `source_id`, `surface_type`, `logical_name`, `relative_path`, `display_id`, `name`, and `aliases`.
- Every `selection_id` follows `${source_id}:${surface_type}:${logical_name}:${relative_path}`.
- Relative paths are POSIX-style and have no leading `/`, no leading `./`, no `..`, and no trailing slash.
- `GET /api/graph?source=custom&path={invalid-fixture}` returns HTTP 400 with `ok: false` and error code `invalid_source`.
- A discovered item with `:` in an identity part is skipped with a warning.

## AC3: Detected Edges Are Deterministic And Script-Based

The graph creates only deterministic `detected` edges from name and alias text matches.

### TCs

- A fixture skill that mentions a fixture agent name or alias creates one `detected` edge to that agent.
- Re-running the same graph build returns the same nodes, edges, and ordering.
- Self edges are skipped by matching the same `selection_id`.
- Edge fields include `kind`, `from_selection_id`, `to_selection_id`, `match_kind`, `match_text`, and `evidence_path`.
- No edge has kind `route`, `fallback`, `reference`, `support`, or an LLM-suggested kind.
- Case-insensitive whole-token matching detects `ea-worker` and `Worker`, but does not match a term inside a longer alphanumeric, `_`, or `-` token.
- Duplicate aliases do not create duplicate edges.
- If more than one term matches the same target, the edge uses the earliest text position, with the M1 term order as the tie-breaker.

## AC4: Tidy Map Layout Is Stable And Edge-Aware

The graph JSON includes a stable layout that helps the UI render a pleasant map without a live force simulation.

### TCs

- Every graph node includes numeric `x`, `y`, `size`, and `degree`.
- Re-running layout on the same fixture returns identical `x`, `y`, `size`, and `degree`.
- In a fixture with one higher-degree node and one lower-degree node, the higher-degree node has equal or larger `size`.
- Higher-degree nodes are placed closer to the graph center than lower-degree nodes in the same type band when the fixture makes this distinction clear.
- Skill nodes are placed on the left side and agent nodes on the right side.

## AC5: Read-Only Graph UI Renders And Supports Inspection

The browser UI shows the source rail, graph map, and inspector, and node clicks update the inspector.

### TCs

- Start the local Workbench server successfully.
- Browser Use opens `http://127.0.0.1:8765/`.
- In the source rail, enter the Custom fixture path and load it through the UI.
- With a valid Custom fixture, the desktop view shows source rail, graph canvas, and inspector.
- The graph canvas renders at least one skill node, one agent node, and one edge.
- Clicking a node highlights that node and its connected edges.
- Clicking a node updates the inspector with identity, relative path, aliases, degree, and match evidence where available.
- Entering the invalid Custom fixture path shows an invalid-source state in the UI and does not silently fall back to Global or Local.
- The UI has no edit, apply-back, work-package, or agent-run controls.
- Negative API checks show `/api/apply`, `/api/preview`, and `/api/agent/start` are absent with HTTP 404 or 405.

## AC6: Responsive Behavior And Motion Are Present

The UI remains graph-first across desktop, tablet, and mobile sizes.

### TCs

- Browser Use active-viewport check shows the app renders correctly in the current in-app browser viewport.
- CSS/DOM breakpoint check shows desktop uses the 3-pane source rail, graph canvas, and inspector grid above `1100px`.
- CSS/DOM breakpoint check shows tablet uses graph primary plus source/inspector drawers at `max-width: 1100px`.
- CSS/DOM breakpoint check shows mobile uses graph primary plus bottom-sheet inspector at `max-width: 720px`.
- Browser evidence includes screenshots or clear DOM/visual notes for the live Browser Use viewport, plus static evidence for breakpoints that cannot be resized in Browser Use.
- Loading or reloading a graph shows calm node/edge transition behavior; this can be verified visually and recorded in the execution notes.
- Selecting a node gives visible emphasis to the selected node and connected edges without moving the whole graph unpredictably.
- Text does not visibly overlap or overflow inside compact node cards, inspector, or source controls at checked widths.

## AC7: Docs Explain The New Workbench Entry

The repo gives a clear way to run and understand the new M2 Workbench.

### TCs

- `README.md`, `docs/workbench-implementation-plan.md`, and `docs/workflow-map.md` name the new `src/workbench/` Workbench when they describe current Workbench behavior.
- `docs/README.md` points to the Workbench doc if the doc remains present.
- The run command `python3 -m src.workbench.server --host 127.0.0.1 --port 8765` is documented.
- The docs state that M2 is read-only and limited to `skill` and `agent` nodes.
- Docs no longer describe the old Workbench as an edit/apply/work-package/agent-run studio.
- Repo search for old Workbench write terms in `README.md`, `docs/README.md`, `docs/workbench-implementation-plan.md`, and `docs/workflow-map.md` shows only historical or non-goal mentions, not current behavior.

# Execution Order

```text
[Create fixture and backend graph checks]
   |
   v
[Build src/workbench backend]
   |
   v
[Add static graph UI]
   |
   v
[Remove or replace old POC]
   |
   v
[Update docs]
   |
   v
[Run backend and syntax checks]
   |
   v
[Run Browser Use verification]
```

# Open Risks

- Global `~/.codex` may contain more shapes than the fixture; M2 should stay clear and partial rather than guessing.
- Graph layout can become overbuilt; keep the Tidy Map rules small and deterministic.
- Browser motion may be hard to assert automatically; verify visible behavior with Browser Use and keep motion modest.
- Removing the old POC may expose stale docs or references; update only the user-facing references needed for the new M2 path.

# Execute Handoff

- `task_id`: `m2-read-only-visual-harness-map-2026-04-26`
- `plan_path`: `.everything-automate/plans/2026-04-26-m2-read-only-visual-harness-map.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `expected_commands`: `python3 -m unittest discover -s tests -p 'test_workbench*.py'`; `python3 -m py_compile $(find src/workbench -name '*.py' -print) $(test -f scripts/ea_workbench.py && printf '%s\n' scripts/ea_workbench.py)`; `python3 -m src.workbench.server --host 127.0.0.1 --port 8765`
- `browser_url`: `http://127.0.0.1:8765/`
- `browser_evidence`: active in-app Browser Use viewport plus CSS/DOM breakpoint checks for desktop/tablet/mobile behavior
- `fixture_roots`: `tests/fixtures/workbench/custom-codex-home`, `tests/fixtures/workbench/local-repo/.codex`, `tests/fixtures/workbench/invalid-source`
- `open_risks`: global source shape drift, layout overbuild risk, visual motion verification, stale POC references
