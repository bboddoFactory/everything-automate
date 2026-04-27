from __future__ import annotations

import http.client
import json
import threading
import time
import unittest
from pathlib import Path

from src.workbench.server import make_server


FIXTURES = Path("tests/fixtures/workbench")


class WorkbenchServerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.server = make_server(
            "127.0.0.1",
            0,
            repo_root=Path.cwd(),
            home_root=Path.home(),
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        time.sleep(0.1)

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def test_invalid_source_returns_400_json(self) -> None:
        conn = http.client.HTTPConnection(*self.server.server_address, timeout=5)
        conn.request("GET", f"/api/graph?source=custom&path={FIXTURES / 'invalid-source'}")
        response = conn.getresponse()
        payload = json.loads(response.read().decode("utf-8"))

        self.assertEqual(response.status, 400)
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["error"], "invalid_source")

    def test_removed_write_route_returns_405(self) -> None:
        conn = http.client.HTTPConnection(*self.server.server_address, timeout=5)
        conn.request("POST", "/api/apply")
        response = conn.getresponse()
        payload = json.loads(response.read().decode("utf-8"))

        self.assertEqual(response.status, 405)
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["error"], "method_not_allowed")


if __name__ == "__main__":
    unittest.main()
