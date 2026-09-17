export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/pass", "/verify", "/api"],
    },
    sitemap: "https://paicon-network.sure-emu-1764.chatgpt.site/sitemap.xml",
  };
}
