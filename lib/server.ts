import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export const runtime = () =>
  env as unknown as {
    DB: D1Database;
    BUCKET: R2Bucket;
    ADMIN_EMAILS?: string;
    STAFF_EMAILS?: string;
    SITE_URL?: string;
  };
export const db = () => {
  const d = runtime().DB;
  if (!d) throw new Error("Storage is unavailable. Please try again later.");
  return d;
};
export const now = () => new Date().toISOString();
export const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
export async function hash(s: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
}
export async function identity(staff = false) {
  const user = await getChatGPTUser();
  const list = [
    runtime().ADMIN_EMAILS,
    ...(staff ? [runtime().STAFF_EMAILS] : []),
  ]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map((x) => x.trim().toLowerCase());
  if (!user || !list.includes(user.email.toLowerCase()))
    throw new Error("Access denied");
  return user;
}
export async function log(actor: string, action: string, target: string) {
  await db()
    .prepare(
      "INSERT INTO audit(id,actor,action,target,created) VALUES(?,?,?,?,?)",
    )
    .bind(crypto.randomUUID(), actor, action, target, now())
    .run();
}
export async function rate(req: Request, scope: string, max = 20) {
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const key = await hash(ip + scope + Math.floor(Date.now() / 3600000));
  const row = await db()
    .prepare(
      "INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(key, Date.now() + 3600000)
    .first<{ count: number }>();
  if (!row || row.count > max)
    throw new Error("Too many requests. Please try again later.");
}
export function origin(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin)
    throw new Error("Invalid request origin");
}
export function clean(row: any) {
  return row
    ? { ...row, ...JSON.parse(row.data || "{}"), data: undefined }
    : null;
}
export async function content(kind: string, published = true) {
  const r = await db()
    .prepare(
      "SELECT * FROM records WHERE kind=?" +
        (published ? " AND status='published'" : "") +
        " ORDER BY updated DESC",
    )
    .bind(kind)
    .all();
  return r.results.map(clean);
}
export async function settings() {
  return (
    (await content("settings"))[0] || {
      title: "PAICON",
      hero: "Where Pakistan connects with AI.",
      about:
        "Pakistan AI Collaboration & Opportunities Network brings curious minds together to learn, connect, and build.",
      caption:
        "Hello, my name is {NAME} and I'm attending {EVENT_NAME} by PAICON — Pakistan AI Collaboration & Opportunities Network. Join me at {VENUE} on {DATE}. #PAICON",
    }
  );
}
export async function eventById(id: string) {
  return clean(
    await db()
      .prepare("SELECT * FROM records WHERE id=? AND kind IN (?,?)")
      .bind(id, "events", "courses")
      .first(),
  );
}
export async function passes(id: string) {
  return (
    await db()
      .prepare(
        "SELECT t.*, (SELECT COUNT(*) FROM registrations r WHERE r.ticket_id=t.id AND r.status IN ('active','pending')) AS reserved FROM tickets t WHERE event_id=?",
      )
      .bind(id)
      .all()
  ).results.map((row) => {
    const ticket = clean(row);
    const earlyBirdActive =
      ticket.earlyBirdPrice > 0 &&
      ticket.earlyBirdDeadline &&
      Date.now() <= new Date(ticket.earlyBirdDeadline).getTime();
    const remaining = Math.max(0, ticket.capacity - ticket.reserved);
    return {
      ...ticket,
      earlyBirdActive,
      displayPrice: earlyBirdActive ? ticket.earlyBirdPrice : ticket.price,
      remaining,
      claimedPercent: ticket.capacity
        ? Math.round((ticket.reserved / ticket.capacity) * 100)
        : 0,
      soldOut: Boolean(ticket.soldOut) || remaining === 0,
    };
  });
}
