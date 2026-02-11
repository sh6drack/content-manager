import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAggregatedAnalytics, getAnalyticsTimeline } from "@/services/analytics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [aggregated, timeline] = await Promise.all([
    getAggregatedAnalytics(session.user.id),
    getAnalyticsTimeline(session.user.id),
  ]);

  return NextResponse.json({ ...aggregated, timeline });
}
