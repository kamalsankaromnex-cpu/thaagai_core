import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface UploadResult {
  storageKey: string;
  url: string;
}

export interface StorageDriver {
  upload(buffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getUrl(storageKey: string): string;
}

export class LocalStorageDriver implements StorageDriver {
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.join(process.cwd(), "public", "uploads");
  }

  private async ensureDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(buffer: Buffer, originalFilename: string, _mimeType: string): Promise<UploadResult> {
    await this.ensureDir();
    const ext = path.extname(originalFilename).toLowerCase() || ".jpg";
    const safeBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const storageKey = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.writeFile(filePath, buffer);

    return {
      storageKey,
      url: `/uploads/${storageKey}`,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const safeKey = path.basename(storageKey);
    const resolvedDir = path.resolve(this.uploadDir);
    const resolvedPath = path.resolve(resolvedDir, safeKey);
    if (!resolvedPath.startsWith(resolvedDir)) {
      throw new Error("Invalid storage key path traversal");
    }
    try {
      await fs.unlink(resolvedPath);
    } catch {
      // Ignored if already removed
    }
  }

  getUrl(storageKey: string): string {
    return `/uploads/${storageKey}`;
  }
}

// Pluggable factory based on environment configuration
export function getStorageDriver(): StorageDriver {
  const driverType = process.env.STORAGE_DRIVER || "local";

  if (driverType === "local") {
    return new LocalStorageDriver();
  }

  // Fallback to local driver if S3 is not configured
  return new LocalStorageDriver();
}
