import {
  pgTable,
  text,
  integer,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
export const records = pgTable(
  "records",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    status: text("status").notNull(),
    data: text("data").notNull(),
    updated: text("updated").notNull(),
  },
  (t) => [
    uniqueIndex("records_kind_slug").on(t.kind, t.slug),
    index("records_kind_status").on(t.kind, t.status),
  ],
);
export const tickets = pgTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull(),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    capacity: integer("capacity").notNull(),
    status: text("status").notNull(),
    data: text("data").notNull(),
  },
  (t) => [index("tickets_event").on(t.eventId)],
);
export const registrations = pgTable(
  "registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull(),
    ticketId: text("ticket_id").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    data: text("data").notNull(),
    status: text("status").notNull(),
    amount: integer("amount").notNull(),
    accessHash: text("access_hash").notNull(),
    qr: text("qr"),
    checkedAt: text("checked_at"),
    checkedBy: text("checked_by"),
    created: text("created").notNull(),
  },
  (t) => [
    uniqueIndex("registration_event_email").on(t.eventId, t.email),
    uniqueIndex("registration_qr").on(t.qr),
    uniqueIndex("registration_access").on(t.accessHash),
    index("registration_ticket_status").on(t.ticketId, t.status),
  ],
);
export const files = pgTable("files", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  owner: text("owner").notNull(),
  mime: text("mime").notNull(),
  created: text("created").notNull(),
});
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  data: text("data").notNull(),
  created: text("created").notNull(),
});
export const audit = pgTable("audit", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  created: text("created").notNull(),
});
export const limits = pgTable("limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  // Epoch milliseconds — exceeds 32-bit int range, needs bigint.
  expires: bigint("expires", { mode: "number" }).notNull(),
});
