import { requireSiteUser } from "@/app/site-auth";
import { googleSignIn, googleSignOut } from "@/app/auth-actions";
import {
  identity,
  content,
  runtime,
  certificateByCode,
  passes,
} from "@/lib/server";
import { cleanDescription } from "@/app/event-text";
import Platform from "@/app/platform";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
// One clear, distinct search intent per section instead of every page
// falling back to the same generic sentence — each names PAICONS, Pakistan
// and what's actually on that page, which is what shows up in a search
// snippet and what a searcher actually compares against their query.
const sectionMeta: Record<string, { title: string; description: string }> = {
  events: {
    title: "AI Events & Meetups in Pakistan",
    description:
      "Upcoming AI summits, meetups and workshops across Pakistan — see dates, venues, speakers and how to get your pass, from PAICONS, Pakistan's AI community.",
  },
  courses: {
    title: "AI Courses & Workshops in Pakistan",
    description:
      "Practical, beginner-friendly AI courses and workshops from PAICONS, with free and paid options and a certificate of completion.",
  },
  membership: {
    title: "Join the PAICONS AI Community in Pakistan",
    description:
      "Join PAICONS, Pakistan's AI community — get updates on AI events, courses and networking opportunities, and connect with students, builders and professionals across Pakistan.",
  },
  about: {
    title: "About PAICONS — Pakistan's AI Community",
    description:
      "PAICONS (Pakistan AI Collaboration & Opportunities Network) connects students, developers, founders and professionals through AI. Meet the founder and the story behind the community.",
  },
  partners: {
    title: "Partner with PAICONS — AI Events in Pakistan",
    description:
      "Partner with PAICONS to reach Pakistan's AI community through sponsorship, education, technology, venue or media partnerships across our events and programs.",
  },
  contact: {
    title: "Contact PAICONS",
    description:
      "Questions about PAICONS events, courses, speaking or partnerships? Get in touch with Pakistan's AI community.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How PAICONS collects, uses and protects your information across its events, courses and community services.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "The terms that govern using PAICONS events, courses, membership and community services.",
  },
  "refund-policy": {
    title: "Refund Policy",
    description:
      "PAICONS' refund policy for event passes, tickets and paid courses.",
  },
};
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
  const sectionFallback = path[0].replace(/^./, (c) => c.toUpperCase());
  let title = sectionMeta[path[0]]?.title || sectionFallback;
  let description =
    sectionMeta[path[0]]?.description ||
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
  // Titles already ending in the brand name (an admin-written SEO title, or
  // a record literally called "PAICONS …") don't get it appended twice.
  const finalTitle = /paicons\s*$/i.test(title.trim())
    ? title.trim()
    : title + " | PAICONS";
  return {
    title: finalTitle,
    description,
    robots: privatePage ? { index: false, follow: false } : undefined,
    alternates: { canonical: base + "/" + path.join("/") },
    openGraph: {
      title: finalTitle,
      description,
      url: base + "/" + path.join("/"),
      ...(image ? { images: [image] } : {}),
    },
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
    let tickets: any[] = [];
    if (e && path[0] === "events") {
      try {
        tickets = await passes(e.id);
      } catch {}
    }
    if (e) {
      const activePrices = tickets
        .filter((t) => t.status === "active")
        .map((t) => t.displayPrice);
      schema =
        path[0] === "events"
          ? {
              "@context": "https://schema.org",
              "@type": "Event",
              name: e.title,
              description: cleanDescription(e.description),
              startDate: e.date + "T" + e.time + ":00+05:00",
              ...(e.end
                ? { endDate: e.date + "T" + e.end + ":00+05:00" }
                : {}),
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode:
                e.locationType === "online"
                  ? "https://schema.org/OnlineEventAttendanceMode"
                  : "https://schema.org/OfflineEventAttendanceMode",
              ...(e.banner ? { image: new URL(e.banner, base).href } : {}),
              location:
                e.locationType === "online"
                  ? { "@type": "VirtualLocation", url: base + "/events/" + e.slug }
                  : {
                      "@type": "Place",
                      name: e.venue,
                      address: {
                        "@type": "PostalAddress",
                        ...(e.address ? { streetAddress: e.address } : {}),
                        addressLocality: e.city,
                        addressCountry: "PK",
                      },
                    },
              organizer: {
                "@type": "Organization",
                name: e.organizer || "PAICONS",
                url: base,
              },
              ...(activePrices.length
                ? {
                    offers: {
                      "@type": "AggregateOffer",
                      priceCurrency: "PKR",
                      lowPrice: Math.min(...activePrices),
                      highPrice: Math.max(...activePrices),
                      availability: "https://schema.org/InStock",
                      url: base + "/events/" + e.slug,
                    },
                  }
                : {}),
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
