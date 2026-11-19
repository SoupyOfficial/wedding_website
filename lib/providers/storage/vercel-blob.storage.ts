import { put, del, list } from "@vercel/blob";
import type {
  IStorageProvider,
  UploadOptions,
  StorageResult,
} from "./storage.provider";

export class VercelBlobStorageProvider implements IStorageProvider {
  private configured: boolean;

  constructor() {
    this.configured = !!(
      process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
    );
    if (!this.configured) {
      console.warn(
        "[Storage] No Vercel Blob credentials found (BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID). Uploads will fail."
      );
    }
  }

  async upload(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<StorageResult> {
    if (!this.configured) {
      throw new Error(
        "Vercel Blob is not configured. Connect a Blob store to this project (BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID)."
      );
    }

    const category = options?.category || "general";
    const blob = await put(`${category}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: options?.contentType || "application/octet-stream",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });

    return {
      key: blob.url,
      url: blob.url,
      size: file.length,
      contentType: blob.contentType || options?.contentType || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    await del(key);
  }

  getUrl(key: string): string {
    return key;
  }

  async list(prefix?: string): Promise<StorageResult[]> {
    const result = await list({ prefix });
    return result.blobs.map((b) => ({
      key: b.url,
      url: b.url,
      size: b.size,
      contentType: "application/octet-stream",
    }));
  }
}
