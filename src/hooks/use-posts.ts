import useSWR, { mutate } from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function usePosts(year: number, month: number) {
  const { data, error, isLoading } = useSWR(
    `/api/posts?year=${year}&month=${month}&stats=true`,
    fetcher
  );

  return {
    posts: data?.posts ?? [],
    stats: data?.stats ?? null,
    isLoading,
    error,
  };
}

export function usePost(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/posts/${id}` : null,
    fetcher
  );

  return {
    post: data?.post ?? null,
    isLoading,
    error,
  };
}

export function invalidatePosts() {
  // Revalidate all post queries
  mutate((key: string) => typeof key === "string" && key.startsWith("/api/posts"));
}

export async function createPostAction(input: {
  content: string;
  title?: string;
  platforms: string[];
  scheduledFor?: string;
  mediaIds?: string[];
}) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create post");
  }

  invalidatePosts();
  return res.json();
}

export async function updatePostAction(
  id: string,
  input: {
    content?: string;
    title?: string;
    platforms?: string[];
    status?: string;
    scheduledFor?: string | null;
  }
) {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update post");
  }

  invalidatePosts();
  return res.json();
}

export async function deletePostAction(id: string) {
  const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete post");
  }

  invalidatePosts();
  return true;
}
