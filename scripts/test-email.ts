#!/usr/bin/env npx tsx
/**
 * Quick test — sends one email to verify Resend + polarity-lab.com domain works.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { sendEmail } from "../src/services/ses-client";

async function main() {
  console.log("Sending test email from team@polarity-lab.com via AWS SES...\n");

  try {
    const result = await sendEmail({
      from: "Polarity Lab <team@polarity-lab.com>",
      to: "team@polarity-lab.com",
      subject: "[TEST] Polarity Lab Outreach System - Delivery Verification",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; padding: 20px;">
          <h2>Outreach system is live.</h2>
          <p>This test confirms:</p>
          <ul>
            <li>AWS SES is configured</li>
            <li>polarity-lab.com domain is verified</li>
            <li>Emails send from team@polarity-lab.com</li>
          </ul>
          <p>Ready to fire the VC campaign.</p>
          <p>-- Polarity Lab Automation</p>
        </div>
      `,
      text: "Outreach system is live. AWS SES configured, domain verified, sending from team@polarity-lab.com. Ready to fire VC campaign.",
    });

    console.log("SUCCESS!");
    console.log("Email ID:", result.data?.id);
    console.log("Check team@polarity-lab.com inbox.\n");
  } catch (err) {
    console.error("FAILED:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
