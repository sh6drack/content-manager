"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { CloseIcon } from "@/lib/icons";

interface MediaItem {
  id: string;
  url: string;
  filename: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setItems(data.media);
      }
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function handleUpload(files: FileList) {
    setUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          successCount++;
        } else {
          const data = await res.json();
          toast.error(`Failed to upload ${file.name}: ${data.error}`);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file${successCount > 1 ? "s" : ""}`);
      fetchMedia();
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Media deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Media Library</h1>
            <p className="text-sm text-text-secondary mt-1">
              {items.length} file{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-9 px-4 rounded-lg text-sm font-medium
                       bg-accent-cream text-bg-base hover:bg-accent-cream/90
                       transition-colors disabled:opacity-50 cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl border border-border-subtle bg-bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary mb-1">No media yet</p>
            <p className="text-xs text-text-tertiary">Upload images and videos to use in your posts</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl border border-border-subtle bg-bg-surface overflow-hidden"
              >
                {item.mimeType?.startsWith("video/") ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.filename || ""}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-bg-base/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-7 h-7 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center
                                 hover:bg-red-500/40 transition-colors cursor-pointer"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                  <div className="text-xs truncate">
                    <p className="text-text-primary truncate">{item.filename}</p>
                    <p className="text-text-tertiary">{formatSize(item.size)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
