import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { platformConnections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db.query.platformConnections.findMany({
    where: eq(platformConnections.userId, session.user.id),
    columns: {
      id: true,
      platform: true,
      platformUsername: true,
      connectedAt: true,
      tokenExpiresAt: true,
    },
  });

  return NextResponse.json({ connections });
}
