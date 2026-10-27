# Architecture

Ember is a monorepo with a Tauri 2 desktop shell, a React/TypeScript frontend,
Rust launcher libraries, and an independent Java mod project in `core/`.
Provider/network code will live behind Rust crate boundaries so it can be
tested with mock HTTP clients. The UI will communicate through validated Tauri
commands only; it will never directly receive credentials.

## M0 decisions

- The initial UI is intentionally a small scaffold; launcher and game features
  are added in later milestones.
- `config/app.toml` is the source of branding strings, colors, and logo path.
  The frontend loads and validates the branding config rather than duplicating
  those values in code.
- Authentication is not stubbed into this scaffold. No offline account mode,
  telemetry, secrets, or game launch path is present.
- No Minecraft mappings mode is selected until official sources and a tested
  target-version Loom setup establish the correct configuration.
- The initial `core` Gradle project is an ordinary Java build scaffold. Fabric
  Loom and a version matrix are deferred until the target-specific build setup
  is verified.

## Planned Rust boundaries

- `ember-mojang`: version/runtime manifest parsing and launch metadata.
- `ember-download`: HTTPS allow-listing, resumable downloads, and digest
  verification.
- `ember-auth`: Microsoft/Xbox/Minecraft Services flow and keychain interface.
- `ember-modrinth` and `ember-curseforge`: provider clients and dependency
  resolution.
- `ember-launcher`: profile, loader plugin, and process orchestration.

Each boundary will use explicit types and injectable transport/storage
interfaces. Security checks are performed in the Rust backend, not trusted to
the frontend.
