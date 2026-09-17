import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = "https://pawpathvet.com";

// Generated on demand so newly listed clinics appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/vets`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Each public clinic profile is an indexable content page. If the database is
  // briefly unreachable we still serve a valid sitemap of the static routes.
  try {
    const clinics = await prisma.clinic.findMany({
      select: { id: true, createdAt: true },
    });
    const clinicRoutes: MetadataRoute.Sitemap = clinics.map((c) => ({
      url: `${BASE_URL}/vets/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...clinicRoutes];
  } catch (err) {
    console.error("sitemap: clinic query failed, serving static routes only", err);
    return staticRoutes;
  }
}
