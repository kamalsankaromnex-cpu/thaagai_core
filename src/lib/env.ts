import "dotenv/config";
import { z } from "zod";
const schema = z.object({
  DATABASE_URL: z.string().url(),
  SITE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  WHATSAPP_BUSINESS_NUMBER: z.string().regex(/^\d{10,15}$/, "digits only, with country code"),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
});
let envData: z.infer<typeof schema>;

if (typeof window === "undefined") {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration. See .env.example.");
  }
  envData = parsed.data;
} else {
  envData = {
    DATABASE_URL: "",
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
    AUTH_SECRET: "",
    WHATSAPP_BUSINESS_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || "919876543210",
    STORAGE_DRIVER: "local",
  };
}

export const env = envData;

