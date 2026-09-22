#!/usr/bin/env node
// One-off seeder for the "Prompt Engineering for Beginners" course.
//
// Run against your REAL production database:
//   1. Put your production DATABASE_URL and BLOB_READ_WRITE_TOKEN into a
//      local .env.local (never commit this file).
//   2. npm run seed:course
//
// It does exactly what the admin panel's "Create Course" form would do —
// uploads the banner, inserts the course record, and creates the single
// auto-managed "Course Access" ticket (free) — so the course is immediately
// live and editable from /admin afterwards like any other course.
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const { DATABASE_URL, BLOB_READ_WRITE_TOKEN } = process.env;
  if (!DATABASE_URL)
    throw new Error(
      "Set DATABASE_URL (your production Postgres connection string) before running this script, e.g. in .env.local.",
    );
  if (!BLOB_READ_WRITE_TOKEN)
    throw new Error(
      "Set BLOB_READ_WRITE_TOKEN (from the Vercel Blob store) before running this script, e.g. in .env.local.",
    );
  const sql = neon(DATABASE_URL);
  const now = new Date().toISOString();

  console.log("Uploading course banner…");
  const bannerBytes = await readFile(
    path.join(__dirname, "assets", "prompt-engineering-banner.png"),
  );
  const fileId = randomUUID();
  await put(fileId, bannerBytes, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: BLOB_READ_WRITE_TOKEN,
  });
  await sql`
    INSERT INTO files (id, kind, owner, mime, created)
    VALUES (${fileId}, 'public', 'admin', 'image/png', ${now})
    ON CONFLICT (id) DO NOTHING
  `;
  const banner = `/api/paicon/file/${fileId}`;

  const courseId = randomUUID();
  const slug = "prompt-engineering-for-beginners";
  const title = "Prompt Engineering for Beginners";
  const details = {
    description:
      "Go from zero to confident with AI. This beginner-level course teaches you how to write clear, structured prompts that actually get the output you want — from ChatGPT, Claude, or any other large language model.\n\nNo coding background needed. Just curiosity and 2–3 hours to work through the material at your own pace.\n\nTaught by Salik Ahmed, Founder of PAICONS, in partnership with Salik Builds.",
    category: "Self-Paced Course",
    paid: false,
    price: 0,
    venue: "",
    video: "",
    courseLink:
      "https://drive.google.com/file/d/1Dc896ksudnd9s_gEsvJe-l2_y6X1C4M8/view",
    outcomes:
      "Prompting fundamentals — how LLMs actually read your instructions\nReal-world examples you can copy and adapt immediately\nHands-on exercises to practice as you go\nPractical techniques for productivity and creative work\nA reusable framework for writing better prompts every time",
    curriculum:
      "1. Why prompts matter — how AI models interpret instructions\n2. The anatomy of a great prompt\n3. Common beginner mistakes (and how to fix them)\n4. Prompting for writing, research and productivity\n5. Prompting for code and technical tasks\n6. Building your own prompt templates\n7. Wrap-up + where to go next",
    requirements:
      "No prior experience with AI or coding required\nA free ChatGPT, Claude, or Gemini account to practice alongside the lessons\nAbout 2–3 hours to complete at your own pace",
    faqs:
      "Is this really free?: Yes — this course is completely free, no hidden costs.\nDo I need to know how to code?: No. This is a beginner-level course built for total beginners.\nWill I get a certificate?: Yes. Once you finish the course, you can claim a personalized, verifiable PAICONS certificate of completion — shareable on LinkedIn.\nHow long do I have access?: Your access link is permanent — learn at your own pace, no deadline.",
    certificate:
      "Every learner who completes this course can claim a free, personalized PAICONS certificate of completion, with a unique verification code and a ready-made LinkedIn caption to share.",
    benefits: "",
    banner,
    // Left at 0 / blank deliberately — see the note in the chat reply about
    // why these aren't pre-filled with invented numbers. Fill them in from
    // the admin panel once real learners have gone through the course.
    enrolledCount: 0,
    rating: "",
    reviewCount: 0,
    seoTitle: "Prompt Engineering for Beginners — Free Course | PAICONS",
    seoDescription:
      "Learn prompt engineering fundamentals for free. A beginner-level, self-paced course by PAICONS and Salik Builds — includes a verified certificate of completion.",
  };

  console.log("Creating course record…");
  await sql`
    INSERT INTO records (id, kind, slug, title, status, data, updated)
    VALUES (${courseId}, 'courses', ${slug}, ${title}, 'published', ${JSON.stringify(details)}, ${now})
    ON CONFLICT (kind, slug) DO UPDATE SET
      title = excluded.title,
      status = excluded.status,
      data = excluded.data,
      updated = excluded.updated
  `;

  console.log("Creating the free Course Access ticket…");
  await sql`
    INSERT INTO tickets (id, event_id, name, price, capacity, status, data)
    VALUES (${courseId}, ${courseId}, 'Course Access', 0, 1000000, 'active', ${JSON.stringify(
      { description: "Full access to this course.", benefits: "" },
    )})
    ON CONFLICT (id) DO UPDATE SET
      price = excluded.price,
      status = excluded.status,
      data = excluded.data
  `;

  console.log(`\nDone. Live at /courses/${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
