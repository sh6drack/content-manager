import { Resend } from "resend";
import { db } from "@/db";
import { outreachEmails, outreachCampaigns } from "@/db/outreach-schema";
import { eq } from "drizzle-orm";
import { generateVCEmail, type VCContact } from "./email-templates";

export type { VCContact } from "./email-templates";
export { generateVCEmail } from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Sending Engine ───

export async function sendOutreachEmail(
  contact: VCContact,
  campaignId: string,
  fromEmail: string = "team@polarity-lab.com",
  fromName: string = "Polarity Lab"
) {
  const { subject, html, text } = generateVCEmail(contact);

  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: contact.email,
      subject,
      html,
      text,
      headers: {
        "X-Campaign-Id": campaignId,
      },
      tags: [
        { name: "campaign", value: campaignId },
        { name: "firm", value: contact.firm.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50) },
        { name: "type", value: "vc-outreach" },
      ],
    });

    await db.insert(outreachEmails).values({
      campaignId,
      contactEmail: contact.email,
      contactName: contact.name,
      contactFirm: contact.firm,
      subject,
      status: "sent",
      resendId: result.data?.id || null,
      sentAt: new Date(),
    });

    return { success: true, id: result.data?.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    await db.insert(outreachEmails).values({
      campaignId,
      contactEmail: contact.email,
      contactName: contact.name,
      contactFirm: contact.firm,
      subject,
      status: "failed",
      error: errorMsg,
    });

    return { success: false, error: errorMsg };
  }
}

// ─── Batch Sender with Rate Limiting ───

export async function runOutreachCampaign(
  contacts: VCContact[],
  campaignId: string,
  options: {
    fromEmail?: string;
    fromName?: string;
    ratePerHour?: number;
    onProgress?: (sent: number, total: number, lastResult: { success: boolean; email: string }) => void;
  } = {}
) {
  const {
    fromEmail = "team@polarity-lab.com",
    fromName = "Polarity Lab",
    ratePerHour = 80,
    onProgress,
  } = options;

  const delayMs = Math.ceil((3600 * 1000) / ratePerHour);
  let sent = 0;
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const contact of contacts) {
    const result = await sendOutreachEmail(contact, campaignId, fromEmail, fromName);

    const entry = {
      email: contact.email,
      success: result.success,
      error: result.success ? undefined : result.error,
    };
    results.push(entry);
    sent++;

    onProgress?.(sent, contacts.length, { success: result.success, email: contact.email });

    if (sent < contacts.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  await db
    .update(outreachCampaigns)
    .set({
      status: "completed",
      sent: results.filter((r) => r.success).length,
      updatedAt: new Date(),
    })
    .where(eq(outreachCampaigns.id, campaignId));

  return {
    total: contacts.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}
