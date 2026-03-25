import { fetchAllGuides } from "@/lib/supabase-server";

const SITE_URL = "https://sureline.kr";

export default async function sitemap() {
  const guides = await fetchAllGuides(200);
  const guideEntries = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: g.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/guides`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...guideEntries,
  ];
}
