# Workbench Source Contract

This is the first Workbench contract for M1.
It is contract-first.
The old Workbench POC is reference only.
It is not the source of truth for this contract.

## Purpose

This contract defines the small M1 source and graph model for Workbench.

M1 only covers:

- Codex home sources
- `skill` surfaces
- `agent` surfaces
- stable node identity
- deterministic detected edges from script-only name and alias matches

The goal is to give later code a simple and stable shape to follow.

## Non-goals

M1 does not include:

- a new graph API
- a refactor of the old Workbench POC
- hooks
- runtime or support nodes
- partial-source modeling
- reference edges
- route or fallback classification
- LLM or agent judgment for edges
- work packages
- tests
- apply-back
- arbitrary repo template scanning
- scanning `templates/`, runtime helpers, docs, or setup/install surfaces
- a required workflow order

`WORKFLOW_ORDER` is an old idea that stays out of M1.
It may be mentioned only as removed or excluded, not as a required flow.

## HarnessSource

A `HarnessSource` is one allowed source root.
It is the top-level place the graph scanner can read from.

Required fields:

- `source_id`: stable source id, such as `global-codex-home`
- `source_type`: one of `global_codex_home`, `local_codex_home`, or `custom_codex_home_like`
- `root_path`: absolute path to the source root
- `allowed_surface_types`: fixed list with `skill` and `agent`

Rules:

- global Codex home means the user-level Codex home at `~/.codex`
- local Codex home/source shape means a repo-local folder that mirrors the same `skills/` and `agents/` layout
- custom folders are allowed only when they follow known Codex-home-like `skill` and `agent` locations
- do not require arbitrary repo scanning
- do not use repo template scanning as a source rule

Example:

```json
{
  "source_id": "local-codex-home",
  "source_type": "local_codex_home",
  "root_path": "/Users/yoohyuntak/workspace/example/.codex",
  "allowed_surface_types": ["skill", "agent"]
}
```

## DiscoveredSurface

A `DiscoveredSurface` is one discovered `skill` or `agent` item under a `HarnessSource`.
It is the raw found item before graph normalization.

Required fields:

- `source_id`: source that owns the surface
- `surface_type`: `skill` or `agent`
- `logical_name`: the stable name inside the source
- `relative_path`: path from the source root to the surface file or folder
- `display_id`: old `kind:name` style id for display and backward compatibility
- `name`: human-readable name, usually the same as `logical_name`
- `aliases`: list of known aliases used for matching

Rules:

- `surface_type` is only `skill` or `agent` in M1
- `display_id` keeps the old `kind:name` shape, but it is not the stable identity
- one discovered surface should map to one graph node

Example:

```json
{
  "source_id": "local-codex-home",
  "surface_type": "skill",
  "logical_name": "ea-planning",
  "relative_path": "skills/ea-planning/SKILL.md",
  "display_id": "skill:ea-planning",
  "name": "ea-planning",
  "aliases": ["planning", "plan"]
}
```

## GraphNode

A `GraphNode` is the stable graph record for one discovered surface.
It is what later graph work should use as the node shape.

Required fields:

- `selection_id`: the stable node id
- `source_id`: source that owns the node
- `surface_type`: `skill` or `agent`
- `logical_name`: the stable name inside the source
- `relative_path`: path from the source root to the surface file or folder
- `display_id`: old `kind:name` style id for display and backward compatibility
- `name`: human-readable name
- `aliases`: list of known aliases

Rules:

- the graph node keeps the stable selection identity
- the graph node does not add hook, runtime, or workflow data in M1

Example:

```json
{
  "selection_id": "local-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md",
  "source_id": "local-codex-home",
  "surface_type": "agent",
  "logical_name": "ea-worker",
  "relative_path": "agents/ea-worker/AGENT.md",
  "display_id": "agent:ea-worker",
  "name": "ea-worker",
  "aliases": ["worker", "execute-worker"]
}
```

## GraphEdge

A `GraphEdge` is one detected link from one graph node to another.
M1 keeps one edge kind only.

Required fields:

- `kind`: always `detected` in M1
- `from_selection_id`: source node id
- `to_selection_id`: target node id
- `match_kind`: `name` or `alias`
- `match_text`: the text that triggered the edge
- `evidence_path`: file path where the match was found

Rules:

- `detected` is the only M1 edge kind
- edges come from script-only name and alias matching
- no LLM or agent judgment is used for the base graph
- self-edges are skipped

Example:

```json
{
  "kind": "detected",
  "from_selection_id": "local-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md",
  "to_selection_id": "local-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md",
  "match_kind": "alias",
  "match_text": "worker",
  "evidence_path": "skills/ea-planning/SKILL.md"
}
```

## SelectionIdentity

A `SelectionIdentity` is the stable identity record for one node.
It is the part that must stay the same when display ids change.

Required fields:

- `source_id`
- `surface_type`
- `logical_name`
- `relative_path`
- `selection_id`

Canonical parts before serialization:

- `source_id` is the source id already assigned by `HarnessSource`
- `surface_type` is exactly `skill` or `agent`
- `logical_name` is the discovered stable name
- `relative_path` is a POSIX-style path from the source root, with `/`, no leading slash, no leading `./`, no `..`, and no trailing slash

Identity rule:

```text
selection_id = `${source_id}:${surface_type}:${logical_name}:${relative_path}`
```

Rules:

- current `kind:name` ids are display/backward-compatible ids only
- the stable identity is the `selection_id`
- M1 uses no escaping in `selection_id`
- the serialized parts must not contain a literal `:`
- if a discovered item would need `:`, the M1 scanner skips it with a warning instead of inventing another id

Example:

```json
{
  "source_id": "local-codex-home",
  "surface_type": "skill",
  "logical_name": "ea-planning",
  "relative_path": "skills/ea-planning/SKILL.md",
  "selection_id": "local-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md"
}
```

## Edge Discovery Rules

Edge discovery in M1 is deterministic and script-only.

Rules:

- sort source nodes by `selection_id`
- for each source node, scan its own source text
- sort candidate target nodes by `selection_id`
- for each target, check terms in this order: target `logical_name`, target `name`, then target `aliases` sorted alphabetically
- skip the exact self target before matching; self target means the candidate target has the same `selection_id` as the source node
- emit `detected` edges for matched source and target pairs
- keep one edge per source-target pair
- if more than one term matches the same target, use the earliest text position; if tied, use the ordered term list above
- keep `evidence_path` deterministic from the source surface file path
- do not use LLM or agent judgment
- do not assume a workflow order

## JSON Examples

The blocks below are valid JSON examples for the main M1 shapes.

```json
{
  "source": {
    "source_id": "local-codex-home",
    "source_type": "local_codex_home",
    "root_path": "/Users/yoohyuntak/workspace/example/.codex",
    "allowed_surface_types": ["skill", "agent"]
  },
  "selection_identity": {
    "source_id": "local-codex-home",
    "surface_type": "skill",
    "logical_name": "ea-planning",
    "relative_path": "skills/ea-planning/SKILL.md",
    "selection_id": "local-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md"
  },
  "discovered_surfaces": [
    {
      "source_id": "local-codex-home",
      "surface_type": "skill",
      "logical_name": "ea-planning",
      "relative_path": "skills/ea-planning/SKILL.md",
      "display_id": "skill:ea-planning",
      "name": "ea-planning",
      "aliases": ["planning", "plan"]
    },
    {
      "source_id": "local-codex-home",
      "surface_type": "agent",
      "logical_name": "ea-worker",
      "relative_path": "agents/ea-worker/AGENT.md",
      "display_id": "agent:ea-worker",
      "name": "ea-worker",
      "aliases": ["worker", "execute-worker"]
    }
  ],
  "graph_nodes": [
    {
      "selection_id": "local-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md",
      "source_id": "local-codex-home",
      "surface_type": "skill",
      "logical_name": "ea-planning",
      "relative_path": "skills/ea-planning/SKILL.md",
      "display_id": "skill:ea-planning",
      "name": "ea-planning",
      "aliases": ["planning", "plan"]
    },
    {
      "selection_id": "local-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md",
      "source_id": "local-codex-home",
      "surface_type": "agent",
      "logical_name": "ea-worker",
      "relative_path": "agents/ea-worker/AGENT.md",
      "display_id": "agent:ea-worker",
      "name": "ea-worker",
      "aliases": ["worker", "execute-worker"]
    }
  ],
  "graph_edges": [
    {
      "kind": "detected",
      "from_selection_id": "local-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md",
      "to_selection_id": "local-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md",
      "match_kind": "alias",
      "match_text": "worker",
      "evidence_path": "skills/ea-planning/SKILL.md"
    }
  ]
}
```

## Future Extension Parking Lot

Keep these ideas for later milestones only:

- hooks
- runtime and support nodes
- partial-source modeling
- reference edges
- route or fallback classification
- metadata-backed edges
- LLM or agent edge judgment
- workflow order
- work packages
- tests
- apply-back
- arbitrary repo scanning

If any of these become real needs, they should come back in a later contract with a new decision.
