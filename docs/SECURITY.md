# Security

## Non-negotiable design rules

- Authentication is Microsoft account only. Refresh tokens belong in the
  operating system keychain; never write credentials to ordinary files, logs,
  crash reports, or telemetry.
- Require HTTPS and provider-specific host allow-lists for downloads. Verify
  every artifact against its trusted SHA-1/SHA-512 metadata before use.
- Treat provider responses, mod metadata, imported archives, and pack
  manifests as untrusted. Validate schemas, bound resource use, and reject
  traversal/zip-slip paths before extraction.
- Keep Tauri capabilities minimal, validate every IPC argument in Rust, and
  prohibit remote code and unnecessary network origins in the CSP.
- Crash reports remain local unless the user explicitly exports them. No
  telemetry is collected.
- Never embed a CurseForge key in the application. Respect author download
  restrictions and link to the project page when third-party downloads are
  disabled.

## M0 posture

M0 contains no account flow, token storage, downloader, mod importer, or
telemetry. The Tauri capability grants only the default core permissions; the
frontend is local and its CSP denies remote scripts. The only frontend network
request is for the local `app.toml` branding file. Rust IPC commands have not
yet been added.

These are design constraints, not a security certification. Each future
milestone must add tests for its security boundary before the feature is
considered complete.
