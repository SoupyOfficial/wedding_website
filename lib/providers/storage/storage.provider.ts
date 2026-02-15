export interface IStorageProvider {
  upload(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<StorageResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  list(prefix?: string): Promise<StorageResult[]>;
}

export interface UploadOptions {
  contentType?: string;
  category?: string;
  maxWidth?: number;
}

export interface StorageResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}
