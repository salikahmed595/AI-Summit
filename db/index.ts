import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is unavailable. Connect a Postgres database (e.g. Neon) to this project in Vercel, or set DATABASE_URL locally.",
    );
  }

  return drizzle(neon(url), { schema });
}
