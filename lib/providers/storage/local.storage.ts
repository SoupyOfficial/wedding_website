import * as fs from "fs";
import * as path from "path";
import type {
  IStorageProvider,
  UploadOptions,
  StorageResult,
} from "./storage.provider";

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;
  private writable: boolean;

  constructor(uploadDir?: string) {
    this.uploadDir =
      uploadDir || path.join(process.cwd(), "public", "uploads");
    this.writable = true;
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch {
      // Filesystem is likely read-only (e.g. Vercel serverless)
      this.writable = false;
      console.warn(
        "[Storage] Local filesystem is read-only. File uploads will fail. " +
        "Set STORAGE_PROVIDER=cloudinary with valid Cloudinary credentials for production."
      );
    }
  }

  async upload(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<StorageResult> {
    if (!this.writable) {
      throw new Error(
        "Local filesystem is read-only. Configure a cloud storage provider " +
        "(set STORAGE_PROVIDER=cloudinary) for production deployments."
      );
    }

    const category = options?.category || "general";
    const categoryDir = path.join(this.uploadDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Create unique filename
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    const filePath = path.join(categoryDir, uniqueName);

    fs.writeFileSync(filePath, file);

    const key = `${category}/${uniqueName}`;
    return {
      key,
      url: `/uploads/${key}`,
      size: file.length,
      contentType: options?.contentType || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async list(prefix?: string): Promise<StorageResult[]> {
    const dir = prefix
      ? path.join(this.uploadDir, prefix)
      : this.uploadDir;
    if (!fs.existsSync(dir)) return [];

    const results: StorageResult[] = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const key = prefix ? `${prefix}/${file.name}` : file.name;
        const filePath = path.join(dir, file.name);
        const stats = fs.statSync(filePath);
        results.push({
          key,
          url: `/uploads/${key}`,
          size: stats.size,
          contentType: "application/octet-stream",
        });
      }
    }

    return results;
  }
}
