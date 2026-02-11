import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPostById } from "@/services/posts";
import { publishPost } from "@/services/publisher";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id, session.user.id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const result = await publishPost(id);
    return NextResponse.json({
      success: result.anySucceeded,
      allSucceeded: result.allSucceeded,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
