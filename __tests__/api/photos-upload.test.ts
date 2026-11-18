import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mock the photo service (not the provider) ──────────────────────
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

function buildFile(name = "photo.jpg", type = "image/jpeg"): File {
  const content = new Uint8Array([1, 2, 3]);
  return new File([content], name, { type });
}

/** Build a FormData with zero or more files under the "files" key. */
function buildFormData(files?: File[]): FormData {
  const fd = new FormData();
  if (files) {
    for (const f of files) fd.append("files", f);
  }
  fd.append("caption", "Test photo");
  fd.append("uploaderName", "Guest");
  return fd;
}

function mockFormData(fd: FormData) {
  return vi.spyOn(NextRequest.prototype, "formData").mockResolvedValue(fd);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFeatureFlag).mockResolvedValue(true);
});

describe("Photos Upload", () => {
  it("returns 403 when feature disabled", async () => {
    vi.mocked(getFeatureFlag).mockResolvedValue(false);
    mockFormData(buildFormData([buildFile()]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when no file provided", async () => {
    mockFormData(buildFormData());
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when all files fail validation", async () => {
    mockUploadPhoto.mockRejectedValue(
      new PhotoValidationError("File must be an image.")
    );
    mockFormData(buildFormData([buildFile("doc.pdf", "application/pdf")]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("uploads a single photo successfully", async () => {
    mockUploadPhoto.mockResolvedValue({ id: "test-id", url: "http://img.jpg" });
    mockFormData(buildFormData([buildFile()]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.data.uploadedCount).toBe(1);
    expect(data.data.failedCount).toBe(0);
    expect(data.data.results[0].status).toBe("uploaded");
    expect(data.data.results[0].url).toBe("http://img.jpg");
  });

  it("uploads multiple photos in one request", async () => {
    mockUploadPhoto
      .mockResolvedValueOnce({ id: "a", url: "http://a.jpg" })
      .mockResolvedValueOnce({ id: "b", url: "http://b.jpg" });
    mockFormData(buildFormData([buildFile("a.jpg"), buildFile("b.jpg")]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(mockUploadPhoto).toHaveBeenCalledTimes(2);
    expect(data.data.uploadedCount).toBe(2);
  });

  it("returns partial results when some files fail validation", async () => {
    mockUploadPhoto
      .mockResolvedValueOnce({ id: "a", url: "http://a.jpg" })
      .mockRejectedValueOnce(new PhotoValidationError("File must be under 10MB."));
    mockFormData(buildFormData([buildFile("a.jpg"), buildFile("big.jpg")]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.data.uploadedCount).toBe(1);
    expect(data.data.failedCount).toBe(1);
    expect(data.data.results[1].status).toBe("failed");
  });

  it("returns 503 when storage not configured", async () => {
    mockUploadPhoto.mockRejectedValue(new Error("Storage not configured"));
    mockFormData(buildFormData([buildFile()]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 500 on generic upload error", async () => {
    mockUploadPhoto.mockRejectedValue(new Error("network timeout"));
    mockFormData(buildFormData([buildFile()]));
    const req = new NextRequest("http://l/api/v1/photos/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
