"use client";
import { Fragment, useEffect, useState } from "react";
import { ArrowUpRight, Menu, Mail, Calendar, Clock, MapPin } from "lucide-react";
import { googleSignIn } from "./auth-actions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PassDownload from "./pass-download";
import { formatTime12 } from "./format-time";
import Admin from "./admin-panel";

function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function LinkedinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function WhatsappIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.11 0 4.09.82 5.58 2.31a7.85 7.85 0 0 1 2.31 5.59c0 4.36-3.55 7.91-7.91 7.91a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-3 .79.8-2.93-.19-.3a7.86 7.86 0 0 1-1.21-4.2c0-4.36 3.55-7.9 7.94-7.9zm-4.38 4.52c-.15 0-.4.06-.61.3-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.12.15 1.6 2.55 3.95 3.47 1.95.77 2.35.62 2.77.58.42-.04 1.36-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.1-.21-.15-.44-.27-.23-.12-1.36-.67-1.57-.74-.21-.08-.36-.12-.51.12-.15.24-.58.74-.71.89-.13.15-.26.17-.49.06-.23-.12-.96-.35-1.83-1.13-.68-.6-1.13-1.35-1.27-1.58-.13-.23-.01-.36.1-.47.11-.11.23-.27.35-.41.11-.14.15-.24.23-.4.08-.16.04-.3-.02-.42-.06-.12-.5-1.24-.7-1.7-.18-.44-.37-.38-.51-.39l-.44-.01z" />
    </svg>
  );
}
const SALIK_INSTAGRAM = "https://www.instagram.com/salikbuilds/";
const SALIK_LINKEDIN = "https://www.linkedin.com/in/salikahmed110/";
const PAICONS_INSTAGRAM = "https://www.instagram.com/paicons_/";
const PAICONS_WHATSAPP = "https://chat.whatsapp.com/HXYTEtOcO09EVCCYuappJg";
const defaultFounderStory = [
  {
    label: "JANUARY 2026",
    title: "It began with curiosity.",
    body: "Before PAICONS had a name, there was only a question: could artificial intelligence be made less intimidating and more useful for ordinary people? Salik Ahmed began with a phone, an Instagram page, and the patience to learn in public. No studio. No large team. No shortcut. Just the conviction that the future should be understandable to the people living in it.",
  },
  {
    label: "ONE VIDEO AT A TIME",
    title: "The quiet work mattered.",
    body: "Some posts travelled. Others did not. There were ideas that failed, days that felt uncertain, and the familiar doubt that arrives when you are building before anyone else can see the shape of it. Salik kept making the next video anyway — not because everything was figured out, but because progress is often built from the courage to take one more step.",
  },
  {
    label: "THE TURNING POINT",
    title: "People needed more than content.",
    body: "Then the messages began. Students wanted direction. Developers wanted peers. Founders wanted the right people in the room. Business owners wanted a practical way into AI. The question changed. It was no longer only, “How do we explain AI?” It became, “What could happen if the people ready to learn, build and lead actually found one another?”",
  },
  {
    label: "THE ROOM THAT WAS MISSING",
    title: "Talent was everywhere. Connection was not.",
    body: "A student could have the drive to build but no founder to learn from. A founder could have an idea but not know the developer who could bring it to life. An experienced professional could have years of wisdom and no bridge to the next generation. Everyone was moving — but too often, everyone was moving alone.",
  },
  {
    label: "WHAT GREW",
    title: "An idea became a community.",
    body: "Today, more than 300 people are connected through this shared curiosity: students, developers, founders, entrepreneurs, business owners and professionals. Along the way came milestones — NICAT finalist, Antler shortlist, and a Top 10 place in the Youth Innovation Challenge. They matter because they prove that a starting point does not have to decide a destination. But the people in the room matter more.",
  },
  {
    label: "WHY PAICONS EXISTS",
    title: "One conversation can change a direction.",
    body: "PAICONS exists so that more people in Pakistan can stop growing in isolation. A conversation can become an idea. A mentor can save years of mistakes. A new friend can become a collaborator. A single event can put a future co-founder, customer or opportunity in the same room. Events end. The relationships formed inside them can keep moving for years.",
  },
];
type LegalSection = { heading: string; body: string; list?: string[] };
type LegalDoc = {
  title: string;
  effective: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  disclaimer: string;
};
const legalDocs: Record<"privacy" | "terms", LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    effective: "September 27, 2026",
    updated: "September 19, 2026",
    intro:
      "PAICONS respects your privacy. This Policy explains what information we may collect, why we use it, and the choices available to you.",
    sections: [
      {
        heading: "1. Information We May Collect",
        body: "Depending on how you use PAICONS, we may collect information such as your name, email address, phone number, city, organization, profession, event registration details, membership information, transaction status, form responses, and information you choose to share with us.",
      },
      {
        heading: "2. Technical Information",
        body: "Our website and service providers may automatically receive limited technical information such as IP address, browser type, device type, pages visited, referral source, approximate location, cookies, and website interactions.",
      },
      {
        heading: "3. Why We Use Your Information",
        body: "We may use your information to run events and services, process registrations, issue passes, manage accounts, communicate event updates, provide support, improve our website, prevent misuse, maintain security, and meet legal or operational requirements.",
      },
      {
        heading: "4. Emails and 'Stay in the Loop'",
        body: "If you enter your email in our newsletter or 'Stay in the Loop' form, we may send you PAICONS updates, events, workshops, community news, and opportunities. You can unsubscribe from promotional messages at any time using the unsubscribe option in the email or by contacting us.",
      },
      {
        heading: "5. Payments",
        body: "If a PAICONS service requires payment, a third-party payment provider may process the transaction. PAICONS may receive information such as payment status, transaction reference, and purchase details. We do not need to store complete payment card details when the payment provider handles them directly.",
      },
      {
        heading: "6. Cookies and Analytics",
        body: "We may use cookies and analytics tools to keep the website working, remember preferences, understand traffic, measure performance, and improve the user experience. Where required, we may ask for permission before using optional cookies.",
      },
      {
        heading: "7. Service Providers and Partners",
        body: "We may use third-party providers for hosting, databases, authentication, email, analytics, payment processing, event registration, and cloud services. These providers may process limited information needed to provide their service. If an event is co-organized with another organization, relevant registration information may be shared when reasonably necessary to run that event.",
      },
      {
        heading: "8. We Do Not Sell Personal Information",
        body: "PAICONS does not sell your personal information. We may share information with service providers, event partners, professional advisers, or authorities where reasonably necessary, legally required, or needed to protect users and the platform.",
      },
      {
        heading: "9. Photos and Videos",
        body: "PAICONS events may be photographed or recorded. Images or videos may be used for event recaps, community updates, website content, social media, or promotion. If you have a reasonable concern about identifiable event media featuring you, contact us and we will review the request.",
      },
      {
        heading: "10. Public Information and Community Posts",
        body: "Information you choose to post in a public or group community area may be visible to other members. Do not post passwords, financial information, private documents, or other sensitive information that you do not want others to see.",
      },
      {
        heading: "11. Security",
        body: "We use reasonable technical and organizational steps to protect information. However, no website, database, or internet transmission can be guaranteed to be completely secure.",
      },
      {
        heading: "12. Data Retention",
        body: "We keep personal information only for as long as reasonably needed to provide services, maintain records, resolve problems, protect the platform, or meet legal and accounting requirements. Information may later be deleted, anonymized, or securely archived where appropriate.",
      },
      {
        heading: "13. Your Choices",
        body: "Depending on applicable law and the circumstances, you may ask us to correct inaccurate information, update your details, stop promotional emails, or delete certain personal information. We may need to verify your identity before completing some requests.",
      },
      {
        heading: "14. Children and Younger Users",
        body: "Some PAICONS activities may be suitable for students or younger participants. Where appropriate, we may require parent or guardian permission for specific activities involving minors. We do not intentionally ask children for information that is unnecessary for the activity.",
      },
      {
        heading: "15. External Links",
        body: "Our website may link to third-party websites or services. Their privacy and security practices are controlled by them, not PAICONS. Please review their policies when you use those services.",
      },
      {
        heading: "16. Protecting Users and PAICONS",
        body: "We may use or preserve relevant account, registration, security, or communication records when reasonably necessary to investigate fraud, impersonation, harassment, misuse of PAICONS' identity, security incidents, legal claims, or serious violations of our Terms. We will only use or share such information as reasonably necessary and permitted by law.",
      },
      {
        heading: "17. Changes to This Policy",
        body: "We may update this Privacy Policy when our services, technology, or legal obligations change. The latest version will be posted on our website with its updated date.",
      },
      {
        heading: "18. Contact",
        body: "For privacy questions or requests, contact PAICONS using the official contact email shown on our website.",
      },
    ],
    disclaimer:
      "Note: This document is a general website privacy template and is not a substitute for advice from a qualified lawyer.",
  },
  terms: {
    title: "Terms of Use",
    effective: "September 27, 2026",
    updated: "September 19, 2026",
    intro:
      "Please read these Terms before using PAICONS. By using our website, registering for an event, joining our community, buying a ticket, or using a PAICONS service, you agree to these Terms.",
    sections: [
      {
        heading: "1. About PAICONS",
        body: "PAICONS is a community and platform that connects people interested in artificial intelligence, technology, learning, entrepreneurship, networking, and professional opportunities in Pakistan. We may offer events, meetups, workshops, courses, memberships, digital passes, community access, speaker sessions, and partner activities.",
      },
      {
        heading: "2. Who Can Use PAICONS",
        body: "You must provide correct information when you register. Some events or programs may have age, location, profession, invitation, or other entry requirements. We may refuse or cancel a registration if these requirements are not met or if information is false.",
      },
      {
        heading: "3. Registrations, Tickets and Passes",
        body: "Tickets, QR codes, digital passes, memberships, and registrations are for the person or use stated at the time of registration, unless we clearly allow transfers. You must not copy, alter, forge, sell, or misuse a PAICONS pass or registration.",
      },
      {
        heading: "4. Payments and Refunds",
        body: "Paid services will show the price before purchase. Payment may be handled by a third-party payment provider. Refund rules may vary by event or service and will be shown where possible before purchase. Unless we state otherwise, missing an event does not automatically qualify for a refund. If PAICONS cancels a paid event, we may offer a refund, credit, replacement date, or another reasonable solution.",
      },
      {
        heading: "5. Event Changes",
        body: "Event dates, times, venues, speakers, schedules, or formats may change because of operational, safety, venue, partner, or other practical reasons. We will try to communicate important changes, but we cannot guarantee that every event detail will remain unchanged.",
      },
      {
        heading: "6. Community Conduct",
        body: "PAICONS is intended to be a respectful and useful community. We may remove or restrict a person who harms the safety, trust, or normal operation of the community. You must not:",
        list: [
          "harass, threaten, bully, discriminate against, or deliberately target another person;",
          "spam members, run scams, or repeatedly promote products or services without permission;",
          "impersonate PAICONS, its team, a speaker, partner, sponsor, or another member;",
          "publish or spread knowingly false statements presented as facts about PAICONS, its team, events, speakers, partners, or members;",
          "create fake pages, accounts, tickets, certificates, endorsements, partnerships, or claims that suggest PAICONS supports you when it does not;",
          "use PAICONS branding, logos, event material, photos, or identity in a misleading way;",
          "interfere with the website, registration systems, payments, events, or community operations;",
          "use PAICONS for illegal activity, fraud, malware, data theft, or unauthorized collection of personal information.",
        ],
      },
      {
        heading: "7. Honest Reviews and Fair Criticism",
        body: "PAICONS does not prohibit honest opinions, fair reviews, complaints, or good-faith criticism. However, users must not knowingly publish false factual claims, impersonate PAICONS, fabricate evidence, or deliberately mislead people about an official PAICONS position, partnership, event, or statement.",
      },
      {
        heading: "8. Protecting PAICONS' Name and Reputation",
        body: "The PAICONS name, logo, event identity, and official communication channels must not be used in a way that falsely suggests approval, sponsorship, employment, partnership, certification, or endorsement. If we reasonably believe content or conduct is misleading, fraudulent, unlawful, or falsely presented as official PAICONS content, we may ask for correction or removal, suspend access, cancel registration, or take other lawful steps.",
      },
      {
        heading: "9. Photos, Video and Event Media",
        body: "PAICONS events may be photographed or recorded. Event media may be used for community updates, event recaps, social media, website content, and promotion. Where practical, a person who does not want to be prominently featured may contact the PAICONS team. Separate consent may be requested for dedicated interviews or similar recordings.",
      },
      {
        heading: "10. Speakers, Partners and Third Parties",
        body: "PAICONS may work with universities, companies, venues, speakers, sponsors, communities, and service providers. Their views and services are their own unless PAICONS clearly states otherwise. A logo, speaker appearance, or event collaboration does not automatically mean an ongoing partnership or endorsement.",
      },
      {
        heading: "11. No Guaranteed Results",
        body: "PAICONS creates opportunities to learn, meet people, and participate in events. We do not guarantee jobs, investment, funding, admissions, clients, income, partnerships, business success, or any other specific result.",
      },
      {
        heading: "12. Intellectual Property",
        body: "PAICONS' original website content, branding, graphics, event material, and other original material belong to PAICONS or their respective rights holders. You may not copy, sell, reproduce, or commercially use them without permission. Speaker-owned and partner-owned material remains the property of its owner.",
      },
      {
        heading: "13. Website Availability",
        body: "We try to keep the website accurate and available, but errors, maintenance, downtime, or technical problems may happen. We may change, pause, or remove features when needed.",
      },
      {
        heading: "14. Suspension or Removal",
        body: "We may suspend or remove access to PAICONS services, events, or communities when a person breaks these Terms, creates a safety risk, commits fraud, repeatedly disrupts the community, or misuses PAICONS' identity. Where appropriate, we may first ask the person to correct the issue.",
      },
      {
        heading: "15. Limitation of Liability",
        body: "To the extent allowed by applicable law, PAICONS is not responsible for indirect or consequential loss caused by use of the website, attendance at an event, reliance on third-party content, or interruption of a service. Nothing in these Terms removes rights that cannot legally be excluded.",
      },
      {
        heading: "16. Changes to These Terms",
        body: "We may update these Terms when PAICONS changes or when legal or operational requirements change. The latest version will be posted on our website with the updated date.",
      },
      {
        heading: "17. Contact",
        body: "For questions about these Terms, contact PAICONS at the official contact email shown on our website.",
      },
    ],
    disclaimer:
      "Note: This document is a general website policy template and is not a substitute for advice from a qualified lawyer.",
  },
};
export async function api(
  path: string,
  data?: unknown,
  headers?: Record<string, string>,
) {
  let r: Response;
  try {
    r = await fetch("/api/paicon/" + path, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        ...(data instanceof FormData
          ? {}
          : data === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        ...headers,
      },
      body:
        data === undefined
          ? undefined
          : data instanceof FormData
            ? data
            : JSON.stringify(data),
    });
  } catch {
    // The browser's own "Failed to fetch" only ever means the request never
    // reached the server — a dropped connection, offline, or a slow mobile
    // network timing out a large upload. It never means the server said no.
    throw new Error(
      "Couldn't reach PAICONS. Check your connection and try again.",
    );
  }
  let d: any;
  try {
    d = await r.json();
  } catch {
    throw new Error("Unexpected response from the server. Please try again.");
  }
  if (!r.ok) throw new Error(d.error || "Unable to complete this request");
  return d;
}
export function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  ...rest
}: any) {
  return (
    <label>
      {label}
      {required ? " *" : ""}
      <input
        name={name || label}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        {...rest}
      />
    </label>
  );
}
export function Area({ label, value, onChange, ...rest }: any) {
  return (
    <label>
      {label}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </label>
  );
}
function LocalPhotoField({
  label,
  required,
  hint,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  onChange: (file?: File) => void;
}) {
  const [preview, setPreview] = useState("");
  return (
    <label className="photo-field">
      <span className="photo-field-label">
        {label}
        {required ? " *" : ""}
      </span>
      <span className="photo-field-box">
        {preview ? (
          <img src={preview} alt="" className="photo-field-preview" />
        ) : (
          <span className="photo-field-placeholder">
            <ArrowUpRight size={18} style={{ transform: "rotate(-45deg)" }} />
            Tap to choose a photo
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png"
          required={required}
          onChange={(e) => {
            const f = e.target.files?.[0];
            onChange(f);
            setPreview(f ? URL.createObjectURL(f) : "");
          }}
        />
      </span>
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Choice({ label, value, onChange, options }: any) {
  return (
    <label>
      {label}
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o: any) => (
            <SelectItem
              key={typeof o === "string" ? o : o.value}
              value={typeof o === "string" ? o : o.value}
            >
              {typeof o === "string" ? o : o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
export function Header() {
  return (
    <>
      <div className="top-status">
        <span>
          <i className="status-pulse" /> PAKISTAN'S AI COMMUNITY
        </span>
        <strong className="top-message">
          IDEAS GROW FASTER IN THE RIGHT ROOM.
        </strong>
        <span className="top-status-tag">LEARN · CONNECT · BUILD</span>
      </div>
      <header className="nav">
        <a className="brand" href="/" aria-label="PAICONS home">
          PAICONS<span>®</span>
        </a>
        <nav>
          {[
            ["Home", "/"],
            ["Events", "/events"],
            ["Courses", "/courses"],
            ["Membership", "/membership"],
            ["About", "/about"],
            ["Partners", "/partners"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <a href={href} key={label}>
              {label}
            </a>
          ))}
        </nav>
        <div className="row">
          <a className="button small" href="/events">
            Get Tickets <ArrowUpRight size={16} />
          </a>
          <Sheet>
            <SheetTrigger aria-label="Open navigation" className="mobile-menu">
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>PAICONS</SheetTitle>
              <div className="mobile-links">
                {[
                  "Home",
                  "Events",
                  "Courses",
                  "Membership",
                  "About",
                  "Partners",
                  "Contact",
                ].map((x) => (
                  <a key={x} href={x === "Home" ? "/" : "/" + x.toLowerCase()}>
                    {x}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
export function Upload({
  label,
  value,
  onChange,
  accept = "image/jpeg,image/png",
}: any) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <label>
      {label}
      <input
        type="file"
        accept={accept}
        onChange={async (e) => {
          if (!e.target.files?.[0]) return;
          setBusy(true);
          try {
            const f = new FormData();
            f.set("file", e.target.files[0]);
            const r = await api("upload", f);
            onChange(r.url);
            setError("");
          } catch (err: any) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && <span>Uploading…</span>}
      <input
        type="text"
        placeholder="…or paste an image/video URL (e.g. /media/your-file.png)"
        defaultValue={value && value.startsWith("/api/paicon/") ? "" : value}
        onBlur={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        style={{ marginTop: 8 }}
      />
      {value && accept.includes("video") ? (
        <video
          src={value}
          controls
          preload="metadata"
          style={{ width: "100%", maxHeight: 180, marginTop: 12 }}
        />
      ) : value ? (
        <img
          src={value}
          alt="Uploaded preview"
          style={{ height: 80, marginTop: 12 }}
        />
      ) : null}
      {error && <span className="error">{error}</span>}
    </label>
  );
}
export function Cards({ items, kind }: any) {
  return items.length ? (
    <div className="grid">
      {items.map((e: any) => (
        <a href={"/" + kind + "/" + e.slug} className="panel" key={e.id}>
          {e.banner ? (
            <img
              className="card-img card-img-contain"
              src={e.banner}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="mini-art">
              PAICONS <ArrowUpRight />
            </div>
          )}
          <div className="eyebrow" style={{ marginTop: 22 }}>
            {e.category || e.format} · {e.city}
          </div>
          <h2 style={{ fontSize: 28 }}>{e.title}</h2>
          <p>
            {e.date} {e.time && " · " + formatTime12(e.time)}
            <br />
            {kind === "courses"
              ? `${e.instructor} · ${e.duration} · ${e.level}`
              : e.venue}
          </p>
          <span className="text-button">
            {kind === "courses" ? "View course" : "Explore event"}{" "}
            <ArrowUpRight size={18} />
          </span>
        </a>
      ))}
    </div>
  ) : (
    <div className="empty">
      <h3>
        {kind === "courses"
          ? "New learning opportunities are on the way."
          : "The next connection is coming."}
      </h3>
      <p>
        {kind === "courses"
          ? "Published courses and workshops will appear here."
          : "PAICONS will announce upcoming events here. Check back for dates and passes."}
      </p>
      <a className="text-button" href="/contact">
        Stay in touch <ArrowUpRight size={18} />
      </a>
    </div>
  );
}
export default function Platform({ path }: { path: string[] }) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  const section = path[0];
  useEffect(() => {
    if (section === "admin" || section === "pass" || section === "verify")
      return;
    api(
      path[1] && ["events", "courses"].includes(section) ? "public" : "public",
    )
      .then(setData)
      .catch((e) => setError(e.message));
  }, [section, path[1]]);
  return (
    <>
      <Header />
      <main className="page">
        {section === "admin" ? (
          <Admin />
        ) : section === "pass" ? (
          <PassDownload />
        ) : section === "verify" ? (
          <Verify qr={path[1]} />
        ) : error ? (
          <div className="error" role="alert">
            {error} <button onClick={() => location.reload()}>Try again</button>
          </div>
        ) : !data ? (
          <PageSkeleton />
        ) : ["events", "courses"].includes(section) ? (
          path[1] ? (
            <EventDetails
              event={data[section].find((e: any) => e.slug === path[1])}
              all={data}
            />
          ) : (
            <Listing items={data[section]} kind={section} />
          )
        ) : (
          <Info section={section} data={data} />
        )}
      </main>
      <div className="page-footer">
        <a href="/">PAICONS · Learn. Connect. Build.</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status" aria-label="Loading page">
      <span className="skeleton-line skeleton-short" />
      <span className="skeleton-line skeleton-title" />
      <span className="skeleton-line" />
      <div className="grid">
        <span className="skeleton-card" />
        <span className="skeleton-card" />
      </div>
    </div>
  );
}
function Listing({ items, kind }: any) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All");
  const categories = [
    "All",
    "Upcoming",
    "Past",
    ...Array.from(new Set(items.map((x: any) => x.category).filter(Boolean))),
  ];
  const selected = items.filter(
    (e: any) =>
      e.title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Upcoming" &&
          e.date >= new Date().toISOString().slice(0, 10)) ||
        (filter === "Past" && e.date < new Date().toISOString().slice(0, 10)) ||
        e.category === filter),
  );
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context) return;
    const controller = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "filter_paicon_events",
          description: "Filter the visible published PAICONS listing by title.",
          inputSchema: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: ({ query: q }: any) => {
            if (typeof q !== "string" || q.length > 100)
              throw new Error("Enter a search under 100 characters");
            setQuery(q);
            return {
              count: items.filter((e: any) =>
                e.title.toLowerCase().includes(q.toLowerCase()),
              ).length,
            };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, [items]);
  return (
    <>
      <div className="eyebrow">LEARN. CONNECT. BUILD.</div>
      <h1>
        {kind === "events"
          ? "Find your next connection."
          : "Make curiosity a skill."}
      </h1>
      <p>
        {kind === "events"
          ? "Summits, meetups and workshops for Pakistan’s AI community."
          : "Practical learning. Real possibilities."}
      </p>
      <div className="grid">
        <Field label="Search" value={query} onChange={setQuery} />
        <Choice
          label="Browse"
          value={filter}
          onChange={setFilter}
          options={categories}
        />
      </div>
      <Cards items={selected} kind={kind} />
    </>
  );
}
function Bulleted({ text }: { text: string }) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (!lines.length) return null;
  return (
    <ul className="event-list">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}
function EventDetails({ event: e, all }: any) {
  const [info, setInfo] = useState<any>(null),
    [ticket, setTicket] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    if (e)
      api("event/" + e.id)
        .then(setInfo)
        .catch((x) => setError(x.message));
  }, [e]);
  if (!e)
    return (
      <>
        <h1>Event not found</h1>
        <a href="/events">Browse events</a>
      </>
    );
  return (
    <>
      <a className="text-button" href={"/" + e.kind}>
        ← All {e.kind}
      </a>
      {e.banner && (
        <div className="event-hero">
          <img src={e.banner} alt={e.title} />
        </div>
      )}
      {e.video && (
        <video
          className="card-img"
          src={e.video}
          controls
          preload="metadata"
          style={{ marginTop: 20 }}
        />
      )}
      <div className="eyebrow" style={{ marginTop: 30 }}>
        {e.category} · {e.city}
      </div>
      <h1>{e.title}</h1>
      <div className="event-quickfacts">
        <div className="event-quickfact">
          <Calendar size={26} />
          <div>
            <strong>
              {e.date
                ? new Date(e.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Date to be announced"}
            </strong>
            <span>Date</span>
          </div>
        </div>
        {e.time && (
          <div className="event-quickfact">
            <Clock size={26} />
            <div>
              <strong>
                {formatTime12(e.time)}
                {e.end ? ` – ${formatTime12(e.end)}` : ""}
              </strong>
              <span>{e.end ? "Time" : "Start time"}</span>
            </div>
          </div>
        )}
        <div className="event-quickfact">
          <MapPin size={26} />
          <div>
            <strong>{e.venue || "Venue to be announced"}</strong>
            <span>{e.city || "Venue"}</span>
          </div>
        </div>
      </div>
      <div className="grid">
        <div>
          <p style={{ whiteSpace: "pre-wrap" }}>{e.description}</p>
          {[
            ["What you’ll take away", e.outcomes, true],
            ["Agenda", e.agenda, true],
            ["Curriculum", e.curriculum, false],
            ["Requirements", e.requirements, false],
            ["Certificate information", e.certificate, false],
            ["Frequently asked questions", e.faqs, false],
          ].map(([title, text, bulleted]: any) =>
            text ? (
              <details className="event-section event-accordion" key={title}>
                <summary>
                  <h2>{title}</h2>
                </summary>
                <div className="event-accordion-body">
                  {bulleted ? (
                    <Bulleted text={text} />
                  ) : (
                    <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
                  )}
                </div>
              </details>
            ) : null,
          )}
          {e.kind === "courses" && (
            <p>
              {e.instructor} · {e.duration} · {e.format} · {e.level}
            </p>
          )}
          {e.organizer && (
            <p>
              <strong>Organized by:</strong> {e.organizer}
            </p>
          )}
          {e.address && <p>{e.address}</p>}
          {/^https:\/\//.test(e.mapUrl || "") && (
            <a href={e.mapUrl} target="_blank" rel="noreferrer">
              View venue map ↗
            </a>
          )}
          {e.cancellation && (
            <section>
              <h2 style={{ fontSize: 27 }}>Payment & cancellation</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{e.cancellation}</p>
            </section>
          )}
          {e.testimonials && (
            <section>
              <h2 style={{ fontSize: 27 }}>From the community</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{e.testimonials}</p>
            </section>
          )}
        </div>
        <aside id="tickets">
          <h2 style={{ fontSize: 30 }}>Get your pass.</h2>
          {error && <p className="error">{error}</p>}
          {info?.tickets
            .filter((t: any) => t.status === "active")
            .map((t: any) => {
              const soldOut = t.soldOut || t.reserved >= t.capacity;
              const premium = t.premium || /vip|premium/i.test(t.name);
              return (
                <div
                  className={`panel ticket-card ${premium ? "ticket-premium" : ""} ${soldOut ? "ticket-sold-out" : ""}`}
                  key={t.id}
                >
                  {premium && (
                    <span className="premium-kicker">PREMIUM EXPERIENCE</span>
                  )}
                  <details className="ticket-accordion">
                    <summary className="ticket-summary">
                      <h3>{t.name}</h3>
                      <strong>
                        {t.displayPrice === 0
                          ? "FREE"
                          : "PKR " + t.displayPrice.toLocaleString()}
                      </strong>
                    </summary>
                    <div className="ticket-details">
                      <p>{t.description}</p>
                      {premium && (
                        <p className="value-line">
                          Priority Access · Premium Seating · Exclusive
                          Networking · Speaker/Founder Access
                        </p>
                      )}
                      <div className="ticket-benefits">
                        <Bulleted text={t.benefits} />
                      </div>
                    </div>
                  </details>
                  {e.showSocialProof !== false &&
                    !soldOut &&
                    t.remaining <= 12 && (
                      <p className="scarcity">
                        Only {t.remaining} passes remaining
                      </p>
                    )}
                  {e.showSocialProof !== false && t.earlyBirdActive && (
                    <p className="early-bird">
                      Early-bird price ends{" "}
                      {new Date(t.earlyBirdDeadline).toLocaleString()}
                    </p>
                  )}
                  <button
                    className="button"
                    disabled={soldOut}
                    onClick={() => setTicket(t)}
                  >
                    {soldOut ? "SOLD OUT" : e.cta || "Get Your Pass"}{" "}
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              );
            })}
          {info && !info.tickets.some((t: any) => t.status === "active") && (
            <p>Registration will open soon.</p>
          )}
        </aside>
      </div>
      {(() => {
        const bookable = (info?.tickets || [])
          .filter(
            (t: any) =>
              t.status === "active" && !t.soldOut && t.remaining > 0,
          )
          .sort((a: any, b: any) => a.displayPrice - b.displayPrice);
        const cheapest = bookable[0];
        if (!cheapest) return null;
        // Opens that specific ticket's dialog directly — no scroll-then-hope
        // the visitor taps the right card, which is how a "free pass" tap
        // could land on a paid tier if cards ever reorder.
        return (
          <button
            type="button"
            className="mobile-ticket-cta"
            onClick={() => setTicket(cheapest)}
          >
            Get Your Pass —{" "}
            {cheapest.displayPrice === 0
              ? "Free"
              : "From PKR " + cheapest.displayPrice.toLocaleString()}
          </button>
        );
      })()}
      {all.speakers.filter((s: any) => s.event === e.id).length > 0 && (
        <>
          <h2>Meet the speakers.</h2>
          <div className="grid">
            {all.speakers
              .filter((s: any) => s.event === e.id)
              .map((s: any) => (
                <article className="panel" key={s.id}>
                  {s.banner && (
                    <img className="card-img" src={s.banner} alt={s.title} />
                  )}
                  <h3>{s.title}</h3>
                  <p>
                    {s.role} · {s.organization}
                  </p>
                  <p>{s.bio}</p>
                  {/^https:\/\//.test(s.linkedin) && (
                    <a href={s.linkedin} rel="noreferrer" target="_blank">
                      LinkedIn ↗
                    </a>
                  )}
                </article>
              ))}
          </div>
        </>
      )}
      {all.partners.filter((s: any) => s.event === e.id).length > 0 && (
        <>
          <h2>Event partners</h2>
          <div className="row">
            {all.partners
              .filter((s: any) => s.event === e.id)
              .map((s: any) => (
                <div className="panel" key={s.id}>
                  {s.title}
                  <p>{s.category}</p>
                </div>
              ))}
          </div>
        </>
      )}
      {e.gallery && (
        <>
          <h2>From the community</h2>
          <div className="grid">
            {e.gallery
              .split("\n")
              .filter((x: string) => x.startsWith("/api/paicon/file/"))
              .map((x: string) => (
                <img
                  className="card-img"
                  key={x}
                  src={x}
                  alt="Event gallery"
                  loading="lazy"
                />
              ))}
          </div>
        </>
      )}
      <Dialog open={!!ticket} onOpenChange={(open) => !open && setTicket(null)}>
        <DialogContent className="ticket-dialog max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogTitle>
            {ticket?.name} · {e.title}
          </DialogTitle>
          {ticket && (
            <Registration event={e} ticket={ticket} config={info.config} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function Registration({ event, ticket, config }: any) {
  const [form, setForm] = useState<any>({
      name: "",
      email: "",
      whatsapp: "",
      method: ticket.displayPrice ? "Bank Transfer" : "Free",
    }),
    [photo, setPhoto] = useState<File>(),
    [receipt, setReceipt] = useState<File>(),
    [agree, setAgree] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const set = (k: string) => (v: any) =>
    setForm((p: any) => ({ ...p, [k]: v }));
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!agree)
          return setError("Please agree to the privacy policy and terms.");
        if (!photo) return setError("Please upload your photograph.");
        setBusy(true);
        setError("");
        try {
          const f = new FormData();
          f.set(
            "data",
            JSON.stringify({ ...form, eventId: event.id, ticketId: ticket.id }),
          );
          f.set("photo", photo);
          if (receipt) f.set("receipt", receipt);
          const r = await api("register", f);
          location.href = "/pass#" + r.key;
        } catch (err: any) {
          setError(err.message);
          setBusy(false);
        }
      }}
    >
      <p>
        {ticket.displayPrice
          ? "Complete your details and submit proof of payment for manual review."
          : "Complete your details to receive your free pass."}
      </p>
      <div className="form-section">
        <div className="form-section-title">
          <span>1</span> Your details
        </div>
        {[
          ["name", "Full name", "text"],
          ["email", "Email", "email"],
          ["whatsapp", "WhatsApp number", "tel"],
        ].map(([k, l, t]) => (
          <Field
            key={k}
            label={l}
            type={t}
            value={form[k]}
            onChange={set(k)}
            required
            maxLength={254}
          />
        ))}
        {(event.fields || []).map((k: string) => (
          <Field
            key={k}
            label={k.charAt(0).toUpperCase() + k.slice(1)}
            value={form[k]}
            onChange={set(k)}
            maxLength={300}
          />
        ))}
      </div>
      <div className="form-section">
        <div className="form-section-title">
          <span>2</span> Your photo
        </div>
        <LocalPhotoField
          label="Your photograph"
          required
          hint="JPEG or PNG, up to 5 MB. Your actual photograph will appear on your pass."
          onChange={setPhoto}
        />
      </div>
      {ticket.displayPrice > 0 && (
        <div className="form-section">
          <div className="form-section-title">
            <span>3</span> Payment · PKR {ticket.displayPrice.toLocaleString()}
          </div>
          {config.payment ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{config.payment}</p>
          ) : (
            <p className="error">
              Payment details are not available yet. Please contact PAICONS.
            </p>
          )}
          <Choice
            label="Payment method"
            value={form.method}
            onChange={set("method")}
            options={["Easypaisa", "JazzCash", "Bank Transfer"]}
          />
          <Field
            label="Transaction / reference number"
            value={form.reference}
            onChange={set("reference")}
            required
          />
          <LocalPhotoField
            label="Payment receipt"
            required
            onChange={setReceipt}
          />
          <p>
            Your pass is issued after PAICONS manually verifies the payment.
          </p>
        </div>
      )}
      <label className="row">
        <Checkbox
          checked={agree}
          onCheckedChange={(v) => setAgree(v === true)}
        />
        <span>
          I agree to the{" "}
          <a href="/privacy" target="_blank">
            privacy policy
          </a>{" "}
          and{" "}
          <a href="/terms" target="_blank">
            terms
          </a>
          .
        </span>
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button"
        disabled={busy || (ticket.displayPrice > 0 && !config.payment)}
      >
        {busy
          ? "Submitting…"
          : ticket.displayPrice
            ? "Submit for approval"
            : "Register & Get Pass"}
      </button>
    </form>
  );
}
function Info({ section, data }: any) {
  const c = data.config;
  if (["contact", "partners", "membership"].includes(section))
    return (
      <>
        <div className="eyebrow">PAICONS COMMUNITY</div>
        <h1>
          {section === "partners"
            ? "Build Pakistan's AI future with us."
            : section === "membership"
              ? "Stay connected."
              : "Let’s talk."}
        </h1>
        <p>
          {section === "partners"
            ? "Partner with PAICONS through sponsorship, education, technology, venues, media or community."
            : section === "membership"
              ? "Join the updates list for events, courses and community opportunities."
              : "Questions about events, speaking, courses or partnerships? Send us a message."}
        </p>
        {section === "contact" && (
          <div className="contact-links">
            <a
              href="mailto:info@paicons.com"
              className="contact-link"
              rel="noopener noreferrer"
            >
              <span className="contact-link-icon">
                <Mail size={22} />
              </span>
              info@paicons.com
            </a>
            <a
              href={PAICONS_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <span className="contact-link-icon">
                <InstagramIcon size={22} />
              </span>
              @paicons_ on Instagram
            </a>
          </div>
        )}
        {section === "membership" && (
          <div className="community-cards">
            <a
              href={PAICONS_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="community-card community-card-whatsapp"
            >
              <span className="community-card-icon">
                <WhatsappIcon size={26} />
              </span>
              <span className="community-card-badge">
                300+ MEMBERS · ACTIVE DAILY
              </span>
              <h3>PAICONS WhatsApp Community</h3>
              <p>
                Join 300+ students, developers, founders and AI
                professionals across Pakistan already learning,
                collaborating and building together — real opportunities,
                honest feedback and daily conversation, not just another
                group chat.
              </p>
              <span className="community-card-cta">
                Join the Community <ArrowUpRight size={18} />
              </span>
            </a>
            <a
              href={PAICONS_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="community-card"
            >
              <span className="community-card-icon">
                <InstagramIcon size={26} />
              </span>
              <span className="community-card-badge">OFFICIAL PAGE</span>
              <h3>Follow PAICONS on Instagram</h3>
              <p>
                Event recaps, founder stories and real moments from
                Pakistan's AI community — see exactly what you're joining
                before you show up to your first event.
              </p>
              <span className="community-card-cta">
                Follow @paicons_ <ArrowUpRight size={18} />
              </span>
            </a>
          </div>
        )}
        <MessageForm
          kind={
            section === "partners"
              ? "partner"
              : section === "membership"
                ? "community"
                : "contact"
          }
          events={data.events}
        />
      </>
    );
  if (section === "about")
    return (
      <>
        <section className="founder-hero">
          <div className="eyebrow">A NOTE FROM SALIK AHMED</div>
          <h1>
            Pakistan grows faster
            <br />
            when good people find each other.
          </h1>
          <p>
            PAICONS began with a simple belief: access to the right room can
            change a person’s direction.
          </p>
          <div className="founder-signature">
            SALIK AHMED · FOUNDER, PAICONS
          </div>
        </section>

        <section
          className="founder-letter"
          aria-label="The PAICONS founding story"
        >
          <div className="founder-intro">
            <span>WHY THIS EXISTS</span>
            <p>
              {c.founderStory ||
                c.about ||
                "PAICONS brings students, developers, founders, researchers and professionals together around artificial intelligence. Starting in Karachi, we create space for practical education, meaningful collaboration and new opportunities across Pakistan."}
            </p>
          </div>

          {defaultFounderStory.map((chapter, index) => (
            <Fragment key={chapter.label}>
              <article className="story-chapter">
                <div className="story-marker">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i />
                </div>
                <div>
                  <div className="eyebrow">{chapter.label}</div>
                  <h2>{chapter.title}</h2>
                  <p>{chapter.body}</p>
                </div>
              </article>
              {index === 0 && (
                <figure className="founder-reveal">
                  <div className="founder-reveal-frame">
                    <img
                      src="/media/salik-ahmed.jpg"
                      alt="Salik Ahmed, Founder of PAICONS"
                      className="founder-reveal-photo"
                      loading="lazy"
                    />
                    <div className="founder-reveal-tag">
                      <span className="founder-reveal-tag-name">
                        SALIK AHMED
                      </span>
                      <span className="founder-reveal-tag-role">
                        Founder, PAICONS
                      </span>
                    </div>
                  </div>
                  <figcaption className="founder-reveal-caption">
                    Founder of PAICONS
                    <span>
                      (Pakistan AI Collaboration &amp; Opportunities Network)
                    </span>
                  </figcaption>
                  <div className="founder-social-box">
                    <a
                      href={SALIK_INSTAGRAM}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="founder-social-link"
                    >
                      <InstagramIcon size={18} /> @salikbuilds
                    </a>
                    <a
                      href={SALIK_LINKEDIN}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="founder-social-link"
                    >
                      <LinkedinIcon size={18} /> Salik Ahmed
                    </a>
                  </div>
                </figure>
              )}
            </Fragment>
          ))}

          <blockquote className="founder-quote">
            “You do not need to have everything figured out before you start.
            You need enough courage to take the next step.”
          </blockquote>

          <article className="story-chapter story-final">
            <div className="story-marker">
              <span>07</span>
              <i />
            </div>
            <div>
              <div className="eyebrow">AN OPEN INVITATION</div>
              <h2>You do not need to be an expert to sit with us.</h2>
              <p>
                You do not need an impressive LinkedIn profile, a startup, or
                every answer. Come with curiosity. Come with questions. Come
                with an idea you want to explore. The room is stronger when
                every person brings what they know and leaves with someone new
                to learn from.
              </p>
              <p>
                This is still the beginning. If you believe Pakistan grows
                faster when good people find each other, welcome to PAICONS.
              </p>
              <a className="button" href="/events">
                Find your next room <ArrowUpRight size={18} />
              </a>
            </div>
          </article>

          <div className="story-signature">
            <img
              src="/media/salik-ahmed.jpg"
              alt="Salik Ahmed, Founder of PAICONS"
              className="founder-photo"
              loading="lazy"
            />
            <div className="story-signature-info">
              <span className="story-signature-name">
                SALIK AHMED · FOUNDER, PAICONS
              </span>
              <div className="founder-social-box founder-social-box-compact">
                <a
                  href={SALIK_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-social-link"
                >
                  <InstagramIcon size={16} /> @salikbuilds
                </a>
                <a
                  href={SALIK_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-social-link"
                >
                  <LinkedinIcon size={16} /> Salik Ahmed
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  if (["privacy", "terms", "refund-policy"].includes(section)) {
    const text = c[section === "refund-policy" ? "refund" : section];
    const doc: LegalDoc | null =
      section === "privacy" || section === "terms"
        ? legalDocs[section as "privacy" | "terms"]
        : null;
    if (!text && doc)
      return (
        <div className="legal-content">
          <h1>{doc.title}</h1>
          <p className="legal-meta">
            Effective Date: {doc.effective} · Last Updated: {doc.updated}
          </p>
          <p>{doc.intro}</p>
          {doc.sections.map((s: LegalSection) => (
            <section className="legal-section" key={s.heading}>
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
              {s.list && (
                <ul>
                  {s.list.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <p className="legal-footer">
            PAICONS – Pakistan AI Collaboration &amp; Opportunities Network
            <br />
            Karachi, Pakistan
          </p>
          <p className="legal-disclaimer">
            <em>{doc.disclaimer}</em>
          </p>
          <a href="/contact" className="button">
            Contact PAICONS
          </a>
        </div>
      );
    return (
      <>
        <h1>
          {section === "privacy"
            ? "Privacy Policy"
            : section === "terms"
              ? "Terms"
              : "Refund Policy"}
        </h1>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {text ||
            "PAICONS has not published this policy yet. Please contact the organizer before registering."}
        </p>
        <a href="/contact" className="button">
          Contact PAICONS
        </a>
      </>
    );
  }
  return (
    <>
      <h1>Page not found</h1>
      <a href="/">Return home</a>
    </>
  );
}
export function MessageForm({ kind, events = [] }: any) {
  const [form, setForm] = useState<any>({
      name: "",
      email: "",
      message: "",
      type: kind === "partner" ? "Sponsorship" : "General",
    }),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (k: string) => (v: string) =>
    setForm((p: any) => ({ ...p, [k]: v }));
  return (
    <form
      className="panel"
      style={{ maxWidth: 720 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("message", { ...form, kind });
          setStatus(
            kind === "community"
              ? "You're in! Welcome to the PAICONS community. Watch your inbox for upcoming events and opportunities."
              : "Thank you. Your message has been received.",
          );
          setForm({ name: "", email: "", message: "", type: form.type });
        } catch (err: any) {
          setStatus(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid">
        <Field
          label="Full name"
          value={form.name}
          onChange={set("name")}
          required
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          required
        />
      </div>
      {kind !== "community" && (
        <>
          <Field
            label="WhatsApp / phone"
            value={form.phone}
            onChange={set("phone")}
          />
          <Choice
            label={kind === "partner" ? "Partnership type" : "Inquiry type"}
            value={form.type}
            onChange={set("type")}
            options={
              kind === "partner"
                ? [
                    "Sponsorship",
                    "Corporate Partnership",
                    "University Partnership",
                    "Venue Partnership",
                    "Media Partnership",
                    "Community Partnership",
                    "Technology Partnership",
                    "Education Partnership",
                    "Other",
                  ]
                : [
                    "General",
                    "Events",
                    "Courses",
                    "Partnerships",
                    "Speaking",
                    "Media",
                    "Support",
                  ]
            }
          />
        </>
      )}
      {kind === "partner" && (
        <>
          {[
            ["organization", "Organization"],
            ["website", "Website"],
            ["budget", "Budget range (optional)"],
            ["objective", "Partnership objective"],
          ].map(([k, l]) => (
            <Field
              key={k}
              label={l}
              value={form[k]}
              onChange={set(k)}
              required={k === "organization"}
            />
          ))}
          <Choice
            label="Event"
            value={form.event || "general"}
            onChange={set("event")}
            options={[
              { value: "general", label: "General partnership" },
              ...events.map((e: any) => ({ value: e.id, label: e.title })),
            ]}
          />
        </>
      )}
      {kind !== "community" && (
        <Area
          label="Message"
          value={form.message}
          onChange={set("message")}
          required
        />
      )}
      <p role="status">{status}</p>
      <button className="button" disabled={busy}>
        {busy
          ? "Sending…"
          : kind === "community"
            ? "Join Updates"
            : "Send Message"}
      </button>
    </form>
  );
}
function Verify({ qr }: any) {
  const [result, setResult] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("verify/" + qr)
      .then(setResult)
      .catch((e) => setError(e.message));
  }, [qr]);
  return (
    <>
      <div className="eyebrow">PAICONS TICKET VERIFICATION</div>
      <h1 className={result?.status === "VALID" ? "success" : ""}>
        {result?.status || "Checking ticket…"}
      </h1>
      <p>
        {error ||
          "Ticket verification does not reveal attendee photographs or contact details."}
      </p>
      <div className="panel">
        <h3>Authorized event staff</h3>
        <p>Check in this ticket once at the entrance.</p>
        <button
          className="button"
          onClick={async () => {
            try {
              setResult(await api("checkin", { qr }));
              setError("");
            } catch (e: any) {
              setError(e.message);
            }
          }}
        >
          Check In Attendee
        </button>
        {result?.checked_at && (
          <p>
            Checked in {new Date(result.checked_at).toLocaleString()} by{" "}
            {result.checked_by}
          </p>
        )}
        <p className="error">{error}</p>
        <form action={googleSignIn.bind(null, "/verify/" + qr)}>
          <button className="text-button" type="submit">
            Staff sign in
          </button>
        </form>
      </div>
    </>
  );
}
