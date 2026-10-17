import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      DATABASE_URL: "postgresql://thaagai:change-me-local-only@localhost:5432/thaagai",
      SITE_URL: "http://localhost:3000",
      AUTH_SECRET: "test-auth-secret-needs-to-be-at-least-32-chars-long",
      WHATSAPP_BUSINESS_NUMBER: "919876543210",
      ADMIN_EMAIL: "owner@example.com",
      ADMIN_PASSWORD: "choose-a-strong-password-for-first-setup",
      STORAGE_DRIVER: "local",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
