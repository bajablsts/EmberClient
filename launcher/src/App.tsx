import { useEffect, useState, type CSSProperties } from "react";
import { parseBranding, type Branding } from "./brand/brand";

export default function App() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          setError(cause instanceof Error ? cause.message : "Could not load branding.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <main className="error-state">Unable to start Ember: {error}</main>;
  }
  if (!branding) {
    return <main className="loading-state">Loading launcher configuration…</main>;
  }

  return (
    <main
      className="launcher-shell"
      style={
        {
          "--ember-accent": branding.primaryColor,
          "--ember-background": branding.backgroundColor,
        } as CSSProperties
      }
    >
      <header className="topbar">
        <div className="brand-lockup">
          <img src={branding.logoPath} alt="" width="34" height="34" />
          <span>{branding.name}</span>
        </div>
        <span className="account-status">Not signed in</span>
      </header>
      <section className="welcome-panel">
        <p className="eyebrow">YOUR GAME LIBRARY</p>
        <h1>A brighter way to play.</h1>
        <p className="description">
          Your profiles, mods, and worlds will live here. Sign in to get started.
        </p>
        <button className="primary-button" disabled type="button">
          Sign-in arrives in a later milestone
        </button>
      </section>
      <footer>Independent community software. Not affiliated with Mojang or Microsoft.</footer>
    </main>
  );
}
