import { runtime } from "@/lib/server";
export default function robots() {
  // This used to point at a stale preview hostname, which told crawlers
  // the sitemap lived somewhere other than the live site — silently
  // hurting indexing. It now always follows the real configured domain.
  const base =
    runtime().SITE_URL || "https://paicon-network.sure-emu-1764.chatgpt.site";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/pass", "/verify", "/course-access", "/api"],
    },
    sitemap: base + "/sitemap.xml",
  };
}
