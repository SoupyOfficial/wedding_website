"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { usePublicSettings } from "@/lib/hooks";
import { PageHeader, Alert } from "@/components/ui";
import { VIDEO_EXTENSIONS } from "@/lib/media";

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per photo
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB per video
const CHUNK_MAX_BYTES = 3.5 * 1024 * 1024; // keep each request under Vercel's 4.5MB limit

interface SelectedFile {
  id: string;
  file: File;
  preview: string | null;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface ProcessedFile {
  file: File;
  idx: number;
}

interface UploadResult {
  status: "uploaded" | "failed";
  error?: string;
}

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return ext === "heic" || ext === "heif";
}

function isVideoFile(file: File): boolean {
  if (file.type.toLowerCase().startsWith("video/")) return true;
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = src;
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
  }
  return String(error);
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: JPEG_QUALITY,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  return new File(
    [blob],
    file.name.replace(/\.[^.]+$/, "") + ".jpg",
    { type: "image/jpeg" }
  );
}

async function compressImage(file: File): Promise<File> {
  const source = isHeic(file) ? await convertHeicToJpeg(file) : file;

  const url = URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight)
    );

    if (scale === 1 && source.type === "image/jpeg") {
      return source;
    }

    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;

    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return source;

    const base = source.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function chunkFiles(items: ProcessedFile[]): ProcessedFile[][] {
  const chunks: ProcessedFile[][] = [];
  let current: ProcessedFile[] = [];
  let size = 0;

  for (const item of items) {
    if (current.length > 0 && size + item.file.size > CHUNK_MAX_BYTES) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(item);
    size += item.file.size;
  }
  if (current.length > 0) chunks.push(current);

  return chunks;
}

export default function PhotosOfUsClient() {
  const { settings } = usePublicSettings();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hashtag = settings?.weddingHashtag || "#ForeverCampbells";

  function addFiles(list: FileList | File[]) {
    setError("");
    setSuccess("");
    const next: SelectedFile[] = [];

    for (const file of Array.from(list)) {
      const video = isVideoFile(file);
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !isHeic(file) && !video) {
        setError(`"${file.name}" is not a supported photo or video.`);
        continue;
      }
      const maxSize = video ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
      if (file.size > maxSize) {
        setError(`"${file.name}" is over ${video ? "200MB" : "10MB"}.`);
        continue;
      }

      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: isHeic(file) || video ? null : URL.createObjectURL(file),
        status: "pending",
      });
    }

    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    if (pending.length === 0) {
      setError("Please select at least one photo or video.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" || f.status === "error"
          ? { ...f, status: "uploading", error: undefined }
          : f
      )
    );

    const outcomes: (UploadResult | undefined)[] = new Array(pending.length).fill(undefined);
    const photoIdx: number[] = [];
    const videoIdx: number[] = [];
    pending.forEach((p, i) => (isVideoFile(p.file) ? videoIdx.push(i) : photoIdx.push(i)));

    try {
      // Photos: convert/compress, then chunked server upload
      const processed: ProcessedFile[] = [];
      for (const i of photoIdx) {
        try {
          const file = await compressImage(pending[i].file);
          processed.push({ file, idx: i });
        } catch (err) {
          outcomes[i] = { status: "failed", error: toErrorMessage(err) };
        }
      }

      for (const chunk of chunkFiles(processed)) {
        const formData = new FormData();
        for (const { file } of chunk) formData.append("files", file, file.name);
        if (uploaderName.trim()) formData.append("uploaderName", uploaderName.trim());
        if (caption.trim()) formData.append("caption", caption.trim());
        formData.append("category", "guest-uploads");

        const res = await fetch("/api/v1/photos/upload", { method: "POST", body: formData });
        const data = (await res.json()) as {
          error?: string;
          data?: { results?: UploadResult[] };
        };

        if (!res.ok) {
          const message = data.error || "Upload failed.";
          for (const { idx } of chunk) outcomes[idx] = { status: "failed", error: message };
          if (res.status === 503) {
            setError(message);
            break;
          }
          continue;
        }

        const results = data.data?.results ?? [];
        results.forEach((result, j) => {
          const item = chunk[j];
          if (!item) return;
          outcomes[item.idx] =
            result.status === "failed"
              ? { status: "failed", error: result.error || "Upload failed." }
              : { status: "uploaded" };
        });
      }

      // Videos: direct client upload to Blob, then register metadata
      const uploadedVideos: { idx: number; url: string; name: string }[] = [];
      for (const i of videoIdx) {
        try {
          const blob = await upload(pending[i].file.name, pending[i].file, {
            access: "public",
            handleUploadUrl: "/api/v1/blob/upload",
          });
          uploadedVideos.push({ idx: i, url: blob.url, name: pending[i].file.name });
        } catch (err) {
          outcomes[i] = { status: "failed", error: toErrorMessage(err) };
        }
      }

      if (uploadedVideos.length > 0) {
        const res = await fetch("/api/v1/photos/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: uploadedVideos.map((u) => ({ url: u.url, name: u.name })),
            uploaderName: uploaderName.trim() || null,
            caption: caption.trim() || null,
          }),
        });
        const data = (await res.json()) as {
          error?: string;
          data?: { results?: UploadResult[] };
        };

        if (!res.ok) {
          const message = data.error || "Upload failed.";
          for (const u of uploadedVideos) outcomes[u.idx] = { status: "failed", error: message };
        } else {
          const results = data.data?.results ?? [];
          uploadedVideos.forEach((u, j) => {
            const r = results[j];
            outcomes[u.idx] =
              r && r.status === "failed"
                ? { status: "failed", error: r.error || "Upload failed." }
                : { status: "uploaded" };
          });
        }
      }

      // Map outcomes back to file tiles
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== "uploading") return f;
          const i = pending.findIndex((p) => p.id === f.id);
          const outcome = outcomes[i];
          if (!outcome) return { ...f, status: "error", error: "Upload failed." };
          if (outcome.status === "failed") {
            return { ...f, status: "error", error: outcome.error || "Upload failed." };
          }
          return { ...f, status: "done" };
        })
      );

      const done = outcomes.filter((o) => o?.status === "uploaded").length;
      const failed = outcomes.filter((o) => o?.status === "failed").length;

      if (done > 0) {
        let message = `${done} upload${done === 1 ? "" : "s"} succeeded and pending approval.`;
        if (failed > 0) message += ` ${failed} skipped.`;
        setSuccess(message);
        setCaption("");
      } else if (failed > 0 && !error) {
        setError("No files were uploaded. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading" ? { ...f, status: "error", error: "Upload failed." } : f
        )
      );
    } finally {
      setUploading(false);
    }
  }

  const uploadable = files.filter((f) => f.status === "pending" || f.status === "error").length;

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Share Your Photos"
          subtitle="Upload your favorite moments from our celebration!"
        />

        <div className="max-w-lg mx-auto">
          <div className="card-celestial">
            <h2 className="text-gold font-serif text-2xl text-center mb-6">Upload Photos &amp; Videos</h2>

            {success && <Alert type="success" message={success} className="mb-4 text-center" />}
            {error && <Alert type="error" message={error} className="mb-4 text-center" />}

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragging ? "border-gold bg-gold/5" : "border-gold/20 hover:border-gold/40"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                }}
              >
                <div className="text-4xl mb-3">📸</div>
                <p className="text-ivory/70 text-sm mb-1">Tap to select or drop photos &amp; videos</p>
                <p className="text-ivory/40 text-xs">
                  JPG, PNG, HEIC, WEBP · MP4, MOV, WEBM · up to 10MB each (200MB for video)
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,.heic,.heif,video/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                  aria-label="Choose photos or videos to upload"
                />
              </div>

              {/* Selected files */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gold/10 bg-royal/20"
                    >
                      {f.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-ivory/50 text-[10px] p-1 text-center">
                          <span className="text-xl">{isVideoFile(f.file) ? "🎬" : "🖼️"}</span>
                          <span className="break-all">{f.file.name}</span>
                        </div>
                      )}
                      {f.status === "uploading" && (
                        <div className="absolute inset-0 bg-midnight/70 flex items-center justify-center text-gold text-xs">
                          Uploading…
                        </div>
                      )}
                      {f.status === "done" && (
                        <div className="absolute inset-0 bg-forest/70 flex items-center justify-center text-white text-lg">
                          ✓
                        </div>
                      )}
                      {f.status === "error" && (
                        <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center text-white text-[10px] p-1 text-center">
                          {f.error}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-midnight/80 rounded-full text-ivory hover:bg-red-900/80 transition-colors flex items-center justify-center text-sm"
                        aria-label={`Remove ${f.file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label htmlFor="photos-uploader" className="block text-ivory/70 text-sm mb-2">
                  Your Name
                </label>
                <input
                  id="photos-uploader"
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="input-celestial w-full"
                  placeholder="Who's uploading?"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="photos-caption" className="block text-ivory/70 text-sm mb-2">
                  Caption (optional)
                </label>
                <input
                  id="photos-caption"
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-celestial w-full"
                  placeholder="Describe this moment…"
                  maxLength={200}
                />
              </div>

              <button
                type="submit"
                disabled={uploading || uploadable === 0}
                className="btn-gold w-full py-3 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : uploadable > 1 ? `Upload ${uploadable} Files` : "Upload"}
              </button>
            </form>
          </div>

          {/* Hashtag reminder */}
          <div className="text-center mt-8">
            <p className="text-ivory/50 text-sm">Don&apos;t forget to tag your posts with</p>
            <p className="text-gold font-serif text-xl mt-1">{hashtag}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
