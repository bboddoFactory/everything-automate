# Workbench UX Polish Backlog

## Status

Local backlog.

These items came from looking at the Workbench graph in the browser after M2.5B, M2.5C, and the name-only edge semantics change.

They are not part of the current milestone yet.

## Items

### Graph Center Policy

Problem:
The graph currently uses high-degree nodes as the main center. That is useful, but it may not always match the user's mental model.

Why it matters:
The map should show the most useful starting point, not only the most connected node.

Possible direction:
Consider future center modes such as selected node, surface type, workflow role, or source-defined focus.

Decision:
Backlog only.

### Edge Direction Explanation

Problem:
The current edge direction means "source file text mentions target node name." Users may read it as an execution flow or dependency flow.

Why it matters:
If the direction is misunderstood, the graph can look more authoritative than it really is.

Possible direction:
Add a small explanation in the inspector, legend, or edge detail view.

Decision:
Backlog only.

### Dense Label Policy Tuning

Problem:
Dense graph mode shows only important labels by default. This is cleaner, but the exact label count and priority may need tuning.

Why it matters:
Too many labels make the graph noisy. Too few labels make it hard to orient.

Possible direction:
Tune the default label count, priority rules, and zoom-based label reveal behavior after more real source checks.

Decision:
Backlog only.

### Stronger Focus Mode

Problem:
Selecting a node already emphasizes the local neighborhood, but unrelated nodes and edges may still be too visible.

Why it matters:
Users should be able to click one node and quickly understand its immediate relationships.

Possible direction:
Make selected-node mode dim unrelated nodes more strongly, or add a temporary focus-only view.

Decision:
Backlog only.

### Inspector Long Edge Lists

Problem:
High-degree nodes can produce long incoming and outgoing edge lists in the inspector.

Why it matters:
Long lists are hard to scan and can push useful source preview details too far down.

Possible direction:
Add grouping, collapse controls, search, or a short summary for long edge lists.

Decision:
Backlog only.

### Source Panel Filter Density

Problem:
The source panel filter list is usable, but global sources can make it feel dense.

Why it matters:
Users need quick filtering without losing the map context.

Possible direction:
Consider search, compact sections, type counts, or high-degree sorting controls.

Decision:
Backlog only.

### Local Backlog Skill

Problem:
There is no local backlog skill. The available `$ea-issue-capture` skill creates GitHub issues, which can be too heavy during active local product shaping.

Why it matters:
Some ideas should be parked locally without interrupting the milestone or publishing to GitHub.

Possible direction:
Create a small local backlog skill that appends structured cards under `.backlog/`.

Decision:
Backlog only.
