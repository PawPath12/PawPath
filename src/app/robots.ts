import type { MetadataRoute } from "next";

const BASE_URL = "https://pawpathvet.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / login-gated areas — no value to Google, keep them out of the index.
      disallow: ["/dashboard", "/account", "/book", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
