import type { Metadata, Viewport } from "next";
import "./globals.css";
const SITE_URL =
  process.env.SITE_URL || "https://paicon-network.sure-emu-1764.chatgpt.site";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PAICONS — Learn. Connect. Build.",
  description:
    "Pakistan AI Collaboration & Opportunities Network. AI events, courses and community in Karachi and across Pakistan.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
// Sitewide identity markup — who PAICONS is and that the site is its
// official site — kept static (no DB fetch) so the homepage and other
// static pages can still be served without forcing every request dynamic.
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "PAICONS",
      alternateName: "Pakistan AI Collaboration & Opportunities Network",
      url: SITE_URL,
      logo: SITE_URL + "/favicon.svg",
      description:
        "PAICONS is Pakistan's AI community, connecting students, developers, founders and professionals through AI events, courses and networking in Karachi and across Pakistan.",
      areaServed: { "@type": "Country", name: "Pakistan" },
      sameAs: [
        "https://www.instagram.com/paicons_/",
        "https://chat.whatsapp.com/HXYTEtOcO09EVCCYuappJg",
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL,
      name: "PAICONS",
      inLanguage: "en",
      publisher: { "@id": SITE_URL + "/#organization" },
    },
  ],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replaceAll(
              "<",
              "\\u003c",
            ),
          }}
        />
        {children}
      </body>
    </html>
  );
}
