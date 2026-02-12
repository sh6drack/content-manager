import { NextRequest, NextResponse } from "next/server";
import { ALL_VCS, VC_CATEGORIES, getVCStats } from "@/services/vc-list";
import { runOutreachCampaign, type VCContact } from "@/services/email-outreach";

// GET — list VC targets and stats
export async function GET() {
  const stats = getVCStats();
  return NextResponse.json({
    stats,
    categories: Object.keys(VC_CATEGORIES),
    contacts: ALL_VCS.map((vc) => ({
      name: vc.name,
      email: vc.email,
      firm: vc.firm,
      focus: vc.focus,
      stage: vc.stage,
    })),
  });
}

// POST — start a campaign
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    categories = Object.keys(VC_CATEGORIES),
    fromEmail = "team@polarity-lab.com",
    fromName = "Polarity Lab",
    ratePerHour = 80,
    dryRun = false,
  } = body;

  // Filter contacts by category
  let contacts = categories.flatMap(
    (cat: string) => VC_CATEGORIES[cat as keyof typeof VC_CATEGORIES] || []
  );

  // Deduplicate by email
  const seen = new Set<string>();
  contacts = contacts.filter((vc: VCContact) => {
    if (seen.has(vc.email)) return false;
    seen.add(vc.email);
    return true;
  });

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      totalContacts: contacts.length,
      estimatedTimeMinutes: Math.ceil((contacts.length / ratePerHour) * 60),
      sampleContacts: contacts.slice(0, 5).map((vc: VCContact) => ({
        name: vc.name,
        email: vc.email,
        firm: vc.firm,
      })),
    });
  }

  // Create campaign record
  const campaignId = crypto.randomUUID();

  // Start campaign in background (don't await — it runs over time)
  const campaignPromise = runOutreachCampaign(contacts, campaignId, {
    fromEmail,
    fromName,
    ratePerHour,
    onProgress: (sent, total, lastResult) => {
      console.log(
        `[Campaign ${campaignId}] ${sent}/${total} — ${lastResult.email}: ${lastResult.success ? "sent" : "failed"}`
      );
    },
  });

  // Fire and forget — the campaign runs in the background
  campaignPromise.catch((err) => {
    console.error(`[Campaign ${campaignId}] Fatal error:`, err);
  });

  return NextResponse.json({
    campaignId,
    status: "started",
    totalContacts: contacts.length,
    ratePerHour,
    estimatedTimeMinutes: Math.ceil((contacts.length / ratePerHour) * 60),
    message: `Campaign started. Sending ${contacts.length} emails at ${ratePerHour}/hour.`,
  });
}
