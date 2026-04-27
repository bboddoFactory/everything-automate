from __future__ import annotations

import argparse
import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .graph import InvalidSourceError, _default_repo_root, build_graph


STATIC_ROOT = Path(__file__).resolve().parent / "static"


class WorkbenchHTTPServer(ThreadingHTTPServer):
    def __init__(
        self,
        server_address: tuple[str, int],
        request_handler_class: type[BaseHTTPRequestHandler],
        *,
        repo_root: Path | None = None,
        home_root: Path | None = None,
    ) -> None:
        super().__init__(server_address, request_handler_class)
        self.repo_root = (repo_root or _default_repo_root()).resolve()
        self.home_root = (home_root or Path.home()).expanduser().resolve()


class WorkbenchHandler(BaseHTTPRequestHandler):
    server_version = "WorkbenchHTTP/2.0"

    def do_GET(self) -> None:  # noqa: N802
        self._dispatch(send_body=True)

    def do_HEAD(self) -> None:  # noqa: N802
        self._dispatch(send_body=False)

    def do_POST(self) -> None:  # noqa: N802
        self._write_method_not_allowed()

    def do_PUT(self) -> None:  # noqa: N802
        self._write_method_not_allowed()

    def do_PATCH(self) -> None:  # noqa: N802
        self._write_method_not_allowed()

    def do_DELETE(self) -> None:  # noqa: N802
        self._write_method_not_allowed()

    def _dispatch(self, *, send_body: bool) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/graph":
            self._handle_graph(parsed.query, send_body=send_body)
            return
        if parsed.path == "/" or parsed.path == "/index.html":
            self._handle_index(send_body=send_body)
            return
        if parsed.path.startswith("/"):
            self._handle_static(parsed.path, send_body=send_body)
            return
        self._write_not_found(send_body=send_body)

    def _handle_graph(self, query: str, *, send_body: bool) -> None:
        params = parse_qs(query, keep_blank_values=True)
        source = params.get("source", [None])[0]
        path = params.get("path", [None])[0]
        if not source:
            self._write_json(
                HTTPStatus.BAD_REQUEST,
                {
                    "ok": False,
                    "error": "invalid_source",
                    "message": "source query parameter is required",
                },
                send_body=send_body,
            )
            return
        try:
            graph = build_graph(
                source,
                path=path,
                repo_root=self.server.repo_root,
                home_root=self.server.home_root,
            )
        except InvalidSourceError as exc:
            self._write_json(
                HTTPStatus.BAD_REQUEST,
                {
                    "ok": False,
                    "error": exc.code,
                    "message": str(exc),
                },
                send_body=send_body,
            )
            return
        self._write_json(HTTPStatus.OK, graph, send_body=send_body)

    def _handle_index(self, *, send_body: bool) -> None:
        index_path = STATIC_ROOT / "index.html"
        if index_path.is_file():
            self._write_bytes(
                index_path.read_bytes(),
                content_type="text/html; charset=utf-8",
                send_body=send_body,
            )
            return
        body = (
            "<!doctype html><html><head><meta charset='utf-8'>"
            "<title>Workbench</title></head><body>"
            "<h1>Workbench backend is running.</h1>"
            "<p>Open /api/graph?source=custom&path=... for graph JSON.</p>"
            "</body></html>"
        ).encode("utf-8")
        self._write_bytes(body, content_type="text/html; charset=utf-8", send_body=send_body)

    def _handle_static(self, path: str, *, send_body: bool) -> None:
        candidate = (STATIC_ROOT / path.lstrip("/")).resolve()
        try:
            candidate.relative_to(STATIC_ROOT)
        except ValueError:
            self._write_not_found(send_body=send_body)
            return
        if not candidate.is_file():
            self._write_not_found(send_body=send_body)
            return
        if candidate.suffix == ".js":
            content_type = "application/javascript; charset=utf-8"
        elif candidate.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        elif candidate.suffix == ".html":
            content_type = "text/html; charset=utf-8"
        else:
            content_type = "text/plain; charset=utf-8"
        self._write_bytes(candidate.read_bytes(), content_type=content_type, send_body=send_body)

    def _write_not_found(self, *, send_body: bool) -> None:
        self._write_json(
            HTTPStatus.NOT_FOUND,
            {
                "ok": False,
                "error": "not_found",
                "message": "route not found",
            },
            send_body=send_body,
        )

    def _write_method_not_allowed(self) -> None:
        self._write_json(
            HTTPStatus.METHOD_NOT_ALLOWED,
            {
                "ok": False,
                "error": "method_not_allowed",
                "message": f"{self.command} is not supported",
            },
        )

    def _write_json(
        self,
        status: HTTPStatus,
        payload: dict[str, object],
        *,
        send_body: bool = True,
    ) -> None:
        data = json.dumps(payload, indent=2, sort_keys=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data) if send_body else 0))
        self.send_header("Allow", "GET, HEAD")
        self.end_headers()
        if send_body:
            self.wfile.write(data)

    def _write_bytes(
        self,
        data: bytes,
        *,
        content_type: str,
        send_body: bool = True,
    ) -> None:
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data) if send_body else 0))
        self.end_headers()
        if send_body:
            self.wfile.write(data)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return


def make_server(
    host: str,
    port: int,
    *,
    repo_root: Path | None = None,
    home_root: Path | None = None,
) -> WorkbenchHTTPServer:
    return WorkbenchHTTPServer(
        (host, port),
        WorkbenchHandler,
        repo_root=repo_root,
        home_root=home_root,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run the EA Workbench graph server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args(argv)
    server = make_server(args.host, args.port)
    print(f"Workbench server listening on http://{args.host}:{args.port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
