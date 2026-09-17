import { runtime, content } from "@/lib/server";
export default async function sitemap() {
  const base =
    runtime().SITE_URL || "https://paicon-network.sure-emu-1764.chatgpt.site";
  const pages = [
    "",
    "events",
    "courses",
    "about",
    "partners",
    "contact",
    "membership",
  ];
  let entries: any[] = [];
  try {
    entries = [...(await content("events")), ...(await content("courses"))];
  } catch {}
  return [
    ...pages.map((p) => ({ url: base + "/" + p })),
    ...entries.map((e) => ({
      url: base + "/" + e.kind + "/" + e.slug,
      lastModified: e.updated,
    })),
  ];
}
