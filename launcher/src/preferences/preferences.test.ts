import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  savePreferences,
  type PreferenceStorage,
} from "./preferences";

function memoryStorage(initialValue: string | null = null): PreferenceStorage & {
  value: string | null;
} {
  return {
    value: initialValue,
    getItem() {
      return this.value;
    },
    setItem(_key, value) {
      this.value = value;
    },
  };
}

describe("launcher preferences", () => {
  it("uses safe defaults when no settings have been saved", () => {
    expect(readPreferences(memoryStorage())).toEqual({
      preferences: DEFAULT_PREFERENCES,
      warning: null,
    });
  });

  it("round-trips valid preferences", () => {
    const storage = memoryStorage();
    const preferences = {
      theme: "light" as const,
      accent: "#8d7aff" as const,
      reduceMotion: true,
    };

    expect(savePreferences(preferences, storage)).toBeNull();
    expect(readPreferences(storage)).toEqual({ preferences, warning: null });
  });

  it("resets malformed or unsupported saved values", () => {
    const storage = memoryStorage('{"theme":"system","accent":"url(evil)","reduceMotion":true}');

    expect(readPreferences(storage)).toEqual({
      preferences: { ...DEFAULT_PREFERENCES, theme: "system", reduceMotion: true },
      warning: "Some saved settings were invalid and have been reset.",
    });
  });

  it("reports invalid JSON and storage write failures", () => {
    const corrupt = memoryStorage("{");
    expect(readPreferences(corrupt).warning).toContain("unavailable");

    const failingStorage: PreferenceStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage blocked");
      },
    };
    expect(savePreferences(DEFAULT_PREFERENCES, failingStorage)).toContain("could not be saved");
  });
});
