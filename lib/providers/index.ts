import type { IStorageProvider } from "./storage/storage.provider";
import { LocalStorageProvider } from "./storage/local.storage";
import { VercelBlobStorageProvider } from "./storage/vercel-blob.storage";

function createStorageProvider(): IStorageProvider {
  // Explicit override, or auto-select Vercel Blob when its token is present
  // (production), otherwise fall back to the local filesystem (dev).
  const provider =
    process.env.STORAGE_PROVIDER ||
    (process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "local");

  switch (provider) {
    case "vercel-blob":
      return new VercelBlobStorageProvider();
    default:
      return new LocalStorageProvider();
  }
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
