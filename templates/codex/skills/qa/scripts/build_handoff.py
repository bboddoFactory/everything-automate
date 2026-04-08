#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA_VERSION = 1
DEFAULT_STATE_ROOT = ".everything-automate/state"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def fail(message: str, *, code: int = 1) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(code)


def dump_json(data: Any) -> None:
    print(json.dumps(data, indent=2, sort_keys=True))


def parse_state_root(raw: str) -> Path:
    return Path(raw).expanduser().resolve()


def progress_file(state_root: Path, task_id: str) -> Path:
    return state_root / "tasks" / task_id / "execute-progress.json"


def state_file(state_root: Path, task_id: str) -> Path:
    return state_root / "tasks" / task_id / "loop-state.json"


def qa_handoff_file(state_root: Path, task_id: str) -> Path:
    return state_root / "tasks" / task_id / "qa-handoff.json"


def read_json(path: Path, *, required: bool) -> dict[str, Any]:
    if not path.exists():
        if required:
            fail(f"json file not found: {path}")
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"json file is not valid JSON: {path} ({exc})")


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def read_stdin_json() -> dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        fail("stdin JSON payload required")
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        fail(f"stdin payload is not valid JSON ({exc})")
    if not isinstance(payload, dict):
        fail("stdin JSON payload must be an object")
    return payload


def build_handoff(*, task_id: str, progress: dict[str, Any], state: dict[str, Any], extra: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "task_id": task_id,
        "run_id": progress.get("run_id") or state.get("run_id"),
        "task_summary": extra.get("task_summary"),
        "desired_outcome": extra.get("desired_outcome"),
        "scope": extra.get("scope"),
        "non_goals": extra.get("non_goals"),
        "plan_summary": extra.get("plan_summary"),
        "changed_files": extra.get("changed_files", []),
        "test_results": extra.get("test_results", []),
        "open_risks": extra.get("open_risks", []),
        "progress_summary": {
            "current_ac": progress.get("current_ac"),
            "current_tc": progress.get("current_tc"),
            "completed_acs": progress.get("completed_acs", []),
            "blocked_acs": progress.get("blocked_acs", []),
            "failed_verification_acs": progress.get("failed_verification_acs", []),
            "latest_evidence": progress.get("latest_evidence"),
        },
        "state_summary": {
            "stage": state.get("stage"),
            "terminal_reason": state.get("terminal_reason"),
            "verification_policy": state.get("verification_policy"),
        } if state else None,
        "updated_at": utc_now(),
        "writer": "qa/scripts/build_handoff.py",
    }


def build_handoff_cmd(args: argparse.Namespace) -> None:
    state_root = parse_state_root(args.state_root)
    progress = read_json(progress_file(state_root, args.task_id), required=True)
    state = read_json(state_file(state_root, args.task_id), required=False)
    extra = read_stdin_json()
    payload = build_handoff(task_id=args.task_id, progress=progress, state=state, extra=extra)
    target = qa_handoff_file(state_root, args.task_id)
    write_json(target, payload)
    dump_json({"ok": True, "qa_handoff_file": str(target), "task_id": args.task_id})


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build the installed QA review packet.")
    parser.add_argument("--state-root", default=DEFAULT_STATE_ROOT)
    parser.add_argument("--task-id", required=True)
    parser.set_defaults(func=build_handoff_cmd)
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
