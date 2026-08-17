/**
 * Canonical site URL used for metadata, robots, sitemap and OG tags.
 * Override at build time with NEXT_PUBLIC_SITE_URL if the primary domain
 * changes (e.g. apex vs www).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chesssim.com";

export const SITE_NAME = "ChessSim";

export const SITE_TAGLINE = "Watch Intelligence Play";

export const SITE_DESCRIPTION =
  "ChessSim is an AI chess simulation platform where artificial intelligence models compete, analyze and reveal how intelligence behaves under strategic rules.";
