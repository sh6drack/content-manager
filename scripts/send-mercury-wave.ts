#!/usr/bin/env npx tsx
/**
 * Mercury Wave — Sends emails ONLY to new Mercury-sourced VCs
 * (skips anyone already in the original 102 VC list)
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { Resend } from "resend";
import { ALL_VCS } from "../src/services/vc-list";
import { generateVCEmail, type VCContact } from "../src/services/email-templates";
import { getMercuryVCs } from "../src/services/mercury-vc-list";

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("ERROR: RESEND_API_KEY not set");
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const dryRun = process.argv.includes("--dry-run");

  // Get existing emails/names to skip
  const existingEmails = new Set(ALL_VCS.map((vc) => vc.email.toLowerCase()));
  const existingNames = new Set(ALL_VCS.map((vc) => vc.name.toLowerCase()));

  // Get Mercury VCs and filter out anyone already emailed
  const mercuryVCs = getMercuryVCs().filter(
    (vc) => !existingEmails.has(vc.email.toLowerCase()) && !existingNames.has(vc.name.toLowerCase())
  );

  console.log(`
╔══════════════════════════════════════════════════╗
║     MERCURY WAVE — New VC Contacts Only          ║
╠══════════════════════════════════════════════════╣
║  New Mercury contacts: ${String(mercuryVCs.length).padEnd(23)}║
║  Already emailed (skipped): ${String(ALL_VCS.length).padEnd(19)}║
║  Rate: 80/hour                                  ║
║  Est. time: ${String(Math.ceil((mercuryVCs.length / 80) * 60) + " minutes").padEnd(36)}║
║  Dry run: ${String(dryRun).padEnd(38)}║
╚══════════════════════════════════════════════════╝
  `);

  if (dryRun) {
    console.log("\n── DRY RUN — Preview ──\n");
    for (const vc of mercuryVCs.slice(0, 10)) {
      const { subject } = generateVCEmail(vc);
      console.log(`TO: ${vc.name} <${vc.email}> (${vc.firm})`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`SECTORS: ${vc.focus?.join(", ")}`);
      console.log(`CHECK: ${vc.checkSize || "N/A"}\n`);
    }
    console.log(`...and ${Math.max(0, mercuryVCs.length - 10)} more.\n`);
    return;
  }

  const delayMs = Math.ceil((3600 * 1000) / 80); // 80/hour
  let sent = 0;
  let failed = 0;

  for (const vc of mercuryVCs) {
    const { subject, html, text } = generateVCEmail(vc);

    try {
      const result = await resend.emails.send({
        from: "Polarity Lab <team@polarity-lab.com>",
        to: vc.email,
        subject,
        html,
        text,
        tags: [
          { name: "type", value: "vc-outreach-mercury" },
          { name: "firm", value: vc.firm.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50) },
        ],
      });

      sent++;
      console.log(
        `[${sent + failed}/${mercuryVCs.length}] ✓ ${vc.name} (${vc.firm}) — ${vc.email} — ID: ${result.data?.id}`
      );
    } catch (err) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[${sent + failed}/${mercuryVCs.length}] ✗ ${vc.name} (${vc.firm}) — ${vc.email} — ERROR: ${errorMsg}`
      );
    }

    if (sent + failed < mercuryVCs.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║           MERCURY WAVE COMPLETE                  ║
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
