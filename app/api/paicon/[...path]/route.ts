import { z } from "zod";
import {
  db,
  runtime,
  now,
  token,
  hash,
  identity,
  log,
  rate,
  origin,
  clean,
  content,
  settings,
  eventById,
  passes,
} from "@/lib/server";
const txt = z.string().trim().max(10000);
const short = z.string().trim().max(300);
const id = z.string().uuid();
const optionalFields = [
  "organization",
  "role",
  "city",
  "linkedin",
  "instagram",
  "source",
];
const detail = z.object({
  description: txt.default(""),
  date: short.default(""),
  time: short.default(""),
  end: short.default(""),
  venue: short.default(""),
  address: short.default(""),
  mapUrl: short.default(""),
  city: short.default("Karachi"),
  organizer: short.default("PAICONS"),
  category: short.default("AI Summit"),
  banner: short.default(""),
  video: short.default(""),
  capacity: z.coerce.number().int().min(0).max(100000).default(100),
  agenda: txt.default(""),
  outcomes: txt.default(""),
  faqs: txt.default(""),
  speakers: txt.default(""),
  partners: txt.default(""),
  gallery: txt.default(""),
  fields: z
    .array(
      z.enum([
        "organization",
        "role",
        "city",
        "linkedin",
        "instagram",
        "source",
      ]),
    )
    .default([]),
  registrationStart: short.default(""),
  registrationEnd: short.default(""),
  featuredEvent: z.boolean().default(false),
  showSocialProof: z.boolean().default(true),
  instructor: short.default(""),
  duration: short.default(""),
  level: short.default("All levels"),
  format: short.default("Physical"),
  courseLocation: short.default(""),
  courseLink: short.default(""),
  discountPrice: z.coerce.number().int().min(0).default(0),
  curriculum: txt.default(""),
  requirements: txt.default(""),
  certificate: txt.default(""),
  benefits: txt.default(""),
  cta: short.default("Get Your Pass"),
  testimonials: txt.default(""),
  cancellation: txt.default(""),
  price: z.coerce.number().int().min(0).default(0),
  caption: txt.default(""),
  template: short.default(""),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#b9f464"),
  photoX: z.coerce.number().min(0).max(800).default(80),
  photoY: z.coerce.number().min(0).max(1000).default(330),
  photoSize: z.coerce.number().min(100).max(600).default(300),
  nameY: z.coerce.number().min(0).max(1200).default(710),
  hero: short.default("Where Pakistan connects with AI."),
  about: txt.default(""),
  featured: short.default(""),
  stats: txt.default(""),
  community: short.default(""),
  socials: txt.default(""),
  contact: short.default(""),
  announcement: short.default(""),
  payment: txt.default(""),
  privacy: txt.default(""),
  terms: txt.default(""),
  refund: txt.default(""),
  organization: short.default(""),
  role: short.default(""),
  linkedin: short.default(""),
  bio: txt.default(""),
  event: short.default(""),
  website: short.default(""),
  seoTitle: short.default(""),
  seoDescription: short.default(""),
});
function response(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
async function route(req: Request, parts: string[]) {
  const action = parts[0];
  if (req.method === "GET") {
    if (action === "public") {
      const [events, courses, speakers, partners, galleries, config] =
        await Promise.all([
          content("events"),
          content("courses"),
          content("speakers"),
          content("partners"),
          content("galleries"),
          settings(),
        ]);
      return response({
        events,
        courses,
        speakers,
        partners,
        galleries,
        config,
      });
    }
    if (action === "event") {
      const e = await eventById(parts[1]);
      if (!e || e.status !== "published")
        return response({ error: "Event not found" }, 404);
      return response({
        event: e,
        tickets: await passes(e.id),
        config: await settings(),
      });
    }
    if (action === "download") {
      const r = await db()
        .prepare("SELECT * FROM registrations WHERE access_hash=?")
        .bind(await hash(req.headers.get("x-pass-key") || ""))
        .first<any>();
      if (!r) return response({ error: "Registration not found" }, 404);
      const e = await eventById(r.event_id);
      const t = clean(
        await db()
          .prepare("SELECT * FROM tickets WHERE id=?")
          .bind(r.ticket_id)
          .first(),
      );
      const data = clean(r);
      delete data.access_hash;
      if (r.status !== "active") delete data.qr;
      return response({
        registration: data,
        event: e,
        ticket: t,
        config: await settings(),
        origin: runtime().SITE_URL || new URL(req.url).origin,
      });
    }
    if (action === "verify") {
      const r = await db()
        .prepare("SELECT id,status,checked_at FROM registrations WHERE qr=?")
        .bind(parts[1])
        .first<any>();
      return response({
        status: !r
          ? "INVALID"
          : r.status === "cancelled"
            ? "CANCELLED"
            : r.status !== "active"
              ? "INVALID"
              : r.checked_at
                ? "ALREADY CHECKED IN"
                : "VALID",
      });
    }
    if (action === "file") {
      const f = await db()
        .prepare("SELECT * FROM files WHERE id=?")
        .bind(parts[1])
        .first<any>();
      if (!f) return response({ error: "Not found" }, 404);
      if (f.kind !== "public") {
        let allowed = false;
        try {
          await identity();
          allowed = true;
        } catch {}
        if (!allowed) {
          const r = await db()
            .prepare("SELECT id,data FROM registrations WHERE access_hash=?")
            .bind(await hash(req.headers.get("x-pass-key") || ""))
            .first<any>();
          allowed = !!r && f.owner === r.id && f.kind === "photo";
        }
        if (!allowed) return response({ error: "Access denied" }, 403);
      }
      const obj = await runtime().BUCKET.get(f.id);
      if (!obj) return response({ error: "Not found" }, 404);
      return new Response(obj.body, {
        headers: {
          "Content-Type": f.mime,
          "Cache-Control":
            f.kind === "public" ? "public,max-age=86400" : "private,no-store",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    if (action === "admin") {
      const u = await identity();
      const [records, tickets, registrations, messages, audit] =
        await Promise.all(
          ["records", "tickets", "registrations", "messages", "audit"].map(
            (table) =>
              db()
                .prepare(
                  "SELECT * FROM " +
                    table +
                    (table === "audit"
                      ? " ORDER BY created DESC LIMIT 200"
                      : ""),
                )
                .all(),
          ),
        );
      return response({
        user: u.email,
        records: records.results.map(clean),
        tickets: tickets.results.map(clean),
        registrations: registrations.results.map((r) => {
          const c = clean(r);
          delete c.access_hash;
          delete c.qr;
          return c;
        }),
        messages: messages.results.map(clean),
        audit: audit.results,
      });
    }
  }
  if (req.method !== "POST") return response({ error: "Not found" }, 404);
  origin(req);
  if (action === "upload") {
    await identity();
    if (Number(req.headers.get("content-length") || 0) > 26 * 1024 * 1024)
      throw new Error("File too large");
    const form = await req.formData();
    const f = form.get("file");
    if (!(f instanceof File)) throw new Error("Choose a photograph");
    const fileId = await upload(f, "public", "admin");
    return response({ id: fileId, url: "/api/paicon/file/" + fileId });
  }
  if (action === "register") {
    await rate(req, "register", 10);
    if (Number(req.headers.get("content-length") || 0) > 11000000)
      throw new Error("Upload too large");
    const form = await req.formData();
    const data = z
      .object({
        name: short.min(2),
        email: z
          .string()
          .email()
          .max(254)
          .transform((x) => x.toLowerCase()),
        whatsapp: z.string().regex(/^[+\d\s()-]{7,25}$/),
        eventId: id,
        ticketId: id,
        organization: short.optional(),
        role: short.optional(),
        city: short.optional(),
        linkedin: short.optional(),
        instagram: short.optional(),
        source: short.optional(),
        method: z.enum(["Easypaisa", "JazzCash", "Bank Transfer", "Free"]),
        reference: short.optional(),
      })
      .parse(JSON.parse(String(form.get("data"))));
    const e = await eventById(data.eventId);
    const t = clean(
      await db()
        .prepare("SELECT * FROM tickets WHERE id=? AND event_id=?")
        .bind(data.ticketId, data.eventId)
        .first<any>(),
    );
    if (!e || e.status !== "published" || !t || t.status !== "active")
      throw new Error("Registration is unavailable");
    const n = now();
    if (e.date && new Date(e.date + "T23:59:59+05:00").getTime() < Date.now())
      throw new Error("This event has ended");
    for (const [a, b] of [
      [e.registrationStart, e.registrationEnd],
      [t.saleStart, t.saleEnd],
    ]) {
      if (
        (a && Date.now() < new Date(a).getTime()) ||
        (b && Date.now() > new Date(b).getTime())
      )
        throw new Error("Ticket sales are closed");
    }
    const config = await settings();
    if (t.soldOut) throw new Error("This ticket is sold out");
    const earlyBirdActive =
      t.earlyBirdPrice > 0 &&
      t.earlyBirdDeadline &&
      Date.now() <= new Date(t.earlyBirdDeadline).getTime();
    const chargedPrice = earlyBirdActive ? t.earlyBirdPrice : t.price;
    if (
      chargedPrice > 0 &&
      (!config.payment || !data.reference || data.method === "Free")
    )
      throw new Error(
        "Payment instructions and a transaction reference are required",
      );
    const regId = crypto.randomUUID(),
      key = token(),
      qr = chargedPrice === 0 ? token() : null;
    const photo = form.get("photo");
    if (!(photo instanceof File)) throw new Error("Upload your photograph");
    let photoId = "",
      receiptId = "";
    try {
      photoId = await upload(photo, "photo", regId);
      if (chargedPrice > 0) {
        const receipt = form.get("receipt");
        if (!(receipt instanceof File))
          throw new Error("Upload the payment receipt");
        receiptId = await upload(receipt, "receipt", regId);
      }
      const extra: any = {
        whatsapp: data.whatsapp,
        photo: photoId,
        receipt: receiptId,
        method: chargedPrice > 0 ? data.method : "Free",
        reference: data.reference || "",
      };
      for (const k of optionalFields)
        if (e.fields?.includes(k)) extra[k] = (data as any)[k] || "";
      const result = await db()
        .prepare(
          "INSERT INTO registrations(id,event_id,ticket_id,email,name,data,status,amount,access_hash,qr,created) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM registrations WHERE ticket_id=? AND status IN ('active','pending')) < ? AND (SELECT COUNT(*) FROM registrations WHERE event_id=? AND status IN ('active','pending')) < ?",
        )
        .bind(
          regId,
          e.id,
          t.id,
          data.email,
          data.name,
          JSON.stringify(extra),
          chargedPrice > 0 ? "pending" : "active",
          chargedPrice,
          await hash(key),
          qr,
          n,
          t.id,
          t.capacity,
          e.id,
          e.capacity,
        )
        .run();
      if (!result.meta.changes)
        throw new Error("This ticket or event is sold out");
      return response(
        { key, status: chargedPrice > 0 ? "pending" : "active" },
        201,
      );
    } catch (err) {
      for (const fid of [photoId, receiptId].filter(Boolean)) {
        await runtime().BUCKET.delete(fid);
        await db().prepare("DELETE FROM files WHERE id=?").bind(fid).run();
      }
      if (String(err).includes("UNIQUE"))
        throw new Error(
          "This email is already registered for this event. Use your saved registration link.",
        );
      throw err;
    }
  }
  if (action === "message") {
    await rate(req, "message", 10);
    const data = z
      .object({
        kind: z.enum(["contact", "partner", "community"]),
        name: short.min(2),
        email: z.string().email().max(254),
        phone: short.optional(),
        organization: short.optional(),
        website: short.optional(),
        type: short.optional(),
        event: short.optional(),
        budget: short.optional(),
        objective: txt.optional(),
        message: txt.max(5000).default(""),
      })
      .parse(await req.json());
    await db()
      .prepare("INSERT INTO messages(id,kind,data,created) VALUES(?,?,?,?)")
      .bind(crypto.randomUUID(), data.kind, JSON.stringify(data), now())
      .run();
    return response({ ok: true });
  }
  if (action === "checkin") {
    const u = await identity(true);
    const { qr } = z
      .object({ qr: z.string().regex(/^[a-f0-9]{64}$/) })
      .parse(await req.json());
    const result = await db()
      .prepare(
        "UPDATE registrations SET checked_at=?,checked_by=? WHERE qr=? AND status='active' AND checked_at IS NULL RETURNING id,name,checked_at,checked_by",
      )
      .bind(now(), u.email, qr)
      .first<any>();
    if (result) {
      await log(u.email, "check-in", result.id);
      return response({ status: "CHECKED IN", ...result });
    }
    const existing = await db()
      .prepare(
        "SELECT status,name,checked_at,checked_by FROM registrations WHERE qr=?",
      )
      .bind(qr)
      .first<any>();
    return response({
      ...(existing?.checked_at ? existing : {}),
      status: existing?.checked_at
        ? "ALREADY CHECKED IN"
        : existing?.status === "cancelled"
          ? "CANCELLED"
          : "INVALID",
    });
  }
  const user = await identity();
  const body = await req.json();
  if (action === "record") {
    const parsed = z
      .object({
        id: id.optional(),
        kind: z.enum([
          "events",
          "courses",
          "speakers",
          "partners",
          "galleries",
          "settings",
          "membership",
          "pages",
        ]),
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(120),
        title: short.min(1),
        status: z.enum(["draft", "published"]),
        details: detail,
      })
      .parse(body);
    const rid = parsed.id || crypto.randomUUID();
    if (
      ["events", "courses"].includes(parsed.kind) &&
      parsed.status === "published" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.details.date) ||
        !parsed.details.time ||
        !parsed.details.venue ||
        parsed.details.capacity < 1)
    )
      throw new Error(
        "A published event needs a date, time, venue and capacity",
      );
    await db()
      .prepare(
        "INSERT INTO records(id,kind,slug,title,status,data,updated) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,status=excluded.status,data=excluded.data,updated=excluded.updated",
      )
      .bind(
        rid,
        parsed.kind,
        parsed.slug,
        parsed.title,
        parsed.status,
        JSON.stringify(parsed.details),
        now(),
      )
      .run();
    await log(user.email, "save " + parsed.kind, rid);
    return response({ id: rid });
  }
  if (action === "ticket") {
    const t = z
      .object({
        id: id.optional(),
        eventId: id,
        name: short.min(1),
        price: z.coerce.number().int().min(0).max(100000000),
        capacity: z.coerce.number().int().min(1).max(100000),
        status: z.enum(["active", "closed"]),
        description: txt.default(""),
        benefits: txt.default(""),
        earlyBirdPrice: z.coerce
          .number()
          .int()
          .min(0)
          .max(100000000)
          .default(0),
        earlyBirdDeadline: short.default(""),
        soldOut: z.boolean().default(false),
        premium: z.boolean().default(false),
        saleStart: short.default(""),
        saleEnd: short.default(""),
      })
      .parse(body);
    if (!(await eventById(t.eventId))) throw new Error("Event not found");
    const tid = t.id || crypto.randomUUID();
    await db()
      .prepare(
        "INSERT INTO tickets(id,event_id,name,price,capacity,status,data) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,price=excluded.price,capacity=excluded.capacity,status=excluded.status,data=excluded.data",
      )
      .bind(
        tid,
        t.eventId,
        t.name,
        t.price,
        t.capacity,
        t.status,
        JSON.stringify({
          description: t.description,
          benefits: t.benefits,
          earlyBirdPrice: t.earlyBirdPrice,
          earlyBirdDeadline: t.earlyBirdDeadline,
          soldOut: t.soldOut,
          premium: t.premium,
          saleStart: t.saleStart,
          saleEnd: t.saleEnd,
        }),
      )
      .run();
    await log(user.email, "save ticket", tid);
    return response({ id: tid });
  }
  if (action === "record-action") {
    const command = z
      .object({
        id,
        operation: z.enum(["delete", "duplicate", "publish", "unpublish"]),
      })
      .parse(body);
    const record = await db()
      .prepare("SELECT * FROM records WHERE id=?")
      .bind(command.id)
      .first<any>();
    if (!record) throw new Error("Record not found");
    if (command.operation === "delete") {
      const registrations = await db()
        .prepare("SELECT COUNT(*) AS count FROM registrations WHERE event_id=?")
        .bind(command.id)
        .first<{ count: number }>();
      if (registrations?.count)
        throw new Error(
          "This item has registrations. Unpublish it to preserve attendee records.",
        );
      const ticketFiles = await db()
        .prepare("SELECT id FROM tickets WHERE event_id=?")
        .bind(command.id)
        .all();
      await db().batch([
        ...ticketFiles.results.map((ticket: any) =>
          db().prepare("DELETE FROM tickets WHERE id=?").bind(ticket.id),
        ),
        db().prepare("DELETE FROM records WHERE id=?").bind(command.id),
      ]);
      await log(user.email, "delete " + record.kind, command.id);
      return response({ ok: true });
    }
    if (command.operation === "duplicate") {
      const duplicateId = crypto.randomUUID();
      const duplicateSlug = `${record.slug}-copy-${Date.now().toString(36)}`;
      await db()
        .prepare(
          "INSERT INTO records(id,kind,slug,title,status,data,updated) VALUES(?,?,?,?,?,?,?)",
        )
        .bind(
          duplicateId,
          record.kind,
          duplicateSlug,
          record.title + " (Copy)",
          "draft",
          record.data,
          now(),
        )
        .run();
      const sourceTickets = await db()
        .prepare("SELECT * FROM tickets WHERE event_id=?")
        .bind(command.id)
        .all();
      for (const ticket of sourceTickets.results as any[]) {
        await db()
          .prepare(
            "INSERT INTO tickets(id,event_id,name,price,capacity,status,data) VALUES(?,?,?,?,?,?,?)",
          )
          .bind(
            crypto.randomUUID(),
            duplicateId,
            ticket.name,
            ticket.price,
            ticket.capacity,
            "closed",
            ticket.data,
          )
          .run();
      }
      await log(user.email, "duplicate " + record.kind, duplicateId);
      return response({ id: duplicateId });
    }
    const nextStatus = command.operation === "publish" ? "published" : "draft";
    if (command.operation === "publish") {
      const recordData = JSON.parse(record.data || "{}");
      if (
        ["events", "courses"].includes(record.kind) &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(recordData.date || "") ||
          !recordData.time ||
          !recordData.venue ||
          Number(recordData.capacity) < 1)
      )
        throw new Error(
          "A published event needs a date, time, venue and capacity",
        );
    }
    await db()
      .prepare("UPDATE records SET status=?,updated=? WHERE id=?")
      .bind(nextStatus, now(), command.id)
      .run();
    await log(user.email, command.operation + " " + record.kind, command.id);
    return response({ ok: true });
  }
  if (action === "payment") {
    const p = z
      .object({ id, decision: z.enum(["approve", "reject", "cancel"]) })
      .parse(body);
    const r = await db()
      .prepare("SELECT * FROM registrations WHERE id=?")
      .bind(p.id)
      .first<any>();
    if (!r) throw new Error("Registration not found");
    const status =
      p.decision === "approve"
        ? "active"
        : p.decision === "reject"
          ? "rejected"
          : "cancelled";
    const result = await db()
      .prepare("UPDATE registrations SET status=?,qr=? WHERE id=? AND status=?")
      .bind(
        status,
        status === "active" ? token() : r.qr,
        p.id,
        p.decision === "cancel" ? "active" : "pending",
      )
      .run();
    if (!result.meta.changes)
      throw new Error("This registration has already been reviewed");
    await log(user.email, "payment " + p.decision, p.id);
    return response({ ok: true });
  }
  return response({ error: "Not found" }, 404);
}
async function upload(file: File, kind: string, owner: string) {
  if (file.size < 10 || file.size > 25 * 1024 * 1024)
    throw new Error("Images must be under 5 MB and MP4 videos under 25 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const mp4 =
    bytes[4] === 102 &&
    bytes[5] === 116 &&
    bytes[6] === 121 &&
    bytes[7] === 112;
  const mime = jpeg ? "image/jpeg" : png ? "image/png" : mp4 ? "video/mp4" : "";
  if ((jpeg || png) && file.size > 5 * 1024 * 1024)
    throw new Error("Images must be smaller than 5 MB");
  if (!mime || file.type !== mime)
    throw new Error("Use a valid JPEG, PNG, or MP4 file");
  const fid = crypto.randomUUID();
  await runtime().BUCKET.put(fid, bytes, {
    httpMetadata: { contentType: mime },
  });
  await db()
    .prepare("INSERT INTO files(id,kind,owner,mime,created) VALUES(?,?,?,?,?)")
    .bind(fid, kind, owner, mime, now())
    .run();
  return fid;
}
async function handle(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  try {
    return await route(req, (await ctx.params).path);
  } catch (error) {
    const msg =
      error instanceof z.ZodError
        ? "Please check the form fields."
        : error instanceof Error
          ? error.message
          : "Request failed";
    console.error("PAICONS request failed", msg);
    return response(
      {
        error: msg.includes("D1_")
          ? "The service is temporarily unavailable. Please try again."
          : msg,
      },
      msg === "Access denied" ? 403 : 400,
    );
  }
}
export const GET = handle;
export const POST = handle;
