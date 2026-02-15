"use client";

import { useState, useRef } from "react";

export default function PhotosOfUsPage() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploaderName, setUploaderName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a photo.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("uploaderName", uploaderName);
      formData.append("category", "guest-uploads");

      const res = await fetch("/api/v1/photos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      setSuccess(true);
      setPreview(null);
      setCaption("");
      setUploaderName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">
            Photos of Us
          </h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            Share your favorite moments from our celebration!
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="card-celestial">
            <h2 className="text-gold font-serif text-2xl text-center mb-6">
              Upload a Photo
            </h2>

            {success && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-300 text-sm text-center">
                ✨ Photo uploaded successfully! It will appear in the gallery
                once approved.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Drop Zone */}
              <div
                className="border-2 border-dashed border-gold/20 rounded-lg p-6 text-center cursor-pointer hover:border-gold/40 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-midnight/80 rounded-full text-ivory hover:bg-red-900/80 transition-colors flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-3">📸</div>
                    <p className="text-ivory/60 text-sm mb-1">
                      Click to select a photo
                    </p>
                    <p className="text-ivory/30 text-xs">
                      JPG, PNG, WEBP — Max 10MB
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-ivory/70 text-sm mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="input-celestial w-full"
                  placeholder="Who's uploading?"
                />
              </div>

              <div>
                <label className="block text-ivory/70 text-sm mb-2">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-celestial w-full"
                  placeholder="Describe this moment..."
                  maxLength={200}
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !preview}
                className="btn-gold w-full py-3 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
            </form>
          </div>

          {/* Hashtag reminder */}
          <div className="text-center mt-8">
            <p className="text-ivory/50 text-sm">
              Don&apos;t forget to tag your posts with
            </p>
            <p className="text-gold font-serif text-xl mt-1">
              #ForeverCampbells
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
