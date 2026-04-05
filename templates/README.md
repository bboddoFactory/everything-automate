# Everything Automate Templates

This directory is the source of truth for distributable runtime assets.

These templates are not the local authoring contract for this repository.
The local authoring contract lives in the root `AGENTS.md`.

Each provider template should own:

- the top-level runtime entry file
- the install/setup guide
- provider-facing bootstrap assets
- provider-facing skills, hooks, overlays, or adapters

Shared design contracts still live under `docs/specs/`.
Templates translate those shared contracts into provider-specific entry surfaces.
