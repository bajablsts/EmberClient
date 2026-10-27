export type ThemePreference = "dark" | "light" | "system";

export const ACCENT_COLORS = ["#ff784e", "#8d7aff", "#45b7a3", "#e7ae4c"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export interface Preferences {
  theme: ThemePreference;
  accent: AccentColor;
  reduceMotion: boolean;
}

export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface PreferenceResult {
  preferences: Preferences;
  warning: string | null;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "dark",
  accent: ACCENT_COLORS[0],
  reduceMotion: false,
};

const STORAGE_KEY = "ember.preferences.v1";

export function readPreferences(storage: PreferenceStorage): PreferenceResult {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return { preferences: DEFAULT_PREFERENCES, warning: null };

    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed)) {
      return {
        preferences: DEFAULT_PREFERENCES,
        warning: "Saved settings could not be read. Defaults are being used.",
      };
    }

    const theme = isTheme(parsed.theme) ? parsed.theme : DEFAULT_PREFERENCES.theme;
    const accent = isAccent(parsed.accent) ? parsed.accent : DEFAULT_PREFERENCES.accent;
    const reduceMotion =
      typeof parsed.reduceMotion === "boolean"
        ? parsed.reduceMotion
        : DEFAULT_PREFERENCES.reduceMotion;
    const hadInvalidValue =
      parsed.theme !== theme ||
      parsed.accent !== accent ||
      parsed.reduceMotion !== reduceMotion;

    return {
      preferences: { theme, accent, reduceMotion },
      warning: hadInvalidValue ? "Some saved settings were invalid and have been reset." : null,
    };
  } catch {
    return {
      preferences: DEFAULT_PREFERENCES,
      warning: "Saved settings are unavailable. Defaults are being used.",
    };
  }
}

export function savePreferences(
  preferences: Preferences,
  storage: PreferenceStorage,
): string | null {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return null;
  } catch {
    return "Settings could not be saved on this device.";
  }
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

function isAccent(value: unknown): value is AccentColor {
  return typeof value === "string" && ACCENT_COLORS.some((color) => color === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
