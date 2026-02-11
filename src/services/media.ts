import { db } from "@/db";
import { media } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { put, del } from "@vercel/blob";

export async function uploadMedia(
  file: File,
  userId: string,
  postId?: string
) {
  // Upload to Vercel Blob
  const blob = await put(`media/${userId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  // Get image dimensions if applicable
  let width: number | undefined;
  let height: number | undefined;

  // Create DB record
  const [record] = await db
    .insert(media)
    .values({
      userId,
      postId: postId || null,
      url: blob.url,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      width,
      height,
    })
    .returning();

  return record;
}

export async function listMedia(userId: string) {
  return db.query.media.findMany({
    where: eq(media.userId, userId),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });
}

export async function deleteMedia(mediaId: string, userId: string) {
  const record = await db.query.media.findFirst({
    where: and(eq(media.id, mediaId), eq(media.userId, userId)),
  });

  if (!record) throw new Error("Media not found");

  // Delete from Vercel Blob
  try {
    await del(record.url);
  } catch {
    // Blob may already be deleted — continue
  }

  // Delete from DB
  await db.delete(media).where(eq(media.id, mediaId));

  return { success: true };
}
