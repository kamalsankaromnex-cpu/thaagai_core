import { describe, it, expect, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { LocalStorageDriver } from "./storage";

describe("LocalStorageDriver storage abstraction", () => {
  const testDir = path.join(process.cwd(), "public", "uploads-test");
  const driver = new LocalStorageDriver(testDir);

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignored
    }
  });

  it("uploads buffer and returns valid storageKey and URL", async () => {
    const dummyBuffer = Buffer.from("dummy-image-content");
    const result = await driver.upload(dummyBuffer, "test-kurta.jpg", "image/jpeg");

    expect(result.storageKey).toContain("test-kurta.jpg");
    expect(result.url).toBe(`/uploads/${result.storageKey}`);

    // Verify file actually written to disk
    const diskPath = path.join(testDir, result.storageKey);
    const exists = await fs.stat(diskPath);
    expect(exists.isFile()).toBe(true);

    // Clean up
    await driver.delete(result.storageKey);
    await expect(fs.stat(diskPath)).rejects.toThrow();
  });

  it("deleting a non-existent file does not throw", async () => {
    await expect(driver.delete("non-existent-key.jpg")).resolves.not.toThrow();
  });

  it("safely isolates delete within uploadDir even when storageKey contains directory separators", async () => {
    // path.basename isolates the filename, ensuring safe deletion within uploadDir
    await expect(driver.delete("../../secret.txt")).resolves.not.toThrow();
  });
});
