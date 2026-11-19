import type { IStorageProvider } from "./storage/storage.provider";
import { LocalStorageProvider } from "./storage/local.storage";
import { VercelBlobStorageProvider } from "./storage/vercel-blob.storage";

function createStorageProvider(): IStorageProvider {
  const explicit = process.env.STORAGE_PROVIDER;

  if (explicit && explicit !== "local" && explicit !== "vercel-blob") {
    console.warn(
      `[Storage] Unknown STORAGE_PROVIDER "${explicit}" — ignoring. ` +
        "Set BLOB_READ_WRITE_TOKEN to use Vercel Blob, or leave STORAGE_PROVIDER unset."
    );
  }

  // Prefer Vercel Blob whenever its token is present (production), unless the
  // local filesystem is explicitly forced (dev). This also ignores any legacy
  // STORAGE_PROVIDER value (e.g. "cloudinary") that may still be set in Vercel.
  if (process.env.BLOB_READ_WRITE_TOKEN && explicit !== "local") {
    return new VercelBlobStorageProvider();
  }

  return new LocalStorageProvider();
}

interface ProviderRegistry {
  storage: IStorageProvider;
}

const providers: ProviderRegistry = {
  storage: createStorageProvider(),
};

export function getProvider<K extends keyof ProviderRegistry>(
  key: K
): ProviderRegistry[K] {
  return providers[key];
}

export function registerProvider<K extends keyof ProviderRegistry>(
  key: K,
  provider: ProviderRegistry[K]
): void {
  providers[key] = provider;
}

// Re-export types
export type { IStorageProvider, UploadOptions, StorageResult } from "./storage/storage.provider";
