import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../convex/seedBlogPosts.ts", import.meta.url), "utf8");

const startMarker = "const drafts = [";
const endMarker = "    ];\n\n    const results";
const start = src.indexOf(startMarker);
const end = src.indexOf(endMarker);
if (start === -1 || end === -1) throw new Error("Could not locate drafts array markers");

const arrayLiteral = src.slice(start + "const drafts = ".length, end + "    ]".length);
// eslint-disable-next-line no-new-func
const drafts = Function(`"use strict"; return (${arrayLiteral});`)();

const now = Date.now();
const lines = drafts.map((d) => {
  const publishedAt = now - d.publishedAtOffsetDays * 24 * 60 * 60 * 1000;
  return JSON.stringify({
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt,
    content: d.content,
    tags: d.tags,
    published: true,
    publishedAt,
    createdAt: now,
    updatedAt: now,
  });
});

writeFileSync(new URL("../scripts/posts.jsonl", import.meta.url), lines.join("\n") + "\n");
console.log(`Wrote ${lines.length} posts to scripts/posts.jsonl`);
for (const d of drafts) console.log(" -", d.slug);
