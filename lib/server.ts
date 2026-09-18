import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { put as blobPut, get as blobGet, del as blobDel } from "@vercel/blob";
import { getSiteUser } from "@/app/site-auth";

// --- D1-compatible SQL shim over Neon Postgres --------------------------
// The route handlers in app/api/paicon were written against Cloudflare D1's
// `.prepare(sql).bind(...).run()/.first()/.all()` API. Rather than rewrite
// every call site for the Vercel migration, this shim keeps that surface
// and translates `?` placeholders + result shapes to/from Postgres.

let cachedClient: NeonQueryFunction<false, false> | null = null;
function client() {
  if (cachedClient) return cachedClient;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is unavailable. Connect a Postgres database (e.g. Neon) to this project in Vercel, or set DATABASE_URL locally.",
    );
  }
  cachedClient = neon(url);
  return cachedClient;
}

function toPgParams(query: string) {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

function prepare(query: string) {
  const text = toPgParams(query);
  let params: unknown[] = [];
  const exec = async (): Promise<{ rows: any[]; rowCount: number }> =>
    client().query(text, params, { fullResults: true }) as Promise<{
      rows: any[];
      rowCount: number;
    }>;
  const stmt = {
    bind(...args: unknown[]) {
      params = args;
      return stmt;
    },
    async run() {
      const { rowCount } = await exec();
      return { meta: { changes: rowCount ?? 0 } };
    },
    async first<T = any>(): Promise<T | null> {
      const { rows } = await exec();
      return (rows[0] as T) ?? null;
    },
    async all<T = any>(): Promise<{ results: T[] }> {
      const { rows } = await exec();
      return { results: rows as T[] };
    },
    _exec: exec,
  };
  return stmt;
}

export function db() {
  return {
    prepare,
    // The Neon HTTP driver has no cross-request session, so a "batch" runs
    // sequentially instead of in one atomic transaction. Every current call
    // site is a non-financial cascade operation guarded by an earlier check,
    // so this trade-off is acceptable; revisit with a pooled client if that
    // changes.
    async batch(stmts: ReturnType<typeof prepare>[]) {
      const out = [];
      for (const stmt of stmts) out.push(await stmt._exec());
      return out;
    },
  };
}

// --- Blob storage shim (Vercel Blob in place of Cloudflare R2) ----------
// All access control happens in the route handlers before these are called,
// so every object is stored private and always served back through the app.

const BUCKET = {
  async get(key: string) {
    const result = await blobGet(key, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    return { body: result.stream };
  },
  async put(
    key: string,
    bytes: Uint8Array,
    opts: { httpMetadata: { contentType: string } },
  ) {
    await blobPut(key, Buffer.from(bytes), {
      access: "private",
      contentType: opts.httpMetadata.contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  },
  async delete(key: string) {
    await blobDel(key);
  },
};

export function runtime() {
  return {
    BUCKET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    STAFF_EMAILS: process.env.STAFF_EMAILS,
    SITE_URL: process.env.SITE_URL,
  };
}

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
  const user = await getSiteUser();
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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
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
      title: "PAICONS",
      hero: "Where Pakistan connects with AI.",
      about:
        "Pakistan AI Collaboration & Opportunities Network brings curious minds together to learn, connect, and build.",
      caption:
        "Hello, my name is {NAME} and I'm attending {EVENT_NAME} by PAICONS — Pakistan AI Collaboration & Opportunities Network. Join me at {VENUE} on {DATE}. #PAICONS",
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
