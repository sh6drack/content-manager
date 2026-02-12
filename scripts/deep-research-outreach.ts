#!/usr/bin/env npx tsx
/**
 * Polarity Lab — Deep Research Personalized Outreach
 *
 * For each VC investor:
 *   1. Scrapes their firm's website for thesis, portfolio, team
 *   2. Generates a hyper-personalized email referencing specific investments
 *   3. Sends via Resend with proper rate limiting
 *
 * Usage:
 *   npx tsx scripts/deep-research-outreach.ts --dry-run       # Preview
 *   npx tsx scripts/deep-research-outreach.ts --send           # Fire
 *   npx tsx scripts/deep-research-outreach.ts --send --skip-sent  # Skip already-sent
 *   npx tsx scripts/deep-research-outreach.ts --research-only  # Just research, save to file
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";
import * as fs from "fs";

config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { sendEmail } from "../src/services/ses-client";

// ─── Types ───

interface MercuryInvestor {
  name: string;
  firm: string;
  industries: string[];
  stages: string[];
  checkSize: string;
  firmWebsite?: string;
  email?: string;
}

interface ResearchedInvestor extends MercuryInvestor {
  thesis?: string;
  portfolio?: string[];
  recentActivity?: string;
  personalizedOpener?: string;
  personalizedCloser?: string;
  personalizedSubject?: string;
}

// ─── Parse Mercury Data ───

function parseMercuryInvestors(): MercuryInvestor[] {
  const pages = [
    resolve(__dirname, "../.firecrawl/mercury-investor-db.md"),
    resolve(__dirname, "../.firecrawl/mercury-page2.md"),
    resolve(__dirname, "../.firecrawl/mercury-page3.md"),
    resolve(__dirname, "../.firecrawl/mercury-page4.md"),
    resolve(__dirname, "../.firecrawl/mercury-page5.md"),
    resolve(__dirname, "../.firecrawl/mercury-page6.md"),
  ];

  const investors: MercuryInvestor[] = [];
  const seen = new Set<string>();

  for (const pagePath of pages) {
    if (!fs.existsSync(pagePath)) continue;
    const content = fs.readFileSync(pagePath, "utf-8");

    // Parse table rows — format: | ![img](url)<br>NameFirm | Industries | Stages | Check |
    const rows = content.split("\n").filter((line) =>
      line.startsWith("| ![") && line.includes("<br>")
    );

    for (const row of rows) {
      try {
        // Extract name and firm from: ![Name](url)<br>NameFirm |
        const nameMatch = row.match(/<br>([^|]+?)\s*\|/);
        if (!nameMatch) continue;

        const nameAndFirm = nameMatch[1].trim();
        // The pattern is "FirstName LastNameFirmName" — name comes first, firm follows
        // But the img alt text has the name: ![Aaron Holiday]
        const altMatch = row.match(/!\[([^\]]+)\]/);
        const name = altMatch ? altMatch[1].trim() : "";
        if (!name || name.includes("_")) continue; // Skip malformed

        // Firm is what follows the name in the <br> section
        const firm = nameAndFirm.replace(name, "").trim();
        if (!firm) continue;

        // Skip duplicates
        const key = `${name}-${firm}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        // Extract industries
        const parts = row.split("|").filter(Boolean);
        const industriesRaw = parts[1] || "";
        const industries = industriesRaw
          .replace(/<br>/g, ",")
          .replace(/\+\d+ more/g, "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        // Extract stages
        const stagesRaw = parts[2] || "";
        const stages = stagesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        // Extract check size
        const checkSize = (parts[3] || "").trim();

        investors.push({ name, firm, industries, stages, checkSize });
      } catch {
        // Skip malformed rows
      }
    }
  }

  return investors;
}

// ─── Filter for Polarity-Aligned Investors ───

function filterForPolarity(investors: MercuryInvestor[]): MercuryInvestor[] {
  return investors.filter((inv) => {
    const ind = inv.industries.map((i) => i.toLowerCase());
    const stages = inv.stages.map((s) => s.toLowerCase());

    // Must invest in pre-seed or seed
    const rightStage =
      stages.some((s) => s.includes("pre-seed") || s.includes("seed") || s.includes("all"));

    if (!rightStage) return false;

    // Must be relevant to Polarity's domains
    const hasAI = ind.some((i) => i.includes("ai") || i.includes("machine learning"));
    const hasConsumer = ind.some((i) => i.includes("consumer"));
    const hasSocial = ind.some((i) => i.includes("social"));
    const hasDeepTech = ind.some((i) => i.includes("deep tech"));
    const hasHealthcare = ind.some(
      (i) => i.includes("health") || i.includes("medtech") || i.includes("biotech")
    );
    const hasEntertainment = ind.some(
      (i) => i.includes("entertainment") || i.includes("media") || i.includes("music")
    );
    const hasCreator = ind.some((i) => i.includes("creator"));

    // Strong match: AI/ML + at least one domain
    if (hasAI && (hasConsumer || hasSocial || hasDeepTech || hasHealthcare || hasEntertainment || hasCreator)) {
      return true;
    }

    // Domain match: multiple Polarity-relevant areas
    const domainCount = [hasConsumer, hasSocial, hasDeepTech, hasHealthcare, hasEntertainment, hasCreator].filter(Boolean).length;
    if (domainCount >= 2) return true;

    // AI-only with good check size
    if (hasAI && inv.checkSize && !inv.checkSize.includes("$1K")) return true;

    return false;
  });
}

// ─── Deep Research an Investor ───

async function researchInvestor(investor: MercuryInvestor): Promise<ResearchedInvestor> {
  const result: ResearchedInvestor = { ...investor };

  // Try to find firm website and scrape it
  const firmSlug = investor.firm.toLowerCase().replace(/[^a-z0-9]/g, "");
  const searchQuery = `${investor.name} ${investor.firm} venture capital thesis portfolio`;

  try {
    // Use firecrawl search to find info about the investor
    const searchOutput = execSync(
      `firecrawl search "${searchQuery}" --limit 3 --json 2>/dev/null`,
      { timeout: 30000, encoding: "utf-8" }
    );

    const searchData = JSON.parse(searchOutput);
    const webResults = searchData?.data?.web || [];

    if (webResults.length > 0) {
      // Extract thesis and portfolio info from search results
      const descriptions = webResults.map((r: any) => r.description || "").join(" ");
      const urls = webResults.map((r: any) => r.url || "");

      // Find firm website
      const firmUrl = urls.find(
        (u: string) =>
          u.includes(firmSlug) ||
          u.includes(investor.firm.toLowerCase().replace(/\s+/g, ""))
      );
      if (firmUrl) result.firmWebsite = firmUrl;

      // Extract thesis signals from descriptions
      result.thesis = descriptions.substring(0, 500);

      // Try to find their email pattern from firm domain
      if (firmUrl) {
        const domain = new URL(firmUrl).hostname.replace("www.", "");
        const firstName = investor.name.split(" ")[0].toLowerCase();
        result.email = `${firstName}@${domain}`;
      }
    }
  } catch {
    // Search failed — use heuristics
  }

  // Generate personalized email content based on research
  result.personalizedSubject = generatePersonalizedSubject(result);
  result.personalizedOpener = generatePersonalizedOpener(result);
  result.personalizedCloser = generatePersonalizedCloser(result);

  return result;
}

// ─── Personalized Email Generation ───

function generatePersonalizedSubject(inv: ResearchedInvestor): string {
  const ind = inv.industries.map((i) => i.toLowerCase());

  if (ind.some((i) => i.includes("ai") || i.includes("machine learning"))) {
    if (ind.some((i) => i.includes("health") || i.includes("medtech")))
      return "An algorithm that detects cognitive drift — built by an MD from Brown + MIT Boyden Lab";
    if (ind.some((i) => i.includes("entertainment") || i.includes("media") || i.includes("creator")))
      return "We pointed an algorithm at music — 26 archetypes emerged. Same math, zero retraining.";
    if (ind.some((i) => i.includes("deep tech")))
      return "Neuroscience-grounded cognitive measurement — 2 patents, 4 deployments, zero retraining";
    return "The cognitive layer missing from every AI system — deployed 4 times to prove it";
  }

  if (ind.some((i) => i.includes("consumer") || i.includes("social")))
    return "One algorithm, four consumer products, zero retraining — the cognitive layer for AI";
  if (ind.some((i) => i.includes("health")))
    return "An MD from Brown built an algorithm that knows when someone stops following their treatment plan";
  if (ind.some((i) => i.includes("entertainment") || i.includes("media")))
    return "553K albums indexed, 26 listener archetypes emerged — we didn't design them";

  return "We built the algorithm that teaches AI what matters — shipped it 4 times to prove it";
}

function generatePersonalizedOpener(inv: ResearchedInvestor): string {
  const firstName = inv.name.split(" ")[0];
  const ind = inv.industries.map((i) => i.toLowerCase());

  // Reference their firm's focus
  if (inv.thesis && inv.thesis.length > 50) {
    return `${firstName}, I noticed ${inv.firm}'s focus on ${inv.industries.slice(0, 3).join(", ").toLowerCase()} — which is exactly the intersection where we've built something no one else has.`;
  }

  if (ind.some((i) => i.includes("ai") && i.includes("health"))) {
    return `${firstName}, your investment thesis at ${inv.firm} sits at the exact intersection we've spent 11 years building toward — an MD candidate from Brown trained at MIT Boyden Lab built the algorithm that teaches AI what actually matters to someone.`;
  }

  if (ind.some((i) => i.includes("deep tech"))) {
    return `${firstName}, ${inv.firm}'s deep tech focus is exactly why I'm reaching out — we built something that can't be replicated without the neuroscience. Two patents, grounded in MIT Boyden Lab whole-brain imaging research.`;
  }

  if (ind.some((i) => i.includes("creator") || i.includes("entertainment"))) {
    return `${firstName}, ${inv.firm} backs creators and entertainment — we pointed a cognitive measurement algorithm at music and 26 unique listener archetypes emerged from the data. We didn't design them. The math found them.`;
  }

  if (ind.some((i) => i.includes("consumer") || i.includes("social"))) {
    return `${firstName}, ${inv.firm} invests in what people use daily — we built the cognitive layer that makes AI systems actually understand their users. Not what they did, but what they care about.`;
  }

  return `${firstName}, I'm reaching out because ${inv.firm}'s investment focus aligns with what we've built at Polarity Lab — the algorithm that teaches AI what to hold onto.`;
}

function generatePersonalizedCloser(inv: ResearchedInvestor): string {
  const ind = inv.industries.map((i) => i.toLowerCase());

  if (ind.some((i) => i.includes("ai"))) {
    return `The model doesn't need to be smarter — it needs to understand what matters. An MD from Brown with 11 years in neuroscience built that into an algorithm. We're looking for a partner at ${inv.firm} to make this the cognitive infrastructure under every AI system.`;
  }

  if (ind.some((i) => i.includes("health"))) {
    return `Patient portals store data. They don't understand people. This algorithm detects drift — when behavior diverges from baseline. The neuroscience is real: Yeo 7-network, Bayesian memory retrieval, 2 patents. We think ${inv.firm} is the right partner for the healthcare application.`;
  }

  if (ind.some((i) => i.includes("consumer"))) {
    return `Every product we ship generates real conversations. Those conversations make the algorithm smarter. The thing people use and the thing we study are the same thing. That's a data flywheel no one else has. We think ${inv.firm} understands why that matters.`;
  }

  return `Three cofounders, two patents, five live products, one algorithm. Domain-agnostic — the math doesn't change, the vocabulary adapts. We think ${inv.firm}'s thesis aligns with where this is going.`;
}

function generateFullEmail(inv: ResearchedInvestor): { subject: string; html: string; text: string } {
  const subject = inv.personalizedSubject || "The cognitive layer missing from every AI system";
  const opener = inv.personalizedOpener || "";
  const closer = inv.personalizedCloser || "";

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
  <p>${opener}</p>

  <p>We built the first algorithm that measures <em>importance</em> — not what users did, but what they care about. What repeats carries weight. What changes carries weight. Who someone is compounds over time.</p>

  <p><strong>Two products. One algorithm. Zero retraining between them.</strong></p>

  <p><a href="https://polarity-lab.com" style="color: #6366f1;"><strong>Polarity</strong></a> — a cognitive operating system. 205+ API endpoints. Talk to it and it learns what matters to you. Not a chat log — a living profile that knows what was heavy enough to keep. Web search, workspace, live documents — all powered by the same algorithm.</p>

  <p><a href="https://wax-feed.com" style="color: #6366f1;"><strong>WaxFeed</strong></a> — we pointed the same algorithm at music without changing the math. 553k albums indexed. 26 unique listener archetypes emerged from the data — we didn't design them, the algorithm found them. User-to-user matching based on how people actually <em>think</em> about music, not what they recently played.</p>

  <p>We've also extended the algorithm into a <a href="https://fuckonmydj.com" style="color: #6366f1;">DJ marketplace</a> and a <a href="https://painpoints.site" style="color: #6366f1;">problem-funding platform</a> — same math, different vocabulary. Each deployment proves the algorithm is domain-agnostic.</p>

  <p><strong>The team:</strong></p>
  <ul style="padding-left: 20px;">
    <li><strong>Theodore Addo</strong> — Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab (whole brain imaging). 11 years on the core question.</li>
    <li><strong>Shadrack Annor</strong> — Cofounder. Brown CS '27. Built WaxFeed. Creative Director at WBRU. Patent #1.</li>
    <li><strong>Nathan Amankwah</strong> — Cofounder. UOttawa '27. Formalized the CCX algorithm. Patent #2.</li>
  </ul>

  <p>2 patents filed. Grounded in neuroscience (Yeo 7-network model, Bayesian memory retrieval). <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">See the full algorithm pitch →</a></p>

  <p>${closer}</p>

  <p>30 minutes. See if there's alignment.</p>

  <p>—<br/>
  <strong>Polarity Lab</strong><br/>
  Providence, RI · Est. 2025<br/>
  <a href="https://polarity-lab.com" style="color: #6366f1;">polarity-lab.com</a> · <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">the algorithm</a></p>
</div>`.trim();

  const text = `${opener}

We built an algorithm that measures importance — not what users did, but what they care about. What repeats carries weight. What changes carries weight. Who someone is compounds over time.

Two products. One algorithm. Zero retraining between them.

Polarity (https://polarity-lab.com) — a cognitive operating system. 205+ API endpoints. Talk to it and it learns what matters to you. Not a chat log — a living profile that knows what was heavy enough to keep.

WaxFeed (https://wax-feed.com) — same algorithm, pointed at music. 553k albums indexed. 26 listener archetypes emerged from the data. We didn't design them. The algorithm found them.

We've extended it into a DJ marketplace and a problem-funding platform — same math, different vocabulary. Each one proves it's domain-agnostic.

The team:
- Theodore Addo — Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab. 11 years on the core question.
- Shadrack Annor — Cofounder. Brown CS '27. Built WaxFeed. Creative Director at WBRU. Patent #1.
- Nathan Amankwah — Cofounder. UOttawa '27. Formalized the CCX algorithm. Patent #2.

2 patents filed. Neuroscience-grounded. See the algorithm: https://algorithm.polarity-lab.com

${closer}

30 minutes. See if there's alignment.

--
Polarity Lab
Providence, RI | Est. 2025
polarity-lab.com | algorithm.polarity-lab.com`.trim();

  return { subject, html, text };
}

// ─── Already Sent Tracking ───

const SENT_LOG = resolve(__dirname, "../.firecrawl/sent-emails.json");

function loadSentEmails(): Set<string> {
  try {
    const data = JSON.parse(fs.readFileSync(SENT_LOG, "utf-8"));
    return new Set(data);
  } catch {
    return new Set();
  }
}

function saveSentEmail(email: string) {
  const sent = loadSentEmails();
  sent.add(email);
  fs.writeFileSync(SENT_LOG, JSON.stringify([...sent], null, 2));
}

// ─── Main ───

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sendMode = args.includes("--send");
const researchOnly = args.includes("--research-only");
const skipSent = args.includes("--skip-sent");
const ratePerHour = parseInt(args.find((a) => a.startsWith("--rate="))?.split("=")[1] || "60");

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  POLARITY LAB — DEEP RESEARCH PERSONALIZED OUTREACH  ║
║  "The algorithm that teaches AI what matters"         ║
╚══════════════════════════════════════════════════════════╝
  `);

  // Step 1: Parse all Mercury investors
  console.log("Step 1: Parsing Mercury investor database...");
  const allInvestors = parseMercuryInvestors();
  console.log(`  Found ${allInvestors.length} total investors across all pages`);

  // Step 2: Filter for Polarity-aligned
  console.log("Step 2: Filtering for Polarity-aligned investors...");
  const aligned = filterForPolarity(allInvestors);
  console.log(`  ${aligned.length} thesis-aligned investors found`);

  // Step 3: Load already-sent list
  const sentEmails = loadSentEmails();
  // Also add our existing VC list emails to avoid duplicates
  let { ALL_VCS } = await import("../src/services/vc-list");
  for (const vc of ALL_VCS) sentEmails.add(vc.email);

  const toResearch = skipSent
    ? aligned.filter((inv) => !inv.email || !sentEmails.has(inv.email))
    : aligned;

  console.log(`  ${toResearch.length} investors to research (after dedup)\n`);

  // Step 3: Deep research each investor
  console.log("Step 3: Deep researching each investor...\n");
  const researched: ResearchedInvestor[] = [];

  for (let i = 0; i < toResearch.length; i++) {
    const inv = toResearch[i];
    process.stdout.write(`  [${i + 1}/${toResearch.length}] Researching ${inv.name} (${inv.firm})...`);

    try {
      const result = await researchInvestor(inv);
      researched.push(result);
      console.log(` ✓ ${result.email || "no email found"}`);
    } catch (err) {
      console.log(` ✗ research failed`);
      // Still add with basic personalization
      researched.push({
        ...inv,
        personalizedSubject: generatePersonalizedSubject({ ...inv }),
        personalizedOpener: generatePersonalizedOpener({ ...inv }),
        personalizedCloser: generatePersonalizedCloser({ ...inv }),
      });
    }

    // Small delay between research calls to avoid rate limits
    if (i < toResearch.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Save research results
  const researchFile = resolve(__dirname, "../.firecrawl/researched-investors.json");
  fs.writeFileSync(researchFile, JSON.stringify(researched, null, 2));
  console.log(`\n  Research saved to ${researchFile}`);

  if (researchOnly) {
    console.log("\n  Research-only mode. Done.");
    return;
  }

  // Step 4: Filter to investors with emails
  const withEmails = researched.filter((inv) => inv.email && !sentEmails.has(inv.email!));
  console.log(`\n  ${withEmails.length} investors with emails ready to send\n`);

  if (dryRun) {
    console.log("── DRY RUN — Preview of first 10 emails ──\n");
    for (const inv of withEmails.slice(0, 10)) {
      const { subject, text } = generateFullEmail(inv);
      console.log(`TO: ${inv.name} <${inv.email}> (${inv.firm})`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`BODY:\n${text.substring(0, 300)}...\n`);
      console.log("─".repeat(60));
    }
    console.log(`\n...and ${Math.max(0, withEmails.length - 10)} more.\n`);
    return;
  }

  if (!sendMode) {
    console.log("Use --send to fire emails, --dry-run to preview.");
    return;
  }

  // Step 5: Send emails
  const delayMs = Math.ceil((3600 * 1000) / ratePerHour);
  let sent = 0;
  let failed = 0;

  console.log(`\nStep 4: Sending ${withEmails.length} personalized emails at ${ratePerHour}/hour...\n`);

  for (const inv of withEmails) {
    const { subject, html, text } = generateFullEmail(inv);

    try {
      const result = await sendEmail({
        from: "Polarity Lab <team@polarity-lab.com>",
        to: inv.email!,
        subject,
        html,
        text,
        tags: [
          { name: "type", value: "vc-deep-research" },
          { name: "firm", value: inv.firm.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50) },
          { name: "source", value: "mercury" },
        ],
      });

      sent++;
      saveSentEmail(inv.email!);
      console.log(
        `[${sent + failed}/${withEmails.length}] ✓ ${inv.name} (${inv.firm}) — ${inv.email} — ID: ${result.data?.id}`
      );
    } catch (err) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[${sent + failed}/${withEmails.length}] ✗ ${inv.name} (${inv.firm}) — ${inv.email} — ERROR: ${errorMsg}`
      );
    }

    if (sent + failed < withEmails.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════╗
║           DEEP RESEARCH CAMPAIGN COMPLETE             ║
╠══════════════════════════════════════════════════════════╣
║  Researched: ${String(researched.length).padEnd(40)}║
║  Sent: ${String(sent).padEnd(47)}║
║  Failed: ${String(failed).padEnd(45)}║
╚══════════════════════════════════════════════════════════╝
  `);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
