import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadMedia, listMedia } from "@/services/media";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await listMedia(session.user.id);
  return NextResponse.json({ media: items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const postId = formData.get("postId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `File type ${file.type} not supported` },
      { status: 400 }
    );
  }

  // 50MB limit
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Max 50MB." },
      { status: 400 }
    );
  }

  try {
    const record = await uploadMedia(file, session.user.id, postId || undefined);
    return NextResponse.json({ media: record }, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
