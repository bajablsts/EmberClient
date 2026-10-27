# Verified ecosystem facts

Checked 2026-10-27. API versions and supported game releases change; use the live
metadata endpoints below at install time rather than treating these observations
as permanent compatibility lists.

## Mojang version metadata

- The [Mojang version manifest](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json)
  currently lists `26.3` as `release` and latest release. The latest snapshot in
  the manifest is `26.4-snapshot-5`.
- The [26.3 version JSON](https://piston-meta.mojang.com/v1/packages/61fff1316bd50312624a858bbb5eb18fa45208ed/26.3.json)
  requires `java-runtime-epsilon`, major version **25**. It uses the modern
  `arguments` field and includes a client artifact with a SHA-1.
- This version JSON has no `downloads.client_mappings` entry. The 26.3
  [Fabric Meta profile](https://meta.fabricmc.net/v2/versions/loader/26.3/0.20.1)
  reports an intermediary sentinel version `0.0.0` and no client-side loader
  libraries. Those are consistent with an unobfuscated game, but neither
  endpoint is an explicit Mojang statement of policy. Treat "unobfuscated" as
  not definitively confirmed by the sources checked and do not invent mappings
  setup based on a guess. The launcher must rely on Mojang's version JSON for
  launch metadata.
- Fabric API is separate from the loader. Its [Modrinth version metadata](https://api.modrinth.com/v2/project/P7dR8mSH/version?game_versions=%5B%2226.3%22%5D)
  currently lists **0.165.0+26.3** newest in the returned versions and confirms
  that **0.160.6+26.3** exists. Select versions using both game version and
  loader, rather than hardcoding one.

## Fabric and loader metadata

- [Fabric Meta loader endpoint](https://meta.fabricmc.net/v2/versions/loader)
  returned stable loader **0.20.1** as newest at check time; **0.19.5** is also
  listed (not stable).
- The [Fabric Meta 26.3 loader endpoint](https://meta.fabricmc.net/v2/versions/loader/26.3)
  includes 0.20.1 and 0.19.5, among many older loader builds.
- [Fabric Meta installer endpoint](https://meta.fabricmc.net/v2/versions/installer)
  returned stable installer **1.1.2** as newest at check time.
- Fabric API is a separate project. Its available versions must be selected
  from its live project/version metadata using both game version and loader.
- A spot check of the Fabric and Quilt game-version endpoints found both
  loaders list 26.3, 1.21.11, 1.21.1, and 1.20.1; neither endpoint returned
  1.12.2 or 1.8.9. These are endpoint observations, not promises about all
  builds or every historical release.
- [Quilt Meta's game endpoint](https://meta.quiltmc.org/v3/versions/game)
  lists stable `26.3`. Quilt's endpoint is authoritative for Quilt-specific
  compatibility; do not assume all versions supported by Fabric work on Quilt.
- The [NeoForge Maven metadata](https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml)
  includes the `26.3.0.x` line and `21.1.x` (Minecraft 1.21.1) releases at
  check time. Query official metadata for the exact target before offering
  installation; this is a modern loader, not a legacy 1.8/1.12 loader.
- The [Forge promotions metadata](https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json)
  contains promotion entries for 1.8, 1.12, 1.20, and 1.21 lines. The observed
  `1.8-latest` was `11.14.4.1577`, and `1.12-latest` was `14.21.1.2443`.
  Forge and NeoForge are distinct loaders and version schemes.
- [Legacy Fabric](https://legacyfabric.net/) currently describes support from
  Minecraft 1.3 through 1.14 snapshots, which includes the 1.8.9 era. It is not
  the same loader as contemporary Fabric, and support should be checked per
  release rather than inferred from the project range.

## Modrinth API

- The [Modrinth API documentation](https://docs.modrinth.com/api/) says most
  public read requests do not need authentication; account operations require
  appropriate OAuth/PAT credentials and scopes.
- The documented per-IP limit is currently **300 requests/minute**, exposed
  through `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`, and
  `X-Ratelimit-Reset` response headers.
- Requests must send a uniquely identifying `User-Agent`; Modrinth recommends
  including project, version, and contact information.
- API terms/policies should be rechecked before release. Ember will use the
  public API, respect rate-limit headers, and will not scrape the website.

## CurseForge API

- The [CurseForge for Studios API docs](https://docs.curseforge.com/rest-api/)
  describe the official REST API. API requests use an `x-api-key` header;
  access requires applying for a unique key and accepting the
  [third-party API terms](https://support.curseforge.com/en/support/solutions/articles/9000207405-curse-forge-3rd-party-api-terms-and-conditions).
- The [API key application information](https://support.curseforge.com/en/support/solutions/articles/9000208346-about-the-curseforge-api-and-how-to-apply-for-a-key)
  says keys are generated after application and review. Ember must accept a
  user-provided key or an explicitly configured proxy; no shared key belongs in
  the client.
- The terms address creator consent, attribution, and third-party distribution.
  They also allow Overwolf to set a usage quota and potentially require a
  separate written license if it is exceeded. Treat a missing/disabled download
  URL as a stop condition and link to the CurseForge project page instead; do
  not seek an alternate download path.
- The API docs checked did not provide a single fixed general request quota.
  Handle `429` and any server-provided retry information rather than hardcoding
  an assumed limit.

## Implementation consequences

- The user's expected Java 25, Fabric Loader 0.19.5+ compatibility, and
  Fabric API 0.160.6+26.3 availability are confirmed. At check time, newer
  loader 0.20.1 and API 0.165.0+26.3 are listed; runtime choices must be
  discovered live.
- Loader support is not uniform across Minecraft releases. The launcher should
  use official, loader-specific metadata and expose only versions confirmed by
  that provider. Vanilla launching remains driven by Mojang's manifest.
- M0 does not configure Minecraft mappings or assert an unobfuscation policy;
  that decision requires a definitive Mojang source and a working Loom
  configuration for the target release.
