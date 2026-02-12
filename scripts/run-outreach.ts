#!/usr/bin/env npx tsx
/**
 * Polarity Lab — Outreach Runner
 *
 * Standalone script for running VC email campaigns and Reddit posts.
 * Can run locally or on AWS EC2/ECS.
 *
 * Usage:
 *   npx tsx scripts/run-outreach.ts --email              # Send VC emails
 *   npx tsx scripts/run-outreach.ts --reddit             # Post to Reddit
 *   npx tsx scripts/run-outreach.ts --email --reddit     # Both
 *   npx tsx scripts/run-outreach.ts --email --dry-run    # Preview without sending
 *   npx tsx scripts/run-outreach.ts --email --rate 50    # 50 emails/hour
 *
 * Environment Variables:
 *   RESEND_API_KEY          — Resend API key for email sending
 *   DATABASE_URL            — Neon PostgreSQL connection string
 *   REDDIT_ACCESS_TOKEN     — Reddit OAuth access token
 *   REDDIT_CLIENT_ID        — Reddit app client ID
 *   REDDIT_CLIENT_SECRET    — Reddit app client secret
 *   REDDIT_USERNAME         — Reddit username
 *   REDDIT_PASSWORD         — Reddit password
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first, then .env
config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { Resend } from "resend";
import { ALL_VCS, getVCStats, VC_CATEGORIES, type VCCategory } from "../src/services/vc-list";
import { generateVCEmail, type VCContact } from "../src/services/email-templates";
import { getAllMergedVCs } from "../src/services/mercury-vc-list";
import { REDDIT_POSTS, type RedditPost } from "../src/services/reddit-content";

// ─── Args ───

const args = process.argv.slice(2);
const sendEmails = args.includes("--email");
const postReddit = args.includes("--reddit");
const dryRun = args.includes("--dry-run");
const ratePerHour = parseInt(args.find((a) => a.startsWith("--rate="))?.split("=")[1] || "80");
const categories = args
  .find((a) => a.startsWith("--categories="))
  ?.split("=")[1]
  ?.split(",") as VCCategory[] | undefined;

if (!sendEmails && !postReddit) {
  console.log(`
╔══════════════════════════════════════════════════╗
║          POLARITY LAB — OUTREACH RUNNER          ║
╚══════════════════════════════════════════════════╝

Usage:
  npx tsx scripts/run-outreach.ts --email              Send VC emails
  npx tsx scripts/run-outreach.ts --reddit             Post to Reddit
  npx tsx scripts/run-outreach.ts --email --reddit     Both
  npx tsx scripts/run-outreach.ts --email --dry-run    Preview mode

Options:
  --rate=N                    Emails per hour (default: 80)
  --categories=ai-ml,fintech  Filter VC categories
  --dry-run                   Preview without sending

Categories: ${Object.keys(VC_CATEGORIES).join(", ")}

VC Stats:
${JSON.stringify(getVCStats(), null, 2)}
  `);
  process.exit(0);
}

// ─── Email Campaign ───

async function runEmailCampaign() {
  if (!process.env.RESEND_API_KEY) {
    console.error("ERROR: RESEND_API_KEY not set. Get one at https://resend.com");
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Filter contacts — use merged list (existing + Mercury) unless filtering by category
  let contacts: VCContact[];
  if (categories) {
    contacts = categories.flatMap((cat) => VC_CATEGORIES[cat] || []);
  } else {
    contacts = getAllMergedVCs(ALL_VCS);
  }

  // Deduplicate
  const seen = new Set<string>();
  contacts = contacts.filter((vc) => {
    if (seen.has(vc.email)) return false;
    seen.add(vc.email);
    return true;
  });

  console.log(`
╔══════════════════════════════════════════════════╗
║           VC EMAIL CAMPAIGN                      ║
╠══════════════════════════════════════════════════╣
║  Total contacts: ${String(contacts.length).padEnd(30)}║
║  Rate: ${String(ratePerHour + "/hour").padEnd(41)}║
║  Est. time: ${String(Math.ceil((contacts.length / ratePerHour) * 60) + " minutes").padEnd(36)}║
║  Dry run: ${String(dryRun).padEnd(38)}║
╚══════════════════════════════════════════════════╝
  `);

  if (dryRun) {
    console.log("\n── DRY RUN — Preview of first 5 emails ──\n");
    for (const vc of contacts.slice(0, 5)) {
      const { subject, text } = generateVCEmail(vc);
      console.log(`TO: ${vc.name} <${vc.email}> (${vc.firm})`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`BODY:\n${text.substring(0, 300)}...\n`);
      console.log("─".repeat(50));
    }
    console.log(`\n...and ${contacts.length - 5} more.\n`);
    return;
  }

  const delayMs = Math.ceil((3600 * 1000) / ratePerHour);
  let sent = 0;
  let failed = 0;

  for (const vc of contacts) {
    const { subject, html, text } = generateVCEmail(vc);

    try {
      const result = await resend.emails.send({
        from: "Polarity Lab <team@polarity-lab.com>",
        to: vc.email,
        subject,
        html,
        text,
        tags: [
          { name: "type", value: "vc-outreach" },
          { name: "firm", value: vc.firm.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50) },
        ],
      });

      sent++;
      console.log(
        `[${sent + failed}/${contacts.length}] ✓ ${vc.name} (${vc.firm}) — ${vc.email} — ID: ${result.data?.id}`
      );
    } catch (err) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[${sent + failed}/${contacts.length}] ✗ ${vc.name} (${vc.firm}) — ${vc.email} — ERROR: ${errorMsg}`
      );
    }

    // Rate limit
    if (sent + failed < contacts.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║           CAMPAIGN COMPLETE                      ║
╠══════════════════════════════════════════════════╣
║  Sent: ${String(sent).padEnd(41)}║
║  Failed: ${String(failed).padEnd(39)}║
║  Total: ${String(sent + failed).padEnd(40)}║
╚══════════════════════════════════════════════════╝
  `);
}

// ─── Reddit Campaign ───

async function runRedditCampaign() {
  let accessToken = process.env.REDDIT_ACCESS_TOKEN;

  // If no access token, try to get one via username/password
  if (!accessToken) {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;

    if (!clientId || !clientSecret || !username || !password) {
      console.error(
        "ERROR: Set REDDIT_ACCESS_TOKEN or all of: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD"
      );
      process.exit(1);
    }

    // Get access token via password grant
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "polarity-lab-content-manager/1.0",
      },
      body: new URLSearchParams({
        grant_type: "password",
        username,
        password,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error(`Reddit auth error: ${tokenData.error}`);
      process.exit(1);
    }
    accessToken = tokenData.access_token;
    console.log("Reddit authenticated successfully.\n");
  }

  const posts = REDDIT_POSTS;

  console.log(`
╔══════════════════════════════════════════════════╗
║           REDDIT POSTING CAMPAIGN                ║
╠══════════════════════════════════════════════════╣
║  Total posts: ${String(posts.length).padEnd(33)}║
║  Subreddits: ${String(posts.map((p) => p.subreddit).join(", ").substring(0, 32)).padEnd(35)}║
║  Delay between posts: 10 minutes                ║
║  Dry run: ${String(dryRun).padEnd(38)}║
╚══════════════════════════════════════════════════╝
  `);

  if (dryRun) {
    console.log("\n── DRY RUN — Preview ──\n");
    for (const post of posts) {
      console.log(`r/${post.subreddit}: ${post.title}`);
      console.log(`${post.body.substring(0, 150)}...\n`);
    }
    return;
  }

  let posted = 0;
  let failedCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    try {
      const params = new URLSearchParams({
        sr: post.subreddit,
        kind: "self",
        title: post.title,
        text: post.body,
        api_type: "json",
      });

      const res = await fetch("https://oauth.reddit.com/api/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "polarity-lab-content-manager/1.0",
        },
        body: params,
      });

      const data = await res.json();

      if (data.json?.errors?.length > 0) {
        throw new Error(JSON.stringify(data.json.errors));
      }

      posted++;
      console.log(
        `[${posted + failedCount}/${posts.length}] ✓ r/${post.subreddit} — ${data.json?.data?.url || "posted"}`
      );
    } catch (err) {
      failedCount++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[${posted + failedCount}/${posts.length}] ✗ r/${post.subreddit} — ERROR: ${errorMsg}`
      );
    }

    // 10 minute delay between Reddit posts to avoid rate limits
    if (i < posts.length - 1) {
      console.log("Waiting 10 minutes before next post...");
      await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
    }
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║           REDDIT CAMPAIGN COMPLETE               ║
╠══════════════════════════════════════════════════╣
║  Posted: ${String(posted).padEnd(39)}║
║  Failed: ${String(failedCount).padEnd(39)}║
╚══════════════════════════════════════════════════╝
  `);
}

// ─── Main ───

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║     POLARITY LAB — OUTREACH RUNNER v1.0          ║
║     "The algorithm that teaches AI what matters"  ║
╚══════════════════════════════════════════════════╝
  `);

  if (sendEmails) await runEmailCampaign();
  if (postReddit) await runRedditCampaign();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
