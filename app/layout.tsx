import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL || "https://paicon-network.sure-emu-1764.chatgpt.site",
  ),
  title: "PAICONS — Learn. Connect. Build.",
  description:
    "Pakistan AI Collaboration & Opportunities Network. AI events, courses and community in Karachi and across Pakistan.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
