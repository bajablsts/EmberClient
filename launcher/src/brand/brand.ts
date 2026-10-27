import { parse } from "smol-toml";

export interface Branding {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  logoPath: string;
}

export function parseBranding(source: string): Branding {
  const config: unknown = parse(source);
  if (!isRecord(config) || !isRecord(config.branding)) {
    throw new Error("Branding config must contain a [branding] table.");
  }

  const { name, primary_color, background_color, logo_path } = config.branding;
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof primary_color !== "string" ||
    !/^#[\da-fA-F]{6}$/.test(primary_color) ||
    typeof background_color !== "string" ||
    !/^#[\da-fA-F]{6}$/.test(background_color) ||
    typeof logo_path !== "string" ||
    !/^\/(?!\/)[A-Za-z0-9/_\-.]+$/.test(logo_path) ||
    logo_path.split("/").includes("..")
  ) {
    throw new Error("Branding config contains invalid or missing values.");
  }

  return {
    name,
    primaryColor: primary_color,
    backgroundColor: background_color,
    logoPath: logo_path,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
