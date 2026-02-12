#!/usr/bin/env npx tsx
/**
 * Polarity Lab - Targeted Investor Outreach
 *
 * Sends personalized emails to deeply researched investor targets.
 * Each investor gets a custom opener based on their specific thesis,
 * portfolio, and why CCX matters to them.
 *
 * Usage:
 *   npx tsx scripts/send-targeted-wave.ts              # Send all
 *   npx tsx scripts/send-targeted-wave.ts --dry-run    # Preview
 *   npx tsx scripts/send-targeted-wave.ts --tier=1     # Send specific tier
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { Resend } from "resend";
import { polarityLabInvestors } from "../src/services/targeted-investors";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tierFilter = args.find((a) => a.startsWith("--tier="))?.split("=")[1];

// Tier mapping based on investor focus
function getTier(investor: typeof polarityLabInvestors[0]): number {
  const focusStr = investor.focus.join(" ").toLowerCase();
  const notes = investor.notes.toLowerCase();

  if (notes.includes("neuroscien") || notes.includes("affective computing") || notes.includes("brainmind") || notes.includes("brain tech")) return 1;
  if (focusStr.includes("music") || notes.includes("spotify") || notes.includes("waxfeed") || notes.includes("music")) return 2;
  if (focusStr.includes("health") || notes.includes("mental health") || notes.includes("behavioral") || notes.includes("psychiatry")) return 2;
  if (focusStr.includes("diverse") || notes.includes("black founder") || notes.includes("underrepresented")) return 4;
  if (notes.includes("brown") || notes.includes("mit alumni") || notes.includes("alumni venture") || notes.includes("rhode island")) return 5;
  return 3; // default: platform/infrastructure
}

// Generate a tailored subject line based on tier
function getTailoredSubject(investor: typeof polarityLabInvestors[0], tier: number): string {
  switch (tier) {
    case 1: return "Yeo 7-network model meets production AI: 4 domains, 0 retraining";
    case 2: {
      const notes = investor.notes.toLowerCase();
      if (notes.includes("music") || notes.includes("spotify")) return "553k albums, 26 listener archetypes, the cognitive layer music needs";
      if (notes.includes("health") || notes.includes("behavioral")) return "An algorithm that detects when someone quietly stops following their treatment plan";
      if (notes.includes("podcast") || notes.includes("media")) return "Every podcast episode is research data the algorithm trains on";
      return "One algorithm, four domains, zero retraining";
    }
    case 3: return "Domain-agnostic cognitive AI: deployed across 4 verticals, no retraining";
    case 4: return "Black founders from Brown and MIT building patented cognitive AI infrastructure";
    case 5: return "Fellow alum building neuroscience-grounded AI, would love 15 min";
    default: return "We built the algorithm that teaches AI what to hold onto, and shipped it 4 times to prove it";
  }
}

// Generate tailored opener from investor notes
function getTailoredOpener(investor: typeof polarityLabInvestors[0], tier: number): string {
  const notes = investor.notes;
  const notesLower = notes.toLowerCase();

  if (tier === 1) {
    // Neuroscience tier: lead with the science
    if (notesLower.includes("affective computing")) {
      return `Your work in affective computing pioneered measuring human emotional states through technology. We are doing the same thing through language. Our algorithm, Conversational Connectomics, uses spreading activation theory and Bayesian memory models to measure what things weigh in someone's life from how they talk. Same goal, different modality.`;
    }
    if (notesLower.includes("brain tech") || notesLower.includes("braintech")) {
      return `You are investing in technology that understands the brain. We built an algorithm grounded in the Yeo 7-network model that measures what matters to someone from their conversation. Not sentiment analysis. Cognitive weight. It has been deployed across four domains without retraining to prove the math is universal.`;
    }
    return `We built an algorithm grounded in the Yeo 7-network brain model and Bayesian memory retrieval that measures what things weigh in someone's life from conversation alone. 145+ peer-reviewed papers behind the science, 12 core constructs validated, 2 patents filed. We thought you would be one of the few people who would actually read the papers.`;
  }

  if (tier === 4) {
    // Diversity thesis: lead with team + substance
    return `Three Black founders. Brown and MIT. Two patents. An MD candidate with 11 years in neuroscience. We are not pitching a wrapper around an LLM. We built a novel algorithm called Conversational Connectomics that measures what matters to people from how they talk. It has been deployed across four domains without retraining. The science is real and the products are live.`;
  }

  if (tier === 5) {
    // Alumni tier: warm connection
    if (notesLower.includes("brown")) {
      return `We are fellow Brown founders building something we think you would find interesting. Our team includes an MD candidate from Brown Alpert and a CS student from Brown '27. We built an algorithm grounded in neuroscience that measures what things weigh in someone's life from conversation. It has been deployed across four domains without changing the math.`;
    }
    if (notesLower.includes("mit")) {
      return `Our founder trained at MIT Boyden Lab in whole brain imaging before building an algorithm that measures cognitive weight from conversation. We thought the MIT alumni network would appreciate what 11 years of neuroscience research looks like when it becomes deployable math. The algorithm has been shipped across four domains without retraining.`;
    }
    return `We are building in Providence and thought the local community should know about what we are working on. Our team built an algorithm grounded in neuroscience that measures what things weigh in someone's life from how they talk. It has been deployed across four domains without retraining. Two patents filed.`;
  }

  // Tier 2: domain match
  if (notesLower.includes("spotify") || notesLower.includes("music")) {
    return `You know music personalization from the inside. We built an algorithm that measures what things weigh in someone's life, then pointed it at music without changing the math. Out came WaxFeed: 553,000 albums indexed, 26 listener archetypes that emerged from the data on their own. The algorithm found them because it measures cognitive weight, not clicks.`;
  }
  if (notesLower.includes("mental health") || notesLower.includes("behavioral health")) {
    return `You are working at the intersection of technology and behavioral health. Our founder is an MD candidate at Brown who spent 11 years asking how you measure what matters to someone. The answer is an algorithm that detects drift, when behavior quietly diverges from baseline, by measuring what things weigh in someone's life from how they talk about them.`;
  }
  if (notesLower.includes("podcast") || notesLower.includes("audio")) {
    return `You are investing in podcast and audio infrastructure. We built something that goes deeper than production tools. Our algorithm measures what things weigh in someone's life from conversation, and our podcast AVDP is both a product and a research instrument. Every episode is data the algorithm trains on. Entertainment that doubles as science.`;
  }

  // Tier 3: platform/infrastructure (default)
  if (notesLower.includes("domain-agnostic") || notesLower.includes("4 domain") || notesLower.includes("four domain")) {
    return `You invest in AI that generalizes. We built an algorithm that measures what things weigh in someone's life from how they talk about it, and proved it is domain-agnostic by deploying it across music, problem-solving, podcasts, and talent discovery without changing the math. Four verticals. Zero retraining. Two patents.`;
  }

  return `We built an algorithm that measures what things weigh in someone's life. Not what they clicked or liked. What carries weight. What repeats. What changes. It learns all of it from how people talk about what they care about. We have deployed it across four domains without retraining to prove the math works everywhere.`;
}

function generateTailoredEmail(investor: typeof polarityLabInvestors[0]): { subject: string; html: string; text: string } {
  const tier = getTier(investor);
  const subject = getTailoredSubject(investor, tier);
  const opener = getTailoredOpener(investor, tier);
  const firstName = investor.name.split(" ")[0];

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.7;">
  <p>${firstName},</p>

  <p>${opener}</p>

  <p>Here is how it works. The algorithm listens to natural conversation and tracks three things: what someone repeats, what they give weight to, and what they quietly avoid. Over time it measures how those signals shift, compound, and decay. The output is a living cognitive profile that updates with every interaction. Not a summary. Not a keyword cloud. A structured model of what actually matters to a person, built from their own language. Two patents filed, grounded in the neuroscience of how brains assign importance.</p>

  <p>We proved it by pointing the algorithm at music. No retraining, no domain-specific tuning. Out came <a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a>: 553,000 albums indexed, and 26 distinct listener archetypes that the algorithm discovered on its own. Nobody designed those archetypes. The math surfaced them from how people talk about what they listen to. WaxFeed is live, people use it, and every conversation on the platform feeds back into the research. The full technical breakdown of the algorithm is here: <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">algorithm.polarity-lab.com</a></p>

  <p>We then deployed the same algorithm to problem-solving (<a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a>, where it matches builders to bounties using cognitive fingerprints) and talent discovery, all without changing the underlying math. Four domains, zero retraining. The algorithm does not know what music is or what a bounty is. It knows what things weigh.</p>

  <p>The team: Theodore Addo, MD candidate at Brown, MIT Boyden Lab, 11 years on this question. Shadrack Annor, Brown CS '27, built WaxFeed, patent #1. Nathan Amankwah, UOttawa '27, formalized the algorithm, patent #2. We also produce <a href="https://polarity-lab.com" style="color: #6366f1;">AVDP</a>, a long-form podcast where every episode is research data the algorithm trains on. Entertainment that doubles as science.</p>

  <p>Happy to do 30 minutes and show you what we have built.</p>

  <p>Best,<br/>
  <strong>Polarity Lab</strong><br/>
  A research lab that ships. Providence, RI.<br/>
  <a href="https://polarity-lab.com" style="color: #6366f1;">polarity-lab.com</a></p>
</div>
`.trim();

  const text = `${firstName},

${opener}

Here is how it works. The algorithm listens to natural conversation and tracks three things: what someone repeats, what they give weight to, and what they quietly avoid. Over time it measures how those signals shift, compound, and decay. The output is a living cognitive profile that updates with every interaction. Not a summary. Not a keyword cloud. A structured model of what actually matters to a person, built from their own language. Two patents filed, grounded in the neuroscience of how brains assign importance.

We proved it by pointing the algorithm at music. No retraining, no domain-specific tuning. Out came WaxFeed (https://wax-feed.com): 553,000 albums indexed, and 26 distinct listener archetypes that the algorithm discovered on its own. Nobody designed those archetypes. The math surfaced them from how people talk about what they listen to. WaxFeed is live, people use it, and every conversation on the platform feeds back into the research. The full technical breakdown of the algorithm is here: algorithm.polarity-lab.com

We then deployed the same algorithm to problem-solving (Painpoints, https://painpoints.site, where it matches builders to bounties using cognitive fingerprints) and talent discovery, all without changing the underlying math. Four domains, zero retraining. The algorithm does not know what music is or what a bounty is. It knows what things weigh.

The team: Theodore Addo, MD candidate at Brown, MIT Boyden Lab, 11 years on this question. Shadrack Annor, Brown CS '27, built WaxFeed, patent #1. Nathan Amankwah, UOttawa '27, formalized the algorithm, patent #2. We also produce AVDP, a long-form podcast where every episode is research data the algorithm trains on. Entertainment that doubles as science.

Happy to do 30 minutes and show you what we have built.

Best,
Polarity Lab
A research lab that ships. Providence, RI.
polarity-lab.com
`.trim();

  return { subject, html, text };
}

// ─── Main ───

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("ERROR: RESEND_API_KEY not set");
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  let investors = polarityLabInvestors;

  // Filter by tier if specified
  if (tierFilter) {
    const targetTier = parseInt(tierFilter);
    investors = investors.filter((inv) => getTier(inv) === targetTier);
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║     POLARITY LAB - TARGETED INVESTOR OUTREACH    ║
╠══════════════════════════════════════════════════╣
║  Total investors: ${String(investors.length).padEnd(29)}║
║  Tier filter: ${String(tierFilter || "all").padEnd(33)}║
║  Dry run: ${String(dryRun).padEnd(37)}║
╚══════════════════════════════════════════════════╝
  `);

  // Group by tier for display
  const tierCounts: Record<number, number> = {};
  for (const inv of investors) {
    const t = getTier(inv);
    tierCounts[t] = (tierCounts[t] || 0) + 1;
  }
  console.log("Tier breakdown:");
  console.log(`  Tier 1 (Neuroscience): ${tierCounts[1] || 0}`);
  console.log(`  Tier 2 (Domain match): ${tierCounts[2] || 0}`);
  console.log(`  Tier 3 (Platform/Infra): ${tierCounts[3] || 0}`);
  console.log(`  Tier 4 (Diversity thesis): ${tierCounts[4] || 0}`);
  console.log(`  Tier 5 (Alumni/Local): ${tierCounts[5] || 0}`);
  console.log();

  if (dryRun) {
    console.log("── DRY RUN - Preview of emails ──\n");
    for (const inv of investors.slice(0, 5)) {
      const { subject, text } = generateTailoredEmail(inv);
      const tier = getTier(inv);
      console.log(`[Tier ${tier}] TO: ${inv.name} <${inv.email}> (${inv.firm})`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`OPENER: ${text.split("\n\n")[1]?.substring(0, 200)}...`);
      console.log("─".repeat(60));
    }
    console.log(`\n...and ${Math.max(0, investors.length - 5)} more.\n`);
    return;
  }

  const delayMs = 45000; // ~80/hour
  let sent = 0;
  let failed = 0;

  for (const inv of investors) {
    const { subject, html, text } = generateTailoredEmail(inv);
    const tier = getTier(inv);

    try {
      const result = await resend.emails.send({
        from: "Polarity Lab <team@polarity-lab.com>",
        to: inv.email,
        subject,
        html,
        text,
        tags: [
          { name: "type", value: "vc-outreach-targeted" },
          { name: "firm", value: inv.firm.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50) },
          { name: "tier", value: `tier-${tier}` },
        ],
      });

      sent++;
      console.log(
        `[${sent + failed}/${investors.length}] [T${tier}] sent ${inv.name} (${inv.firm}) ${inv.email} ID:${result.data?.id}`
      );
    } catch (err) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[${sent + failed}/${investors.length}] [T${tier}] FAIL ${inv.name} (${inv.firm}) ${inv.email} ERR:${errorMsg}`
      );
    }

    if (sent + failed < investors.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║     TARGETED CAMPAIGN COMPLETE                   ║
╠══════════════════════════════════════════════════╣
║  Sent: ${String(sent).padEnd(41)}║
║  Failed: ${String(failed).padEnd(39)}║
║  Total: ${String(sent + failed).padEnd(40)}║
╚══════════════════════════════════════════════════╝
  `);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
