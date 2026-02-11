import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { platformConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { Platform } from "@/lib/constants";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;

  await db
    .delete(platformConnections)
    .where(
      and(
        eq(platformConnections.userId, session.user.id),
        eq(platformConnections.platform, platform as Platform)
      )
    );

  return NextResponse.json({ success: true });
}
