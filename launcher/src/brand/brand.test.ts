import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseBranding } from "./brand";

describe("parseBranding", () => {
  it("loads the project branding from app.toml", () => {
    const configPath = fileURLToPath(new URL("../../../config/app.toml", import.meta.url));
    const branding = parseBranding(readFileSync(configPath, "utf8"));

    expect(branding).toEqual({
      name: "Ember",
      version: "0.1.0",
      primaryColor: "#f97316",
      backgroundColor: "#111318",
      logoPath: "/brand/ember-mark.svg",
    });
  });

  it("rejects unsafe logo paths and invalid colors", () => {
    const config = `[branding]
name = "Ember"
primary_color = "orange"
background_color = "#111318"
logo_path = "/../secret.svg"

[app]
version = "1.0.0"`;

    expect(() => parseBranding(config)).toThrow("invalid or missing");
  });

  it("rejects protocol-relative logo URLs", () => {
    const config = `[branding]
name = "Ember"
primary_color = "#f97316"
background_color = "#111318"
logo_path = "//example.invalid/logo.svg"

[app]
version = "1.0.0"`;

    expect(() => parseBranding(config)).toThrow("invalid or missing");
  });

  it("rejects configs without branding", () => {
    expect(() => parseBranding("[app]\nname = 'Ember'")).toThrow(
      "must contain [app] and [branding] tables",
    );
  });
});
