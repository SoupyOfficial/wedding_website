import type { IStorageProvider } from "./storage/storage.provider";
import type { IEmailProvider } from "./email/email.provider";
import { LocalStorageProvider } from "./storage/local.storage";
import { CloudinaryStorageProvider } from "./storage/cloudinary.storage";
import { NoOpEmailProvider } from "./email/noop.email";

function createStorageProvider(): IStorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";
  switch (provider) {
    case "cloudinary":
      return new CloudinaryStorageProvider();
    default:
      return new LocalStorageProvider();
  }
}

interface ProviderRegistry {
  storage: IStorageProvider;
  email: IEmailProvider;
}

const providers: ProviderRegistry = {
  storage: createStorageProvider(),
  email: new NoOpEmailProvider(),
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
export type { IEmailProvider, EmailSendOptions, EmailSendResult } from "./email/email.provider";
