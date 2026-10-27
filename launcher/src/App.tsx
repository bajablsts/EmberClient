import { useEffect, useState, type CSSProperties } from "react";
import { parseBranding, type Branding } from "./brand/brand";
import {
  ACCENT_COLORS,
  DEFAULT_PREFERENCES,
  readPreferences,
  savePreferences,
  type Preferences,
  type ThemePreference,
} from "./preferences/preferences";

type Page = "home" | "profiles" | "settings";
type IconName = "home" | "layers" | "settings" | "chevron" | "sun" | "moon" | "monitor" | "arrow";

const ICON_PATHS: Record<IconName, string> = {
  home: "M3 10.8 12 3l9 7.8M5.2 9v11h13.6V9M9 20v-6h6v6",
  layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  settings:
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM19.4 13.5a7.8 7.8 0 0 0 0-1l1.5-1.2-1.5-2.6-1.8.7a7.7 7.7 0 0 0-.9-.5L16.4 7h-3l-.3 1.9c-.4.1-.7.3-1 .5l-1.7-.7-1.5 2.6 1.4 1.2a7.8 7.8 0 0 0 0 1l-1.4 1.2 1.5 2.6 1.7-.7c.3.2.6.4 1 .5l.3 1.9h3l.3-1.9c.3-.1.6-.3.9-.5l1.8.7 1.5-2.6-1.5-1.2Z",
  chevron: "m9 18 6-6-6-6",
  sun: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  moon: "M20.2 15.1A8.3 8.3 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z",
  monitor: "M3 4.5h18v13H3zM8 21h8m-4-3.5V21",
  arrow: "M5 12h14m-6-6 6 6-6 6",
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function loadInitialPreferences() {
  try {
    return readPreferences(window.localStorage);
  } catch {
    return {
      preferences: DEFAULT_PREFERENCES,
      warning: "Saved settings are unavailable. Defaults are being used.",
    };
  }
}

export default function App() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [brandingError, setBrandingError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [preferenceState, setPreferenceState] = useState(loadInitialPreferences);
  const [settingsIssue, setSettingsIssue] = useState<string | null>(
    () => preferenceState.warning,
  );
  const preferences = preferenceState.preferences;

  useEffect(() => {
    let active = true;
    fetch("/app.toml")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load app.toml (${response.status}).`);
        }
        return response.text();
      })
      .then(parseBranding)
      .then((config) => {
        if (active) {
          document.title = config.name;
          setBranding(config);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setBrandingError(
            cause instanceof Error ? cause.message : "Could not load launcher configuration.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const applyTheme = () => {
      root.dataset.theme =
        preferences.theme === "system"
          ? media.matches
            ? "light"
            : "dark"
          : preferences.theme;
      root.dataset.reduceMotion = String(preferences.reduceMotion);
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [preferences.theme, preferences.reduceMotion]);

  function updatePreferences(next: Preferences) {
    setPreferenceState({ preferences: next, warning: null });
    try {
      setSettingsIssue(savePreferences(next, window.localStorage));
    } catch {
      setSettingsIssue("Settings could not be saved on this device.");
    }
  }

  if (brandingError) {
    return <main className="fatal-state">Ember could not start: {brandingError}</main>;
  }
  if (!branding) {
    return <main className="loading-state"><span className="loading-mark" />Loading Ember…</main>;
  }

  const pageCopy: Record<Page, { title: string; subtitle: string }> = {
    home: { title: "Home", subtitle: "Your space to play, your way." },
    profiles: { title: "Your profiles", subtitle: "Keep every setup in its own place." },
    settings: { title: "Settings", subtitle: "Make Ember feel like yours." },
  };

  return (
    <main
      className="app-shell"
      style={
        {
          "--ember-accent": preferences.accent,
          "--ember-background": branding.backgroundColor,
        } as CSSProperties
      }
    >
      <aside className="sidebar">
        <button className="brand-lockup" type="button" onClick={() => setPage("home")}>
          <span className="brand-mark">
            <img src={branding.logoPath} alt="" />
          </span>
          <span className="brand-name">{branding.name}</span>
          <span className="brand-edition">CLIENT</span>
        </button>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavButton active={page === "home"} icon="home" label="Home" onClick={() => setPage("home")} />
          <NavButton
            active={page === "profiles"}
            icon="layers"
            label="My profiles"
            onClick={() => setPage("profiles")}
          />
          <NavButton
            active={page === "settings"}
            icon="settings"
            label="Settings"
            onClick={() => setPage("settings")}
          />
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="sidebar-note-icon"><Icon name="layers" size={17} /></span>
          <span>Every world has a story.</span>
          <span className="sidebar-note-dot" />
        </div>
        <div className="sidebar-bottom">
          <span className="build-dot" />
          <span>Preview build</span>
          <span className="build-version">v{branding.version}</span>
        </div>
      </aside>

      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-muted">EMBER</span>
            <span className="breadcrumb-divider">/</span>
            <span>{pageCopy[page].title}</span>
          </div>
          <div className="topbar-actions">
            <span className="connection-pill"><span />Preview mode</span>
            <button
              className="account-button"
              type="button"
              disabled
              title="Microsoft sign-in is not implemented in this preview."
            >
              <span className="account-avatar">?</span>
              <span>Account</span>
              <span className="account-chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="section-kicker">MINECRAFT JAVA <span>·</span> EARLY PREVIEW</p>
              <h1>{pageCopy[page].title}</h1>
              <p>{pageCopy[page].subtitle}</p>
            </div>
            {page === "home" && (
              <button
                className="outline-button"
                type="button"
                onClick={() => setPage("profiles")}
                aria-label="Open your profiles"
              >
                <Icon name="layers" size={17} /> Your profiles <span className="count-badge">0</span>
              </button>
            )}
          </div>

          {settingsIssue && (
            <div className="settings-notice" role="status">
              <span>{settingsIssue}</span>
              <button type="button" onClick={() => setSettingsIssue(null)} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}

          {page === "home" && <HomePage onOpenProfiles={() => setPage("profiles")} />}
          {page === "profiles" && <ProfilesPage />}
          {page === "settings" && (
            <SettingsPage
              preferences={preferences}
              onChange={updatePreferences}
              onReset={() => updatePreferences(DEFAULT_PREFERENCES)}
            />
          )}
        </div>

        <footer className="app-footer">
          <span>Independent community software · Not affiliated with Mojang or Microsoft</span>
          <a href="https://github.com/bajablsts/EmberClient" target="_blank" rel="noreferrer">
            Ember on GitHub <Icon name="arrow" size={14} />
          </a>
        </footer>
      </section>
    </main>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-button${active ? " is-active" : ""}`}
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <Icon name={icon} />
      <span>{label}</span>
      {active && <span className="nav-active-dot" />}
    </button>
  );
}

function HomePage({ onOpenProfiles }: { onOpenProfiles: () => void }) {
  return (
    <>
      <section className="hero-card">
        <img className="hero-art" src="/brand/ember-landscape.svg" alt="" />
        <div className="hero-vignette" />
        <div className="hero-copy">
          <span className="hero-tag"><span /> YOUR NEXT ADVENTURE STARTS HERE</span>
          <h2>Build your<br /><em>next world.</em></h2>
          <p>Make a home for every version, every modpack, and every world you call yours.</p>
          <button className="hero-button" type="button" onClick={onOpenProfiles}>
            <span className="button-pixel" aria-hidden="true" /> Open your profiles <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="hero-index"><span>01</span> / YOUR JOURNEY</div>
      </section>

      <section className="status-row" aria-label="Launcher status">
        <StatusCard label="YOUR WORLDS" value="Not yet generated" note="Your next save starts here" kind="ember" />
        <StatusCard label="GAME VERSION" value="Not installed" note="Install support is coming soon" kind="neutral" />
        <StatusCard label="PROFILE" value="No profile selected" note="Keep each setup separate" kind="muted" />
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="section-title-row">
          <div>
            <p className="section-kicker">THE ROAD AHEAD</p>
            <h2>Everything for your next great session.</h2>
          </div>
          <span className="roadmap-label"><span /> PROJECT PREVIEW</span>
        </div>
        <div className="roadmap-grid">
          <RoadmapCard number="01" title="Separate worlds" detail="Keep versions, settings, saves, and mods in their own profiles." state="Coming next" />
          <RoadmapCard number="02" title="One-click play" detail="Install the game and matching Java runtime from trusted sources." state="In the works" />
          <RoadmapCard number="03" title="Community mods" detail="Find add-ons compatible with the profile you want to play." state="On the roadmap" />
        </div>
      </section>
    </>
  );
}

function StatusCard({
  label,
  value,
  note,
  kind,
}: {
  label: string;
  value: string;
  note: string;
  kind: "ember" | "neutral" | "muted";
}) {
  return (
    <article className={`status-card status-${kind}`}>
      <div className="status-card-top"><span>{label}</span><span className="status-indicator" /></div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function RoadmapCard({
  number,
  title,
  detail,
  state,
}: {
  number: string;
  title: string;
  detail: string;
  state: string;
}) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top"><span>{number}</span><Icon name="chevron" size={16} /></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <div className="roadmap-state"><span />{state}</div>
    </article>
  );
}

function ProfilesPage() {
  return (
    <section className="empty-page">
      <div className="empty-illustration" aria-hidden="true">
        <span className="empty-orbit orbit-one" />
        <span className="empty-orbit orbit-two" />
        <span className="empty-core"><Icon name="layers" size={29} /></span>
        <span className="empty-spark spark-one" />
        <span className="empty-spark spark-two" />
      </div>
      <p className="section-kicker">A PLACE FOR EVERY PLAY STYLE</p>
      <h2>Your profiles start here.</h2>
      <p className="empty-description">
        Profiles will keep game versions, settings, and mods separate. Profile creation becomes
        available when game installation is implemented.
      </p>
      <button className="disabled-action" type="button" disabled>
        <span>＋</span> Create a profile <small>COMING SOON</small>
      </button>
      <span className="empty-caption">Nothing to install yet. Your worlds stay yours.</span>
    </section>
  );
}

function SettingsPage({
  preferences,
  onChange,
  onReset,
}: {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  onReset: () => void;
}) {
  const themeOptions: { value: ThemePreference; label: string; icon: IconName }[] = [
    { value: "dark", label: "Dark", icon: "moon" },
    { value: "light", label: "Light", icon: "sun" },
    { value: "system", label: "System", icon: "monitor" },
  ];

  return (
    <div className="settings-layout">
      <section className="settings-panel">
        <div className="settings-panel-heading">
          <span className="settings-panel-icon"><Icon name="sun" size={18} /></span>
          <div><h2>Appearance</h2><p>Set the mood for your workspace.</p></div>
        </div>
        <div className="setting-row">
          <div className="setting-description"><strong>Color theme</strong><span>Choose how Ember looks on this device.</span></div>
          <div className="theme-picker" role="group" aria-label="Color theme">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                className={`theme-option${preferences.theme === option.value ? " selected" : ""}`}
                type="button"
                aria-pressed={preferences.theme === option.value}
                onClick={() => onChange({ ...preferences, theme: option.value })}
              >
                <Icon name={option.icon} size={16} /><span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="setting-row accent-row">
          <div className="setting-description"><strong>Accent color</strong><span>A little Ember, your way.</span></div>
          <div className="accent-picker" role="group" aria-label="Accent color">
            {ACCENT_COLORS.map((color, index) => (
              <button
                key={color}
                className={`accent-swatch${preferences.accent === color ? " selected" : ""}`}
                style={{ "--swatch": color } as CSSProperties}
                type="button"
                aria-label={`Accent color ${index + 1}`}
                aria-pressed={preferences.accent === color}
                onClick={() => onChange({ ...preferences, accent: color })}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="settings-panel">
        <div className="settings-panel-heading">
          <span className="settings-panel-icon"><Icon name="monitor" size={18} /></span>
          <div><h2>Comfort</h2><p>Make the interface work for you.</p></div>
        </div>
        <div className="setting-row">
          <div className="setting-description"><strong>Reduce motion</strong><span>Keep transitions subtle across the app.</span></div>
          <button
            className={`toggle-switch${preferences.reduceMotion ? " on" : ""}`}
            type="button"
            role="switch"
            aria-checked={preferences.reduceMotion}
            aria-label="Reduce motion"
            onClick={() => onChange({ ...preferences, reduceMotion: !preferences.reduceMotion })}
          ><span /></button>
        </div>
      </section>

      <section className="settings-panel project-panel">
        <div>
          <p className="section-kicker">A NOTE FROM THE TEAM</p>
          <h2>Small team. Big cozy energy.</h2>
          <p>Ember is independent community software. It is not affiliated with Mojang or Microsoft, and it has no game access yet.</p>
        </div>
        <button className="text-button" type="button" onClick={onReset}>Reset preferences</button>
      </section>
    </div>
  );
}
