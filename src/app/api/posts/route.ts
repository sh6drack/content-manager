import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPost, listPosts, getPostStats } from "@/services/posts";
import { createPostSchema } from "@/lib/validations";
import type { Platform } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const platform = searchParams.get("platform") as Platform | null;
  const status = searchParams.get("status");
  const includeStats = searchParams.get("stats") === "true";

  const posts = await listPosts(session.user.id, {
    year: year ? parseInt(year) : undefined,
    month: month ? parseInt(month) : undefined,
    platform: platform || undefined,
    status: status || undefined,
  });

  if (includeStats) {
    const stats = await getPostStats(session.user.id);
    return NextResponse.json({ posts, stats });
  }

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const post = await createPost(session.user.id, parsed.data);
  return NextResponse.json({ post }, { status: 201 });
}
