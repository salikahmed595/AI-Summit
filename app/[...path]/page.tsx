import { requireSiteUser } from "@/app/site-auth";
import { googleSignIn, googleSignOut } from "@/app/auth-actions";
import { identity, content, runtime, certificateByCode } from "@/lib/server";
import { cleanDescription } from "@/app/event-text";
import Platform from "@/app/platform";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const privatePage = ["admin", "pass", "verify", "course-access"].includes(
    path[0],
  );
  const base =
    runtime().SITE_URL || "https://paicon-network.sure-emu-1764.chatgpt.site";
  let title = path[0].replaceAll("-", " ");
  let description =
    "Learn. Connect. Build. Explore PAICONS events, courses and community.";
  let image: string | undefined;
  try {
    if (["events", "courses"].includes(path[0]) && path[1]) {
      const record = (await content(path[0])).find(
        (r: any) => r.slug === path[1],
      );
      if (record) {
        title = record.seoTitle || record.title;
        description = record.seoDescription ||
          cleanDescription(record.description).slice(0, 160);
        if (record.banner) image = new URL(record.banner, base).href;
      }
    }
    if (path[0] === "certificate" && path[1]) {
      const cert = await certificateByCode(path[1]);
      if (cert) {
        title = `${cert.name} · ${cert.courseTitle} — PAICONS Certificate`;
        description = `Verified certificate of completion issued by PAICONS to ${cert.name} for ${cert.courseTitle}.`;
      }
    }
  } catch {}
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1) + " | PAICONS",
    description,
    robots: privatePage ? { index: false, follow: false } : undefined,
    alternates: { canonical: base + "/" + path.join("/") },
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  if (
    ![
      "admin",
      "pass",
      "verify",
      "course-access",
      "certificate",
      "events",
      "courses",
      "membership",
      "about",
      "partners",
      "contact",
      "privacy",
      "terms",
      "refund-policy",
    ].includes(path[0])
  )
    notFound();
  if (path[0] === "admin") {
    if (path[1] === "login") {
      return (
        <main className="page admin-login">
          <a href="/" className="brand">
            PAICONS
          </a>
          <div className="eyebrow">SECURE ORGANIZER ACCESS</div>
          <h1>Run PAICONS without touching code.</h1>
          <p>
            Create events and courses, manage tickets, review payments, and
            check in attendees from one protected workspace.
          </p>
          <form action={googleSignIn.bind(null, "/admin")}>
            <button className="button" type="submit">
              Sign in to Admin
            </button>
          </form>
        </main>
      );
    }
    await requireSiteUser("/admin");
    try {
      await identity();
    } catch {
      return (
        <main className="page">
          <a href="/" className="brand">
            PAICONS
          </a>
          <h1>Private dashboard</h1>
          <p>
            Your account is not on the administrator access list. Contact
            PAICONS's website owner to request access.
          </p>
          <form action={googleSignOut.bind(null, "/")}>
            <button className="button" type="submit">
              Sign out
            </button>
          </form>
        </main>
      );
    }
  }
  let schema: any = null;
  if (["events", "courses"].includes(path[0]) && path[1]) {
    const base =
      runtime().SITE_URL || "https://paicon-network.sure-emu-1764.chatgpt.site";
    let e: any;
    try {
      e = (await content(path[0])).find((x: any) => x.slug === path[1]);
    } catch {}
    if (e) {
      schema =
        path[0] === "events"
          ? {
              "@context": "https://schema.org",
              "@type": "Event",
              name: e.title,
              description: cleanDescription(e.description),
              startDate: e.date + "T" + e.time + ":00+05:00",
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode:
                e.locationType === "online"
                  ? "https://schema.org/OnlineEventAttendanceMode"
                  : "https://schema.org/OfflineEventAttendanceMode",
              location:
                e.locationType === "online"
                  ? { "@type": "VirtualLocation", url: base + "/events/" + e.slug }
                  : {
                      "@type": "Place",
                      name: e.venue,
                      address: {
                        "@type": "PostalAddress",
                        addressLocality: e.city,
                        addressCountry: "PK",
                      },
                    },
              organizer: { "@type": "Organization", name: "PAICONS" },
            }
          : {
              "@context": "https://schema.org",
              "@type": "Course",
              name: e.title,
              description: cleanDescription(e.description),
              ...(e.banner
                ? { image: new URL(e.banner, base).href }
                : {}),
              provider: {
                "@type": "Organization",
                name: "PAICONS",
                sameAs: base,
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: e.locationType === "online" || !e.venue
                  ? "online"
                  : "blended",
                courseWorkload: "PT2H",
              },
              offers: {
                "@type": "Offer",
                category: e.paid ? "Paid" : "Free",
                price: e.paid ? e.price || 0 : 0,
                priceCurrency: "PKR",
                availability: "https://schema.org/InStock",
                url: base + "/courses/" + e.slug,
              },
              ...(e.rating
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: e.rating,
                      reviewCount: Math.max(1, Number(e.reviewCount) || 1),
                    },
                  }
                : {}),
            };
    } else notFound();
  }
  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
          }}
        />
      )}
      <Platform path={path} />
    </>
  );
}
