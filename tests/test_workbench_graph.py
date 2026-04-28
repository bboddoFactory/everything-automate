from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from src.workbench.graph import InvalidSourceError, build_graph, resolve_source


FIXTURES = Path("tests/fixtures/workbench")


class WorkbenchGraphTests(unittest.TestCase):
    def test_custom_source_discovers_skills_and_agents(self) -> None:
        graph = build_graph(
            "custom",
            path=str(FIXTURES / "custom-codex-home"),
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )

        self.assertTrue(graph["ok"])
        self.assertEqual(
            graph["source"],
            {
                "source_id": "custom-codex-home",
                "source_type": "custom_codex_home_like",
                "root_path": str((Path.cwd() / FIXTURES / "custom-codex-home").resolve()),
                "allowed_surface_types": ["skill", "agent"],
            },
        )
        self.assertEqual(
            {node["surface_type"] for node in graph["nodes"]},
            {"skill", "agent"},
        )
        expected_nodes = {
            "custom-codex-home:agent:ea-advisor:agents/ea-advisor/AGENT.md": {
                "source_id": "custom-codex-home",
                "surface_type": "agent",
                "relative_path": "agents/ea-advisor/AGENT.md",
            },
            "custom-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md": {
                "source_id": "custom-codex-home",
                "surface_type": "agent",
                "relative_path": "agents/ea-worker/AGENT.md",
            },
            "custom-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md": {
                "source_id": "custom-codex-home",
                "surface_type": "skill",
                "relative_path": "skills/ea-planning/SKILL.md",
            },
            "custom-codex-home:skill:ea-research:skills/ea-research/SKILL.md": {
                "source_id": "custom-codex-home",
                "surface_type": "skill",
                "relative_path": "skills/ea-research/SKILL.md",
            },
        }
        self.assertEqual({node["selection_id"] for node in graph["nodes"]}, set(expected_nodes))
        self.assertTrue(all("selection_id" in node for node in graph["nodes"]))
        self.assertTrue(all("source_id" in node for node in graph["nodes"]))
        self.assertTrue(all("surface_type" in node for node in graph["nodes"]))
        self.assertTrue(all("logical_name" in node for node in graph["nodes"]))
        self.assertTrue(all("relative_path" in node for node in graph["nodes"]))
        self.assertTrue(all("display_id" in node for node in graph["nodes"]))
        self.assertTrue(all("name" in node for node in graph["nodes"]))
        self.assertTrue(all("aliases" in node for node in graph["nodes"]))
        self.assertTrue(
            all(
                node["selection_id"]
                == f'{node["source_id"]}:{node["surface_type"]}:{node["logical_name"]}:{node["relative_path"]}'
                for node in graph["nodes"]
            )
        )
        self.assertTrue(
            all(
                not value.startswith(("/", "./")) and ".." not in value and not value.endswith("/")
                for value in (node["relative_path"] for node in graph["nodes"])
            )
        )
        for node in graph["nodes"]:
            expected = expected_nodes[node["selection_id"]]
            self.assertEqual(node["source_id"], expected["source_id"])
            self.assertEqual(node["surface_type"], expected["surface_type"])
            self.assertEqual(node["relative_path"], expected["relative_path"])

    def test_global_source_uses_home_codex(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            home = Path(tmpdir)
            shutil.copytree(
                FIXTURES / "flat-repo" / ".codex",
                home / ".codex",
                dirs_exist_ok=True,
            )
            graph = build_graph(
                "global",
                repo_root=Path.cwd(),
                home_root=home,
            )

        self.assertEqual(graph["source"]["source_id"], "global-codex-home")
        self.assertEqual(Path(graph["source"]["root_path"]).name, ".codex")

    def test_local_source_uses_repo_codex_root(self) -> None:
        graph = build_graph(
            "local",
            repo_root=FIXTURES / "flat-repo",
            home_root=Path.home(),
        )

        self.assertEqual(graph["source"]["source_id"], "local-codex-home")
        self.assertEqual(Path(graph["source"]["root_path"]).name, ".codex")
        self.assertIn(
            "ea-bad",
            {node["logical_name"] for node in graph["nodes"] if node["surface_type"] == "agent"},
        )
        self.assertIn(
            "ea-worker",
            {node["logical_name"] for node in graph["nodes"] if node["surface_type"] == "agent"},
        )
        self.assertIn(
            "ea-advisor",
            {node["logical_name"] for node in graph["nodes"] if node["surface_type"] == "agent"},
        )

    def test_invalid_custom_source_returns_invalid_source(self) -> None:
        with self.assertRaises(InvalidSourceError):
            resolve_source(
                "custom",
                path=str(FIXTURES / "invalid-source"),
                repo_root=Path.cwd(),
                home_root=Path.home(),
            )

    def test_colon_identity_parts_are_skipped_with_warning(self) -> None:
        graph = build_graph(
            "custom",
            path=str(FIXTURES / "custom-codex-home"),
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )

        selection_ids = [node["selection_id"] for node in graph["nodes"]]
        self.assertFalse(any("ea:skip" in selection_id for selection_id in selection_ids))
        self.assertTrue(any("ea:skip" in warning for warning in graph["warnings"]))

    def test_bad_agent_surfaces_are_skipped_or_fallback_without_breaking_graph(self) -> None:
        original_read_text = Path.read_text

        def flaky_read_text(self: Path, *args: object, **kwargs: object) -> str:
            if self.name == "ea-broken.toml":
                raise UnicodeDecodeError("utf-8", b"\xff", 0, 1, "invalid start byte")
            if self.name == "ea-denied.toml":
                raise OSError("permission denied")
            return original_read_text(self, *args, **kwargs)

        with mock.patch.object(Path, "read_text", flaky_read_text):
            graph = build_graph(
                "local",
                repo_root=FIXTURES / "flat-repo",
                home_root=Path.home(),
            )

        agent_nodes = [node for node in graph["nodes"] if node["surface_type"] == "agent"]
        self.assertTrue(graph["ok"])
        self.assertIn("ea-bad", {node["logical_name"] for node in agent_nodes})
        self.assertFalse(any(node["logical_name"] == "ea-broken" for node in agent_nodes))
        self.assertFalse(any(node["logical_name"] == "ea-denied" for node in agent_nodes))
        self.assertTrue(any("ea-broken.toml" in warning for warning in graph["warnings"]))
        self.assertTrue(any("ea-denied.toml" in warning for warning in graph["warnings"]))

    def test_detected_edges_are_deterministic_and_whole_token_based(self) -> None:
        graph_a = build_graph(
            "custom",
            path=str(FIXTURES / "custom-codex-home"),
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )
        graph_b = build_graph(
            "custom",
            path=str(FIXTURES / "custom-codex-home"),
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )

        self.assertEqual(graph_a["nodes"], graph_b["nodes"])
        self.assertEqual(graph_a["edges"], graph_b["edges"])
        self.assertEqual(graph_a["source"], graph_b["source"])

        self.assertTrue(all(edge["kind"] == "detected" for edge in graph_a["edges"]))
        expected_edges = {
            (
                "detected",
                "custom-codex-home:skill:ea-planning:skills/ea-planning/SKILL.md",
                "custom-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md",
                "name",
                "ea-worker",
                "skills/ea-planning/SKILL.md",
            ),
            (
                "detected",
                "custom-codex-home:skill:ea-research:skills/ea-research/SKILL.md",
                "custom-codex-home:agent:ea-worker:agents/ea-worker/AGENT.md",
                "name",
                "ea-worker",
                "skills/ea-research/SKILL.md",
            ),
        }
        actual_edges = {
            (
                edge["kind"],
                edge["from_selection_id"],
                edge["to_selection_id"],
                edge["match_kind"],
                edge["match_text"],
                edge["evidence_path"],
            )
            for edge in graph_a["edges"]
        }
        self.assertEqual(actual_edges, expected_edges)
        self.assertTrue(
            all(
                set(edge) == {
                    "kind",
                    "from_selection_id",
                    "to_selection_id",
                    "match_kind",
                    "match_text",
                    "evidence_path",
                }
                for edge in graph_a["edges"]
            )
        )
        self.assertFalse(
            any(
                edge["from_selection_id"] == edge["to_selection_id"]
                for edge in graph_a["edges"]
            )
        )
        self.assertTrue(
            any(
                edge["match_text"].lower() == "ea-worker"
                and edge["match_kind"] == "name"
                for edge in graph_a["edges"]
            )
        )
        self.assertFalse(any(edge["match_kind"] == "alias" for edge in graph_a["edges"]))
        self.assertFalse(
            any(
                edge["match_text"].lower() in {"worker-run", "a_worker"}
                for edge in graph_a["edges"]
            )
        )

    def test_layout_fields_are_numeric_and_stable(self) -> None:
        graph_a = build_graph(
            "custom",
            path=str(FIXTURES / "custom-codex-home"),
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )
        graph_b = build_graph(
            "custom",
            path=str(FIXTURES / "custom-codex-home"),
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )

        layout_a = [
            (node["selection_id"], node["x"], node["y"], node["size"], node["degree"])
            for node in graph_a["nodes"]
        ]
        layout_b = [
            (node["selection_id"], node["x"], node["y"], node["size"], node["degree"])
            for node in graph_b["nodes"]
        ]
        edge_ids_a = sorted(
            (edge["kind"], edge["from_selection_id"], edge["to_selection_id"])
            for edge in graph_a["edges"]
        )
        edge_ids_b = sorted(
            (edge["kind"], edge["from_selection_id"], edge["to_selection_id"])
            for edge in graph_b["edges"]
        )

        self.assertEqual(layout_a, layout_b)
        self.assertEqual(edge_ids_a, edge_ids_b)
        self.assertTrue(all(isinstance(node["x"], float) for node in graph_a["nodes"]))
        self.assertTrue(all(isinstance(node["y"], float) for node in graph_a["nodes"]))
        self.assertTrue(all(isinstance(node["size"], float) for node in graph_a["nodes"]))
        self.assertTrue(all(isinstance(node["degree"], (int, float)) for node in graph_a["nodes"]))
        self.assertTrue(all(node["size"] >= 84.0 for node in graph_a["nodes"]))

        center_x = 480.0
        center_y = 360.0
        center_band_min = 360.0
        center_band_max = 600.0
        skill_nodes = [node for node in graph_a["nodes"] if node["surface_type"] == "skill"]
        agent_nodes = [node for node in graph_a["nodes"] if node["surface_type"] == "agent"]
        def distance_from_center(node: dict[str, object]) -> float:
            return abs(float(node["x"]) - center_x) + abs(float(node["y"]) - center_y)

        self.assertTrue(any(center_band_min <= node["x"] <= center_band_max for node in skill_nodes))
        self.assertTrue(any(center_band_min <= node["x"] <= center_band_max for node in agent_nodes))
        self.assertLess(
            sum(node["x"] for node in skill_nodes) / len(skill_nodes),
            sum(node["x"] for node in agent_nodes) / len(agent_nodes),
        )
        self.assertGreater(len({node["x"] for node in skill_nodes}), 1)
        self.assertGreater(len({node["x"] for node in agent_nodes}), 1)

        for band_nodes in (skill_nodes, agent_nodes):
            high_node = max(band_nodes, key=lambda node: node["degree"])
            low_node = min(band_nodes, key=lambda node: node["degree"])
            self.assertGreaterEqual(high_node["size"], low_node["size"])
            if high_node["degree"] > low_node["degree"]:
                self.assertLess(distance_from_center(high_node), distance_from_center(low_node))


if __name__ == "__main__":
    unittest.main()
