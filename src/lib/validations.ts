import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required").max(10000),
  platforms: z
    .array(
      z.enum(["x", "instagram", "linkedin", "tiktok", "youtube", "threads"])
    )
    .min(1, "Select at least one platform"),
  scheduledFor: z.string().datetime().optional(),
  mediaIds: z.array(z.string().uuid()).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().min(1).max(10000).optional(),
  platforms: z
    .array(
      z.enum(["x", "instagram", "linkedin", "tiktok", "youtube", "threads"])
    )
    .min(1)
    .optional(),
  status: z.enum(["draft", "scheduled"]).optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
