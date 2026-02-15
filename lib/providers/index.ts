import type { IStorageProvider } from "./storage/storage.provider";
import type { IEmailProvider } from "./email/email.provider";
import { LocalStorageProvider } from "./storage/local.storage";
import { NoOpEmailProvider } from "./email/noop.email";

interface ProviderRegistry {
  storage: IStorageProvider;
  email: IEmailProvider;
}

const providers: ProviderRegistry = {
  storage: new LocalStorageProvider(),
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
