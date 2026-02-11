import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fetchAnalyticsForUser } from "@/services/analytics";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch analytics for all users
  const allUsers = await db.select({ id: users.id }).from(users);
  let totalFetched = 0;

  for (const user of allUsers) {
    try {
      const result = await fetchAnalyticsForUser(user.id);
      totalFetched += result.fetched;
    } catch (err) {
      console.error(`Analytics cron failed for user ${user.id}:`, err);
    }
  }

  return NextResponse.json({ users: allUsers.length, fetched: totalFetched });
}
