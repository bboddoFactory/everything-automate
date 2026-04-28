from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python < 3.11 fallback
    tomllib = None


LOGGER = logging.getLogger(__name__)

SOURCE_IDS = {
    "global": "global-codex-home",
    "local": "local-codex-home",
    "custom": "custom-codex-home",
}

SOURCE_TYPES = {
    "global": "global_codex_home",
    "local": "local_codex_home",
    "custom": "custom_codex_home_like",
}

SURFACE_FILES = {
    "skill": "SKILL.md",
    "agent": "AGENT.md",
}

TOKEN_BOUNDARY = r"[A-Za-z0-9_-]"
DEFAULT_CANVAS_WIDTH = 960
DEFAULT_CANVAS_HEIGHT = 720
TYPE_Y_CENTER = 360.0
TYPE_Y_STEP = 102.0
TYPE_SIZE_BASE = 84.0
TYPE_SIZE_STEP = 8.0
TYPE_X_ANCHOR = {"skill": 400.0, "agent": 576.0}
TYPE_X_STEP = 40.0
TYPE_X_SWAY = 16.0
TYPE_X_DIRECTION = {"skill": -1.0, "agent": 1.0}


class InvalidSourceError(ValueError):
    """Raised when a source does not match the Codex-home-like contract."""

    def __init__(self, message: str, *, code: str = "invalid_source") -> None:
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class WorkbenchSource:
    source_id: str
    source_type: str
    root_path: Path
    allowed_surface_types: tuple[str, ...] = ("skill", "agent")


@dataclass(frozen=True)
class DiscoveredSurface:
    source_id: str
    surface_type: str
    logical_name: str
    relative_path: str
    display_id: str
    name: str
    aliases: tuple[str, ...]
    content: str

    @property
    def selection_id(self) -> str:
        return (
            f"{self.source_id}:{self.surface_type}:"
            f"{self.logical_name}:{self.relative_path}"
        )


def resolve_source(
    source: str,
    *,
    path: str | None = None,
    repo_root: Path | None = None,
    home_root: Path | None = None,
) -> WorkbenchSource:
    source_key = source.strip().lower()
    if source_key not in SOURCE_IDS:
        raise InvalidSourceError(f"unknown source: {source}")

    repo_root = (repo_root or _default_repo_root()).resolve()
    home_root = (home_root or Path.home()).expanduser().resolve()

    if source_key == "global":
        root_path = (home_root / ".codex").resolve()
    elif source_key == "local":
        root_path = (repo_root / ".codex").resolve()
    else:
        if not path:
            raise InvalidSourceError("custom source requires a path")
        root_path = Path(path).expanduser().resolve()

    source_spec = WorkbenchSource(
        source_id=SOURCE_IDS[source_key],
        source_type=SOURCE_TYPES[source_key],
        root_path=root_path,
    )
    _validate_source_root(source_spec)
    return source_spec


def build_graph(
    source: str,
    *,
    path: str | None = None,
    repo_root: Path | None = None,
    home_root: Path | None = None,
) -> dict[str, Any]:
    source_spec = resolve_source(
        source,
        path=path,
        repo_root=repo_root,
        home_root=home_root,
    )
    return build_graph_for_source(source_spec)


def build_graph_for_source(source: WorkbenchSource) -> dict[str, Any]:
    warnings: list[str] = []
    surfaces = discover_surfaces(source, warnings)
    nodes = _build_nodes(surfaces)
    edges = _build_edges(surfaces)
    _apply_degrees(nodes, edges)
    layout = _apply_layout(nodes, edges)
    node_map = {node["selection_id"]: node for node in nodes}
    for selection_id, position in layout.items():
        node_map[selection_id].update(position)
    ordered_nodes = sorted(node_map.values(), key=lambda item: item["selection_id"])
    ordered_edges = sorted(
        edges,
        key=lambda item: (
            item["from_selection_id"],
            item["to_selection_id"],
            item["match_text"].lower(),
            item["evidence_path"],
        ),
    )
    return {
        "ok": True,
        "source": {
            "source_id": source.source_id,
            "source_type": source.source_type,
            "root_path": str(source.root_path),
            "allowed_surface_types": list(source.allowed_surface_types),
        },
        "warnings": warnings,
        "nodes": ordered_nodes,
        "edges": ordered_edges,
    }


def discover_surfaces(
    source: WorkbenchSource,
    warnings: list[str] | None = None,
) -> list[DiscoveredSurface]:
    warnings = warnings if warnings is not None else []
    surfaces: list[DiscoveredSurface] = []
    for surface_type in source.allowed_surface_types:
        surface_dir = source.root_path / f"{surface_type}s"
        if not surface_dir.is_dir():
            continue
        for item in sorted(surface_dir.iterdir(), key=lambda path: path.name.lower()):
            if surface_type == "agent":
                if item.is_dir():
                    surface_file = item / SURFACE_FILES[surface_type]
                    if not surface_file.is_file():
                        continue
                    surface = _read_surface(
                        source,
                        surface_type,
                        item,
                        surface_file,
                        warnings,
                    )
                elif item.is_file() and item.suffix.lower() == ".toml":
                    surface = _read_surface(
                        source,
                        surface_type,
                        item.parent,
                        item,
                        warnings,
                    )
                else:
                    continue
            else:
                if not item.is_dir():
                    continue
                surface_file = item / SURFACE_FILES[surface_type]
                if not surface_file.is_file():
                    continue
                surface = _read_surface(
                    source,
                    surface_type,
                    item,
                    surface_file,
                    warnings,
                )
            if surface is not None:
                surfaces.append(surface)
    surfaces.sort(key=lambda item: item.selection_id)
    return surfaces


def _build_nodes(surfaces: list[DiscoveredSurface]) -> list[dict[str, Any]]:
    return [
        {
            "selection_id": surface.selection_id,
            "source_id": surface.source_id,
            "surface_type": surface.surface_type,
            "logical_name": surface.logical_name,
            "relative_path": surface.relative_path,
            "display_id": surface.display_id,
            "name": surface.name,
            "aliases": list(surface.aliases),
        }
        for surface in surfaces
    ]


def _build_edges(surfaces: list[DiscoveredSurface]) -> list[dict[str, Any]]:
    nodes = _build_nodes(surfaces)
    texts = {surface.selection_id: surface.content for surface in surfaces}
    edges: list[dict[str, Any]] = []
    for source in sorted(nodes, key=lambda item: item["selection_id"]):
        source_id = source["selection_id"]
        source_text = texts[source_id]
        for target in sorted(nodes, key=lambda item: item["selection_id"]):
            target_id = target["selection_id"]
            if target_id == source_id:
                continue
            match = _find_best_match(source_text, target)
            if match is None:
                continue
            edges.append(
                {
                    "kind": "detected",
                    "from_selection_id": source_id,
                    "to_selection_id": target_id,
                    "match_kind": match["match_kind"],
                    "match_text": match["match_text"],
                    "evidence_path": source["relative_path"],
                }
            )
    return _dedupe_edges(edges)


def _apply_layout(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
) -> dict[str, dict[str, float]]:
    incident: dict[str, set[str]] = {node["selection_id"]: set() for node in nodes}
    for edge in edges:
        incident[edge["from_selection_id"]].add(edge["to_selection_id"])
        incident[edge["to_selection_id"]].add(edge["from_selection_id"])

    orders = {
        "skill": _layout_band(nodes, incident, "skill"),
        "agent": _layout_band(nodes, incident, "agent"),
    }
    layout: dict[str, dict[str, float]] = {}
    for surface_type, ordered in orders.items():
        anchor_x = TYPE_X_ANCHOR[surface_type]
        direction = TYPE_X_DIRECTION[surface_type]
        for index, node in enumerate(ordered):
            x_offset = (index * TYPE_X_STEP) + ((index % 2) * TYPE_X_SWAY)
            layout[node["selection_id"]] = {
                "x": anchor_x + direction * x_offset,
                "y": TYPE_Y_CENTER + _signed_slot_offset(index) * TYPE_Y_STEP,
                "size": TYPE_SIZE_BASE + float(node["degree"]) * TYPE_SIZE_STEP,
                "degree": float(node["degree"]),
            }
    return layout


def _layout_band(
    nodes: list[dict[str, Any]],
    incident: dict[str, set[str]],
    surface_type: str,
) -> list[dict[str, Any]]:
    band = [node for node in nodes if node["surface_type"] == surface_type]
    order = sorted(band, key=lambda node: (-node["degree"], node["selection_id"]))
    for _ in range(2):
        rank = {
            node["selection_id"]: _distance_from_center(index)
            for index, node in enumerate(order)
        }
        scored: list[tuple[float, int, str, dict[str, Any]]] = []
        for index, node in enumerate(order):
            node_id = node["selection_id"]
            neighbor_scores = [rank[neighbor] for neighbor in incident[node_id] if neighbor in rank]
            neighbor_score = (
                sum(neighbor_scores) / len(neighbor_scores)
                if neighbor_scores
                else rank[node_id]
            )
            score = (neighbor_score * 0.7) + (rank[node_id] * 0.3) - (node["degree"] * 0.2)
            scored.append((score, -node["degree"], node_id, node))
        order = [item[3] for item in sorted(scored, key=lambda item: (item[0], item[1], item[2]))]
    return order


def _apply_degrees(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> None:
    degree_map: dict[str, int] = {node["selection_id"]: 0 for node in nodes}
    for edge in edges:
        degree_map[edge["from_selection_id"]] += 1
        degree_map[edge["to_selection_id"]] += 1
    for node in nodes:
        node["degree"] = degree_map[node["selection_id"]]


def _distance_from_center(index: int) -> float:
    if index == 0:
        return 0.0
    return float((index + 1) // 2)


def _signed_slot_offset(index: int) -> float:
    if index == 0:
        return 0.0
    step = (index + 1) // 2
    return float(-step if index % 2 == 1 else step)


def _find_best_match(text: str, target: dict[str, Any]) -> dict[str, str] | None:
    candidates = _candidate_terms(target)
    best: tuple[int, int, str, str, str] | None = None
    for index, term in enumerate(candidates):
        match = _find_term_match(text, term)
        if match is None:
            continue
        start, matched_text = match
        match_kind = "name" if term.lower() in {
            target["logical_name"].lower(),
            target["name"].lower(),
        } else "alias"
        candidate = (start, index, match_kind, term, matched_text)
        if best is None or candidate[:2] < best[:2]:
            best = candidate
    if best is None:
        return None
    return {
        "match_kind": best[2],
        "match_text": best[4],
    }


def _candidate_terms(target: dict[str, Any]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()
    for term in [target["logical_name"], target["name"]]:
        key = term.lower()
        if key in seen:
            continue
        seen.add(key)
        ordered.append(term)
    return ordered


def _find_term_match(text: str, term: str) -> tuple[int, str] | None:
    pattern = re.compile(
        rf"(?<!{TOKEN_BOUNDARY}){re.escape(term)}(?!{TOKEN_BOUNDARY})",
        re.IGNORECASE,
    )
    match = pattern.search(text)
    if not match:
        return None
    return match.start(), match.group(0)


def _dedupe_edges(edges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for edge in edges:
        key = (edge["from_selection_id"], edge["to_selection_id"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(edge)
    return deduped


def _read_surface(
    source: WorkbenchSource,
    surface_type: str,
    directory: Path,
    surface_file: Path,
    warnings: list[str],
) -> DiscoveredSurface | None:
    relative_path = surface_file.relative_to(source.root_path).as_posix()
    try:
        text = surface_file.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        warnings.append(
            f"skipped {relative_path} because it could not be read ({exc.__class__.__name__})"
        )
        LOGGER.warning("Skipping %s: %s", relative_path, exc)
        return None

    if surface_type == "agent" and surface_file.suffix.lower() == ".toml":
        metadata = _parse_toml_metadata(text, relative_path, warnings)
        fallback_name = surface_file.stem
    else:
        metadata = _parse_frontmatter(text)
        fallback_name = directory.name

    logical_name = _choose_logical_name(metadata, fallback_name)
    name = str(metadata.get("name", logical_name))
    aliases = _normalize_aliases(metadata.get("aliases"), logical_name)
    identity_parts = [
        source.source_id,
        surface_type,
        logical_name,
        relative_path,
    ]
    if any(":" in part for part in identity_parts):
        warnings.append(
            f"skipped {relative_path} because an identity part contains ':'"
        )
        return None
    display_id = f"{surface_type}:{logical_name}"
    return DiscoveredSurface(
        source_id=source.source_id,
        surface_type=surface_type,
        logical_name=logical_name,
        relative_path=relative_path,
        display_id=display_id,
        name=name,
        aliases=tuple(aliases),
        content=text,
    )


def _choose_logical_name(metadata: dict[str, Any], fallback: str) -> str:
    value = metadata.get("name", fallback)
    return str(value)


def _normalize_aliases(raw_aliases: Any, logical_name: str) -> list[str]:
    aliases: list[str] = []
    if isinstance(raw_aliases, str):
        aliases.extend([item.strip() for item in raw_aliases.split(",") if item.strip()])
    elif isinstance(raw_aliases, list):
        aliases.extend([str(item).strip() for item in raw_aliases if str(item).strip()])
    if logical_name.startswith("ea-"):
        aliases.append(logical_name[3:])
    seen: set[str] = set()
    result: list[str] = []
    for alias in aliases:
        key = alias.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(alias)
    return result


def _parse_frontmatter(text: str) -> dict[str, Any]:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    block = text[4:end]
    metadata: dict[str, Any] = {}
    lines = block.splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            index += 1
            continue
        key, raw_value = line.split(":", 1)
        key = key.strip()
        raw_value = raw_value.strip()
        if not raw_value:
            index += 1
            continue
        if raw_value.startswith("[") and raw_value.endswith("]"):
            raw_items = raw_value[1:-1].split(",")
            metadata[key] = [item.strip().strip('"').strip("'") for item in raw_items if item.strip()]
        else:
            metadata[key] = raw_value.strip().strip('"').strip("'")
        index += 1
    return metadata


def _parse_toml_metadata(
    text: str,
    relative_path: str,
    warnings: list[str],
) -> dict[str, Any]:
    if tomllib is not None:
        try:
            parsed = tomllib.loads(text)
            if isinstance(parsed, dict):
                return parsed
        except Exception as exc:  # pragma: no cover - parse fallback is exercised
            warnings.append(
                f"parsed fallback metadata for {relative_path} because TOML was malformed ({exc.__class__.__name__})"
            )
            LOGGER.warning("Falling back to loose TOML parsing for %s: %s", relative_path, exc)
    return _parse_tomlish_metadata(text)


def _parse_tomlish_metadata(text: str) -> dict[str, Any]:
    metadata: dict[str, Any] = {}
    lines = text.splitlines()
    index = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line or line.startswith("#") or "=" not in line:
            index += 1
            continue
        key, raw_value = line.split("=", 1)
        key = key.strip()
        raw_value = raw_value.strip()
        if not key:
            index += 1
            continue
        if raw_value.startswith('"""') or raw_value.startswith("'''"):
            delimiter = raw_value[:3]
            if raw_value.endswith(delimiter) and len(raw_value) > 6:
                metadata[key] = raw_value[3:-3]
                index += 1
                continue
            index += 1
            while index < len(lines):
                if delimiter in lines[index]:
                    index += 1
                    break
                index += 1
            continue
        if raw_value.startswith("[") and raw_value.endswith("]"):
            raw_items = raw_value[1:-1].split(",")
            metadata[key] = [
                item.strip().strip('"').strip("'")
                for item in raw_items
                if item.strip()
            ]
        else:
            metadata[key] = raw_value.strip().strip('"').strip("'")
        index += 1
    return metadata


def _validate_source_root(source: WorkbenchSource) -> None:
    root = source.root_path
    if not root.exists() or not root.is_dir():
        raise InvalidSourceError(f"source root does not exist: {root}")
    if not (root / "skills").is_dir() and not (root / "agents").is_dir():
        raise InvalidSourceError(
            f"source root is not Codex-home-like: {root} needs direct skills/ or agents/"
        )


def _default_repo_root() -> Path:
    return Path(__file__).resolve().parents[2]
