"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
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
import Admin from "./admin-panel";
export async function api(
  path: string,
  data?: unknown,
  headers?: Record<string, string>,
) {
  const r = await fetch("/api/paicon/" + path, {
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
  const d: any = await r.json();
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
    <header className="nav">
      <a className="brand" href="/">
        PAICON<span>®</span>
      </a>
      <nav>
        {[
          "Events",
          "Courses",
          "Membership",
          "About",
          "Partners",
          "Contact",
        ].map((x) => (
          <a href={"/" + x.toLowerCase()} key={x}>
            {x}
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
            <SheetTitle>PAICON</SheetTitle>
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
            <img className="card-img" src={e.banner} alt="" loading="lazy" />
          ) : (
            <div className="mini-art">
              PAICON <ArrowUpRight />
            </div>
          )}
          <div className="eyebrow" style={{ marginTop: 22 }}>
            {e.category || e.format} · {e.city}
          </div>
          <h2 style={{ fontSize: 28 }}>{e.title}</h2>
          <p>
            {e.date} {e.time && " · " + e.time}
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
          : "PAICON will announce upcoming events here. Check back for dates and passes."}
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
        <a href="/">PAICON · Learn. Connect. Build.</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/admin">Admin</a>
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
          description: "Filter the visible published PAICON listing by title.",
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
        <img
          className="card-img"
          style={{ marginTop: 25, maxHeight: 450 }}
          src={e.banner}
          alt={e.title}
        />
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
      <div className="row">
        <span className="pill">
          {e.date} · {e.time}
        </span>
        <span className="pill">{e.venue}</span>
      </div>
      <div className="grid">
        <div>
          <p style={{ whiteSpace: "pre-wrap" }}>{e.description}</p>
          {[
            ["What you’ll take away", e.outcomes],
            ["Agenda", e.agenda],
            ["Curriculum", e.curriculum],
            ["Requirements", e.requirements],
            ["Certificate information", e.certificate],
            ["Frequently asked questions", e.faqs],
          ].map(([title, text]) =>
            text ? (
              <section key={title}>
                <h2 style={{ fontSize: 27 }}>{title}</h2>
                <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
              </section>
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
                  <div
                    className="row"
                    style={{ justifyContent: "space-between" }}
                  >
                    <h3>{t.name}</h3>
                    <strong>
                      {t.displayPrice === 0
                        ? "FREE"
                        : "PKR " + t.displayPrice.toLocaleString()}
                    </strong>
                  </div>
                  <p>{t.description}</p>
                  {premium && (
                    <p className="value-line">
                      Priority Access · Premium Seating · Exclusive Networking ·
                      Speaker/Founder Access
                    </p>
                  )}
                  <p
                    className="ticket-benefits"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {t.benefits}
                  </p>
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
      {info?.tickets.some(
        (t: any) => t.status === "active" && !t.soldOut && t.remaining > 0,
      ) && (
        <a className="mobile-ticket-cta" href="#tickets">
          Get Your Pass —{" "}
          {Math.min(
            ...info.tickets
              .filter(
                (t: any) =>
                  t.status === "active" && !t.soldOut && t.remaining > 0,
              )
              .map((t: any) => t.displayPrice),
          ) === 0
            ? "Free"
            : "From PKR " +
              Math.min(
                ...info.tickets
                  .filter(
                    (t: any) =>
                      t.status === "active" && !t.soldOut && t.remaining > 0,
                  )
                  .map((t: any) => t.displayPrice),
              ).toLocaleString()}
        </a>
      )}
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
      <label>
        Your photograph *
        <input
          type="file"
          accept="image/jpeg,image/png"
          required
          onChange={(e) => setPhoto(e.target.files?.[0])}
        />
        <small>
          JPEG or PNG, up to 5 MB. Your actual photograph will appear on your
          pass.
        </small>
      </label>
      {ticket.displayPrice > 0 && (
        <>
          <h3>Payment · PKR {ticket.displayPrice.toLocaleString()}</h3>
          {config.payment ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{config.payment}</p>
          ) : (
            <p className="error">
              Payment details are not available yet. Please contact PAICON.
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
          <label>
            Payment receipt *
            <input
              type="file"
              accept="image/jpeg,image/png"
              required
              onChange={(e) => setReceipt(e.target.files?.[0])}
            />
          </label>
          <p>Your pass is issued after PAICON manually verifies the payment.</p>
        </>
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
        <div className="eyebrow">PAICON COMMUNITY</div>
        <h1>
          {section === "partners"
            ? "Build Pakistan's AI future with us."
            : section === "membership"
              ? "Stay connected."
              : "Let’s talk."}
        </h1>
        <p>
          {section === "partners"
            ? "Partner with PAICON through sponsorship, education, technology, venues, media or community."
            : section === "membership"
              ? "Join the updates list for events, courses and community opportunities."
              : "Questions about events, speaking, courses or partnerships? Send us a message."}
        </p>
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
        <div className="eyebrow">
          PAKISTAN AI COLLABORATION & OPPORTUNITIES NETWORK
        </div>
        <h1>Learn. Connect. Build.</h1>
        <p style={{ maxWidth: 800, whiteSpace: "pre-wrap" }}>
          {c.about ||
            "PAICON brings students, developers, founders, researchers and professionals together around artificial intelligence. Starting in Karachi, we create space for practical education, meaningful collaboration and new opportunities across Pakistan."}
        </p>
        <div className="grid">
          <div className="panel">
            <h2>Events & community</h2>
            <p>
              Meet the people shaping Pakistan’s AI ecosystem through summits,
              meetups, networking sessions, and university programs.
            </p>
          </div>
          <div className="panel">
            <h2>Education & opportunity</h2>
            <p>
              Build practical skills through courses and workshops, then turn
              what you learn into collaboration, careers, and new ventures.
            </p>
          </div>
        </div>
      </>
    );
  if (["privacy", "terms", "refund-policy"].includes(section)) {
    const text = c[section === "refund-policy" ? "refund" : section];
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
            "PAICON has not published this policy yet. Please contact the organizer before registering."}
        </p>
        <a href="/contact" className="button">
          Contact PAICON
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
      <div className="eyebrow">PAICON TICKET VERIFICATION</div>
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
        <a
          className="text-button"
          href={
            "/signin-with-chatgpt?return_to=" +
            encodeURIComponent("/verify/" + qr)
          }
          target="_top"
        >
          Staff sign in
        </a>
      </div>
    </>
  );
}
