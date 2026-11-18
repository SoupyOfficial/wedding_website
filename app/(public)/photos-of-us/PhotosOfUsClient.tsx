"use client";

import { useState, useRef } from "react";
import { usePublicSettings } from "@/lib/hooks";
import { PageHeader, Alert } from "@/components/ui";

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface SelectedFile {
  id: string;
  file: File;
  preview: string | null;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return ext === "heic" || ext === "heif";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = src;
  });
}

/**
 * Downscale + re-encode images in the browser before upload (mobile-friendly).
 * HEIC files cannot be decoded by the browser, so they pass through unchanged —
 * the storage provider (Cloudinary) converts them server-side.
 */
async function compressImage(file: File): Promise<File> {
  if (isHeic(file)) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight)
    );

    // Already within limits and a web-friendly format — skip re-encoding
    if (scale === 1 && file.type !== "image/png") {
      return file;
    }

    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
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
      if (!file.type.startsWith("image/") && !isHeic(file)) {
        setError(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is over 10MB.`);
        continue;
      }

      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: isHeic(file) ? null : URL.createObjectURL(file),
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
      setError("Please select at least one photo.");
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

    try {
      const formData = new FormData();
      let compressedCount = 0;

      for (const item of pending) {
        const processed = await compressImage(item.file);
        if (processed.size !== item.file.size) compressedCount += 1;
        formData.append("files", processed, processed.name);
      }
      if (uploaderName.trim()) formData.append("uploaderName", uploaderName.trim());
      if (caption.trim()) formData.append("caption", caption.trim());
      formData.append("category", "guest-uploads");

      const res = await fetch("/api/v1/photos/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading" ? { ...f, status: "error", error: data.error || "Upload failed." } : f
          )
        );
        return;
      }

      const results = (data.data?.results ?? []) as Array<{
        name: string;
        status: "uploaded" | "failed";
        error?: string;
      }>;

      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== "uploading") return f;
          const idx = pending.findIndex((p) => p.id === f.id);
          const result = results[idx];
          if (!result) return { ...f, status: "error", error: "No result returned." };
          if (result.status === "failed") {
            return { ...f, status: "error", error: result.error || "Upload failed." };
          }
          return { ...f, status: "done" };
        })
      );

      const doneCount = results.filter((r) => r.status === "uploaded").length;
      const failedCount = results.filter((r) => r.status === "failed").length;

      let message = `${doneCount} photo${doneCount === 1 ? "" : "s"} uploaded and pending approval.`;
      if (failedCount > 0) message += ` ${failedCount} skipped.`;
      if (compressedCount > 0) message += " Photos were compressed for faster upload.";
      setSuccess(message);

      if (doneCount > 0) setCaption("");
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
            <h2 className="text-gold font-serif text-2xl text-center mb-6">Upload Photos</h2>

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
                <p className="text-ivory/70 text-sm mb-1">Tap to select or drop photos here</p>
                <p className="text-ivory/40 text-xs">
                  JPG, PNG, HEIC, WEBP · up to 10MB each · multiple at once
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                  aria-label="Choose photos to upload"
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
                          <span className="text-xl">🖼️</span>
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
                {uploading ? "Uploading…" : uploadable > 1 ? `Upload ${uploadable} Photos` : "Upload Photo"}
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
