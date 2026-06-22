import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mock the photo service (not the provider) ──────────────────────
// The route imports uploadPhoto & PhotoValidationError from the service.
// Mocking at this layer bypasses jsdom FormData/Content-Type issues and
// gives us full control over return values.
vi.mock("@/lib/services/photo.service", () => ({
  uploadPhoto: vi.fn(),
  PhotoValidationError: class PhotoValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "PhotoValidationError";
    }
  },
}));

// ─── Other mocks the route depends on ──────────────────────────────
vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlag: vi.fn().mockResolvedValue(true),
}));

import { getFeatureFlag } from "@/lib/config/feature-flags";
import { uploadPhoto, PhotoValidationError } from "@/lib/services/photo.service";
import { POST } from "@/app/api/v1/photos/upload/route";

const mockUploadPhoto = vi.mocked(uploadPhoto);

// ─── Helpers ────────────────────────────────────────────────────────

/** Build a FormData with optional file fields. If `file` is omitted, no file is added. */
function buildFormData(opts?: { name?: string; type?: string }) {
  const fd = new FormData();
  if (opts) {
    const content = new Uint8Array([1, 2, 3]);
    const file = new File([content], opts.name ?? "photo.jpg", { type: opts.type ?? "image/jpeg" });
    fd.append("file", file);
  }
  fd.append("caption", "Test photo");
  fd.append("uploaderName", "Guest");
  return fd;
}

/**
 * jsdom's NextRequest cannot parse FormData bodies because the Content-Type
 * header isn't set correctly. We mock formData() on the prototype so the
 * route can read form fields — then uploadPhoto (mocked above) handles the rest.
 */
function mockFormData(fd: FormData) {
  return vi
    .spyOn(NextRequest.prototype, "formData")
    .mockResolvedValue(fd);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFeatureFlag).mockResolvedValue(true);
});

describe("Photos Upload", () => {
  it("returns 403 when feature disabled", async () => {
    vi.mocked(getFeatureFlag).mockResolvedValue(false);
    mockFormData(buildFormData({}));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when no file provided", async () => {
    mockFormData(buildFormData(/* no file */));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-image file type", async () => {
    mockUploadPhoto.mockRejectedValue(
      new PhotoValidationError("File must be an image.")
    );
    mockFormData(buildFormData({ name: "doc.pdf", type: "application/pdf" }));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for disallowed extension", async () => {
    mockUploadPhoto.mockRejectedValue(
      new PhotoValidationError("Only JPG, PNG, GIF, and WebP files are allowed.")
    );
    mockFormData(buildFormData({ name: "photo.bmp", type: "image/bmp" }));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("uploads successfully", async () => {
    mockUploadPhoto.mockResolvedValue({ id: "test-id", url: "http://img.jpg" });
    mockFormData(buildFormData({}));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.data.url).toBe("http://img.jpg");
  });

  it("returns 503 when storage not configured", async () => {
    mockUploadPhoto.mockRejectedValue(new Error("Storage not configured"));
    mockFormData(buildFormData({}));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 500 on generic upload error", async () => {
    mockUploadPhoto.mockRejectedValue(new Error("network timeout"));
    mockFormData(buildFormData({}));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
