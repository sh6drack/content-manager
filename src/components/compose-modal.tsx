"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { PLATFORMS, type Platform } from "@/lib/constants";
import { CloseIcon, ImageIcon, ClockIcon, PlatformIcon } from "@/lib/icons";
import { createPostAction } from "@/hooks/use-posts";

const ALL_PLATFORMS: Platform[] = ["x", "instagram", "linkedin", "tiktok", "youtube", "threads"];

interface MediaPreview {
  id?: string;
  file: File;
  preview: string;
  uploading: boolean;
}

function PlatformToggle({
  platform,
  active,
  onToggle,
}: {
  platform: Platform;
  active: boolean;
  onToggle: () => void;
}) {
  const config = PLATFORMS[platform];
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium
        transition-all duration-200 cursor-pointer border
        ${
          active
            ? "border-white/10 bg-white/[0.06] text-text-primary"
            : "border-transparent bg-white/[0.02] text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]"
        }
      `}
    >
      <div
        className="w-1.5 h-1.5 rounded-full transition-all duration-200"
        style={{
          backgroundColor: active ? config.color : "var(--text-tertiary)",
          boxShadow: active ? `0 0 6px ${config.color}` : "none",
        }}
      />
      {config.label}
    </button>
  );
}

function PlatformPreview({
  platform,
  content,
  mediaFiles,
}: {
  platform: Platform;
  content: string;
  mediaFiles: MediaPreview[];
}) {
  const config = PLATFORMS[platform];
  const charCount = content.length;
  const charLimit = config.charLimit;
  const isOver = charCount > charLimit;

  return (
    <div className="bg-white/[0.02] border border-border-subtle rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div style={{ color: config.color }} className="opacity-70">
            <PlatformIcon platform={platform} size={14} />
          </div>
          <span className="text-[12px] font-medium text-text-secondary">
            {config.label}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono ${
            isOver ? "text-status-failed" : "text-text-tertiary"
          }`}
        >
          {charCount}/{charLimit}
        </span>
      </div>

      <div className="text-[13px] text-text-secondary leading-relaxed min-h-[60px]">
        {content || (
          <span className="text-text-tertiary italic">Preview will appear here...</span>
        )}
      </div>

      {/* Media preview */}
      {mediaFiles.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {mediaFiles.map((m, i) => (
            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/[0.03]">
              {m.file.type.startsWith("video/") ? (
                <video src={m.preview} className="w-full h-full object-cover" muted />
              ) : (
                <img src={m.preview} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Platform-specific mock chrome */}
      <div className="border-t border-border-subtle pt-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/[0.05]" />
        <div className="flex flex-col gap-0.5">
          <div className="w-16 h-2 rounded bg-white/[0.05]" />
          <div className="w-10 h-1.5 rounded bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}

export function ComposeModal({ onClose }: { onClose: () => void }) {
  const [activePlatforms, setActivePlatforms] = useState<Set<Platform>>(
    new Set(["x", "linkedin"])
  );
  const [content, setContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.media.id;
      }
      const err = await res.json();
      toast.error(err.error || "Upload failed");
    } catch {
      toast.error(`Failed to upload ${file.name}`);
    }
    return null;
  }

  async function handleAddMedia(files: FileList) {
    const newPreviews: MediaPreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setMediaFiles((prev) => [...prev, ...newPreviews]);

    // Upload each file and update with ID
    for (let i = 0; i < newPreviews.length; i++) {
      const mediaId = await uploadFile(newPreviews[i].file);
      setMediaFiles((prev) =>
        prev.map((m) =>
          m.preview === newPreviews[i].preview
            ? { ...m, id: mediaId || undefined, uploading: false }
            : m
        )
      );
    }
  }

  function removeMedia(index: number) {
    setMediaFiles((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(publishNow = false) {
    if (!content.trim() || activePlatforms.size === 0) {
      toast.error("Add content and select at least one platform");
      return;
    }

    if (publishNow) setIsPublishing(true);
    else setIsSaving(true);

    try {
      const scheduledFor =
        !publishNow && scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : undefined;

      const mediaIds = mediaFiles
        .filter((m) => m.id)
        .map((m) => m.id!);

      const result = await createPostAction({
        content,
        platforms: Array.from(activePlatforms),
        scheduledFor,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
      });

      if (publishNow && result?.post?.id) {
        // Immediately publish
        const publishRes = await fetch(`/api/posts/${result.post.id}/publish`, {
          method: "POST",
        });
        const publishData = await publishRes.json();

        if (publishData.success) {
          toast.success(
            publishData.allSucceeded
              ? "Published to all platforms"
              : "Published (some platforms failed)"
          );
        } else {
          toast.error(publishData.error || "Publishing failed");
        }
      } else {
        toast.success(scheduledFor ? "Post scheduled" : "Post saved as draft");
      }

      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  }

  function togglePlatform(p: Platform) {
    setActivePlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  const activePlatformList = ALL_PLATFORMS.filter((p) => activePlatforms.has(p));
  const anyUploading = mediaFiles.some((m) => m.uploading);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-[#0c0a10] border border-border-subtle rounded-2xl w-full max-w-[1100px] max-h-[85vh] overflow-hidden pointer-events-auto animate-modal-slide flex flex-col"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 120px -40px rgba(125,60,150,0.15)",
          }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
            <h2 className="text-[16px] font-semibold text-text-primary tracking-tight">
              Create Post
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Platform toggles */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border-subtle shrink-0 overflow-x-auto">
            {ALL_PLATFORMS.map((p) => (
              <PlatformToggle
                key={p}
                platform={p}
                active={activePlatforms.has(p)}
                onToggle={() => togglePlatform(p)}
              />
            ))}
          </div>

          {/* Content area — split panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Editor */}
            <div className="flex-1 flex flex-col border-r border-border-subtle">
              <div className="flex-1 p-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-full bg-transparent text-text-primary text-[15px] leading-relaxed resize-none outline-none placeholder:text-text-tertiary"
                />
              </div>

              {/* Media preview strip */}
              {mediaFiles.length > 0 && (
                <div className="flex gap-2 px-6 py-2 overflow-x-auto border-t border-border-subtle">
                  {mediaFiles.map((m, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 group">
                      {m.file.type.startsWith("video/") ? (
                        <video src={m.preview} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={m.preview} alt="" className="w-full h-full object-cover" />
                      )}
                      {m.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-accent-cream/50 border-t-accent-cream rounded-full animate-spin" />
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center
                                   opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <CloseIcon size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom toolbar */}
              <div className="flex items-center gap-3 px-6 py-3 border-t border-border-subtle shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                >
                  <ImageIcon />
                  Media
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleAddMedia(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200 cursor-pointer">
                  <ClockIcon />
                  Schedule
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Schedule inputs */}
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-white/[0.03] border border-border-subtle text-text-secondary text-[12px] rounded-lg px-2.5 py-1.5 outline-none focus:border-accent-cream/30 transition-colors [color-scheme:dark]"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-white/[0.03] border border-border-subtle text-text-secondary text-[12px] rounded-lg px-2.5 py-1.5 outline-none focus:border-accent-cream/30 transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Post Now button */}
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isPublishing || isSaving || anyUploading}
                  className="flex items-center gap-2 bg-white/[0.06] border border-border-subtle text-text-primary px-4 py-2 rounded-lg font-medium text-[13px] cursor-pointer transition-all duration-200 hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? "Publishing..." : "Post Now"}
                </button>

                {/* Save / Schedule button */}
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSaving || isPublishing || anyUploading}
                  className="flex items-center gap-2 bg-accent-cream text-[#1a1520] px-5 py-2 rounded-lg font-semibold text-[13px] cursor-pointer transition-all duration-200 hover:brightness-110 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? "Saving..."
                    : scheduleDate
                      ? "Schedule"
                      : "Save Draft"}
                </button>
              </div>
            </div>

            {/* Right: Platform previews */}
            <div className="w-[380px] overflow-y-auto p-6 flex flex-col gap-4 shrink-0">
              <div className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold mb-1">
                Platform Previews
              </div>
              {activePlatformList.length === 0 ? (
                <div className="text-text-tertiary text-[13px] text-center py-8">
                  Select platforms to see previews
                </div>
              ) : (
                activePlatformList.map((p) => (
                  <PlatformPreview key={p} platform={p} content={content} mediaFiles={mediaFiles} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
