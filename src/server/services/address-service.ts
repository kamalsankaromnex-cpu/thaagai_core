import { z } from "zod";
import { db } from "@/lib/db";

export class AddressError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export const addressSchema = z.object({
  recipientName: z.string().trim().min(2, "Recipient name must be at least 2 characters").max(80),
  mobileNumber: z.string().transform(v => {
    const clean = v.replace(/[\s-]/g, "");
    if (clean.startsWith("+91")) return clean.slice(3);
    if (/^91[6-9]\d{9}$/.test(clean)) return clean.slice(2);
    return clean;
  }).pipe(z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number")),
  houseOrFlat: z.string().trim().min(1, "House or flat number is required").max(100),
  buildingName: z.string().trim().max(100).optional().nullable(),
  street: z.string().trim().min(2, "Street name is required").max(150),
  locality: z.string().trim().min(2, "Locality / Area is required").max(100),
  landmark: z.string().trim().max(100).optional().nullable(),
  pinCode: z.string().regex(/^[1-9]\d{5}$/, "Must be a valid 6-digit Indian PIN code"),
  postOffice: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().min(2, "City is required").max(60),
  district: z.string().trim().min(2, "District is required").max(60),
  state: z.string().trim().min(2, "State is required").max(60),
  country: z.string().trim().default("India"),
  addressType: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

/** Retrieve all saved addresses for a customer */
export async function getCustomerAddresses(customerId: string) {
  return db.customerAddress.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/** Create a new address for a customer */
export async function createAddress(customerId: string, rawInput: unknown) {
  const input = addressSchema.parse(rawInput);

  return db.$transaction(async (tx) => {
    // Check if customer has any addresses; if none, make this default
    const count = await tx.customerAddress.count({ where: { customerId } });
    const shouldBeDefault = input.isDefault || count === 0;

    if (shouldBeDefault) {
      await tx.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.customerAddress.create({
      data: {
        customerId,
        recipientName: input.recipientName,
        mobileNumber: input.mobileNumber,
        houseOrFlat: input.houseOrFlat,
        buildingName: input.buildingName || null,
        street: input.street,
        locality: input.locality,
        landmark: input.landmark || null,
        pinCode: input.pinCode,
        postOffice: input.postOffice || null,
        city: input.city,
        district: input.district,
        state: input.state,
        country: input.country || "India",
        addressType: input.addressType,
        isDefault: shouldBeDefault,
      },
    });
  });
}

/** Update an existing address with strict customer ownership check */
export async function updateAddress(customerId: string, addressId: string, rawInput: unknown) {
  const existing = await db.customerAddress.findUnique({
    where: { id: addressId },
  });

  if (!existing) {
    throw new AddressError("NOT_FOUND", "Address not found.", 404);
  }

  if (existing.customerId !== customerId) {
    throw new AddressError("UNAUTHORIZED", "You do not have permission to modify this address.", 403);
  }

  const input = addressSchema.partial().parse(rawInput);

  return db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.customerAddress.update({
      where: { id: addressId },
      data: {
        ...input,
        buildingName: input.buildingName ?? existing.buildingName,
        landmark: input.landmark ?? existing.landmark,
        postOffice: input.postOffice ?? existing.postOffice,
      },
    });
  });
}

/** Set an address as the default address */
export async function setDefaultAddress(customerId: string, addressId: string) {
  const existing = await db.customerAddress.findUnique({
    where: { id: addressId },
  });

  if (!existing) {
    throw new AddressError("NOT_FOUND", "Address not found.", 404);
  }

  if (existing.customerId !== customerId) {
    throw new AddressError("UNAUTHORIZED", "You do not have permission to modify this address.", 403);
  }

  return db.$transaction(async (tx) => {
    await tx.customerAddress.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });

    return tx.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });
}

/** Delete an address with strict customer ownership check */
export async function deleteAddress(customerId: string, addressId: string) {
  const existing = await db.customerAddress.findUnique({
    where: { id: addressId },
  });

  if (!existing) {
    throw new AddressError("NOT_FOUND", "Address not found.", 404);
  }

  if (existing.customerId !== customerId) {
    throw new AddressError("UNAUTHORIZED", "You do not have permission to delete this address.", 403);
  }

  await db.customerAddress.delete({
    where: { id: addressId },
  });

  // If deleted address was default, promote the newest remaining address to default
  if (existing.isDefault) {
    const nextAddress = await db.customerAddress.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
    if (nextAddress) {
      await db.customerAddress.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  return { success: true };
}

export {
  createAddress as createCustomerAddress,
  updateAddress as updateCustomerAddress,
  deleteAddress as deleteCustomerAddress,
  setDefaultAddress as setDefaultCustomerAddress,
};

