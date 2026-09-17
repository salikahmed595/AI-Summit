import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PAICON — Learn. Connect. Build.",
  description:
    "Pakistan AI Collaboration & Opportunities Network. AI events, courses and community in Karachi and across Pakistan.",
  icons: { icon: "/favicon.svg" },
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
