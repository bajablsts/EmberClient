# Ember

Ember is an independent Minecraft Java launcher and client project. It is not
affiliated with Mojang or Microsoft and does not include Mojang assets.

## Current milestone

The repository currently contains a Tauri 2 desktop shell with a responsive
launcher dashboard, preview profile page, persistent appearance settings,
Rust test target, Java/Gradle core scaffold, and CI workflow. Authentication,
installation, profile creation, mod management, and game launching are not
implemented yet. The Windows installer is a **preview desktop shell**, not a
functioning game launcher. It must not be presented as ready to install or
launch games.

## Development

Prerequisites: Node.js 22+, pnpm 12.14.0, Rust stable, a Java 25 JDK, and
Gradle 9+ (the CI runner provisions Rust, Java, and Gradle).

```powershell
pnpm install --allow-build=esbuild
pnpm test
pnpm build
cargo test --manifest-path launcher/src-tauri/Cargo.toml
gradle -p core build
```

For the Tauri desktop window, run from `launcher/`:

```powershell
pnpm exec tauri dev
```

Tauri's platform-native build dependencies are also required. See the [Tauri
prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

## Windows preview installer

The Windows packaging workflow produces a per-user NSIS setup executable
(`Ember_<version>_x64-setup.exe`) for 64-bit Windows. It also uploads a SHA-256
checksum. Run it on a Windows machine with the WebView2 runtime installed; the
installer is not code-signed, so Windows may show an unknown-publisher warning.
Do not bypass that warning unless you trust the source and verify the checksum.

To build locally from a Visual Studio Developer PowerShell with the C++
workload and Windows SDK installed:

```powershell
pnpm install --allow-build=esbuild
pnpm test
cargo test --manifest-path launcher/src-tauri/Cargo.toml
Set-Location launcher
pnpm exec tauri build --bundles nsis
```

In a hosted GitHub repository, pushing a `v*` tag runs
[`windows-release.yml`](./.github/workflows/windows-release.yml), attaches the
installer and checksum to a GitHub Release, and exposes the same files as a
30-day Actions artifact for manual builds. The source is hosted at
[bajablsts/EmberClient](https://github.com/bajablsts/EmberClient). A repository
maintainer must push a `v*` tag before a public installer download exists.
No signing certificate or publisher identity has been provided, so installers
are unsigned.

## Branding

Edit [`config/app.toml`](./config/app.toml) to change the frontend name, colors,
and logo path. The file is loaded and validated by the frontend at runtime.
Ember's pixel landscape and mark are original project artwork; the app does not
ship Mojang textures, game logos, or other official Minecraft assets.

## Project notes

- [`docs/FACTS.md`](./docs/FACTS.md) records checked live ecosystem facts.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) records the current
  boundaries and M0 decisions.
- [`docs/SECURITY.md`](./docs/SECURITY.md) records security requirements and
  the current scaffold's security posture.
