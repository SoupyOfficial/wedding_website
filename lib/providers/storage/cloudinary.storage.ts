import { v2 as cloudinary } from "cloudinary";
import type {
  IStorageProvider,
  UploadOptions,
  StorageResult,
} from "./storage.provider";

export class CloudinaryStorageProvider implements IStorageProvider {
  private configured: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.configured = !!(cloudName && apiKey && apiSecret);

    if (this.configured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    } else {
      console.warn(
        "[Storage] Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
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
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
      );
    }
    const folder = options?.category
      ? `wedding/${options.category}`
      : "wedding/general";

    // Build transformation options
    const transformation: Record<string, unknown>[] = [];
    if (options?.maxWidth) {
      transformation.push({
        width: options.maxWidth,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      });
    } else {
      transformation.push({
        quality: "auto",
        fetch_format: "auto",
      });
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation,
          // Use original filename stem as public_id prefix for readability
          public_id: `${filename.replace(/\.[^.]+$/, "")}-${Date.now()}`,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            key: result.public_id,
            url: result.secure_url,
            size: result.bytes,
            contentType: `image/${result.format}`,
          });
        }
      );

      uploadStream.end(file);
    });
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: "image" });
  }

  getUrl(key: string): string {
    // Generate an optimized delivery URL
    return cloudinary.url(key, {
      secure: true,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
  }

  async list(prefix?: string): Promise<StorageResult[]> {
    const folder = prefix ? `wedding/${prefix}` : "wedding";
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 500,
      resource_type: "image",
    });

    return result.resources.map(
      (r: { public_id: string; secure_url: string; bytes: number; format: string }) => ({
        key: r.public_id,
        url: r.secure_url,
        size: r.bytes,
        contentType: `image/${r.format}`,
      })
    );
  }
}
