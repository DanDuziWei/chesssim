import type { MetadataRoute } from "next";
import { getAllMatches } from "@/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/matches`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/arena`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/updates`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const matchPages: MetadataRoute.Sitemap = getAllMatches().map((m) => ({
    url: `${SITE_URL}/match/${m.slug}`,
    lastModified: new Date(m.createdAt),
    changeFrequency: "never",
    priority: 0.8,
  }));

  return [...staticPages, ...matchPages];
}
