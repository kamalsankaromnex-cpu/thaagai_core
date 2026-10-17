import { db } from "@/lib/db";

export type FabricPlacementMode = "ALL_OVER_REPEAT" | "BORDER_HEM";
export type FabricTypeCategory = "COTTON" | "RAW_SILK" | "CHANDERI" | "MULMUL";

export interface CustomFabric {
  id: string;
  fabricId: string; // e.g. FAB-CHET-01
  name: string;
  fabricType: FabricTypeCategory;
  placementMode: FabricPlacementMode;
  description?: string;
  
  // Visual asset URLs
  originalPhoto: string; // Photo of roll / swatch
  textureUrl: string;    // Calibrated 3D map
  bumpMapUrl?: string;

  // Real-world physical dimensions in Centimetres
  repeatWidthCm: number;
  repeatHeightCm: number;
  borderHeightCm?: number;

  // Material Physical Properties
  roughness: number; // 0.0 - 1.0 (Cotton: 0.85, Silk: 0.38)
  metalness: number; // 0.0 - 1.0 (Zari accents)

  // Costing & Inventory
  pricePerMeter: number;
  stockMeters: number;
  status: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";

  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_FABRICS: CustomFabric[] = [
  {
    id: "fab_chet_01",
    fabricId: "FAB-CHET-01",
    name: "Chettinad Cotton Maroon Butta",
    fabricType: "COTTON",
    placementMode: "ALL_OVER_REPEAT",
    description: "Authentic Chettinad handloom weave in deep madder maroon with intricate 4-petal gold zari buttas.",
    originalPhoto: "/fabrics/chettinad-maroon-butta.svg",
    textureUrl: "/fabrics/chettinad-maroon-butta.svg",
    bumpMapUrl: "/fabrics/cloth-bump.svg",
    repeatWidthCm: 12,
    repeatHeightCm: 12,
    roughness: 0.88,
    metalness: 0.0,
    pricePerMeter: 380,
    stockMeters: 45,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "fab_sun_02",
    fabricId: "FAB-SUN-02",
    name: "Madurai Sungudi Indigo with Temple Border",
    fabricType: "COTTON",
    placementMode: "BORDER_HEM",
    description: "Traditional Madurai Sungudi tie-dye dots in royal peacock blue with auspicious Kalyana Gopuram temple zari hem border.",
    originalPhoto: "/fabrics/madurai-sungudi-blue.svg",
    textureUrl: "/fabrics/madurai-sungudi-blue.svg",
    bumpMapUrl: "/fabrics/cloth-bump.svg",
    repeatWidthCm: 16,
    repeatHeightCm: 16,
    borderHeightCm: 10,
    roughness: 0.82,
    metalness: 0.0,
    pricePerMeter: 420,
    stockMeters: 38,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "fab_slk_03",
    fabricId: "FAB-SLK-03",
    name: "Festive Peacock Teal Kanchipuram Raw Silk",
    fabricType: "RAW_SILK",
    placementMode: "ALL_OVER_REPEAT",
    description: "Pure South Indian raw silk with subtle natural slubs and micro zari star highlights. Drapes with an elegant sheen.",
    originalPhoto: "/fabrics/kanchipuram-peacock-silk.svg",
    textureUrl: "/fabrics/kanchipuram-peacock-silk.svg",
    bumpMapUrl: "/fabrics/cloth-bump.svg",
    repeatWidthCm: 20,
    repeatHeightCm: 20,
    roughness: 0.38,
    metalness: 0.08,
    pricePerMeter: 750,
    stockMeters: 28,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
];

const FABRIC_STORE_KEY = "custom_3d_fabrics";

export async function getAllFabrics(): Promise<CustomFabric[]> {
  try {
    const record = await db.storeSetting.findUnique({
      where: { key: FABRIC_STORE_KEY },
    });

    if (!record || !Array.isArray(record.value) || record.value.length === 0) {
      // Auto-initialize with initial 3 sample fabrics
      await db.storeSetting.upsert({
        where: { key: FABRIC_STORE_KEY },
        create: { key: FABRIC_STORE_KEY, value: INITIAL_FABRICS as any },
        update: { value: INITIAL_FABRICS as any },
      });
      return INITIAL_FABRICS;
    }

    return record.value as unknown as CustomFabric[];
  } catch (err) {
    console.error("Error loading fabrics from StoreSetting:", err);
    return INITIAL_FABRICS;
  }
}

export async function getFabricById(fabricIdOrId: string): Promise<CustomFabric | null> {
  const all = await getAllFabrics();
  return (
    all.find((f) => f.id === fabricIdOrId || f.fabricId.toLowerCase() === fabricIdOrId.toLowerCase()) || null
  );
}

export async function upsertFabric(fabricData: Partial<CustomFabric> & { fabricId: string; name: string }): Promise<CustomFabric> {
  const all = await getAllFabrics();
  const existingIdx = all.findIndex(
    (f) => f.fabricId.toLowerCase() === fabricData.fabricId.toLowerCase() || (fabricData.id && f.id === fabricData.id)
  );

  const now = new Date().toISOString();
  let updatedFabric: CustomFabric;

  if (existingIdx >= 0) {
    updatedFabric = {
      ...all[existingIdx],
      ...fabricData,
      updatedAt: now,
    };
    all[existingIdx] = updatedFabric;
  } else {
    updatedFabric = {
      id: fabricData.id || `fab_${Date.now()}`,
      fabricId: fabricData.fabricId.toUpperCase().trim(),
      name: fabricData.name.trim(),
      fabricType: fabricData.fabricType || "COTTON",
      placementMode: fabricData.placementMode || "ALL_OVER_REPEAT",
      description: fabricData.description || "",
      originalPhoto: fabricData.originalPhoto || "/fabrics/chettinad-maroon-butta.svg",
      textureUrl: fabricData.textureUrl || "/fabrics/chettinad-maroon-butta.svg",
      bumpMapUrl: fabricData.bumpMapUrl || "/fabrics/cloth-bump.svg",
      repeatWidthCm: Number(fabricData.repeatWidthCm) || 15,
      repeatHeightCm: Number(fabricData.repeatHeightCm) || 15,
      borderHeightCm: fabricData.borderHeightCm ? Number(fabricData.borderHeightCm) : undefined,
      roughness: Number(fabricData.roughness) || 0.85,
      metalness: Number(fabricData.metalness) || 0.0,
      pricePerMeter: Number(fabricData.pricePerMeter) || 350,
      stockMeters: Number(fabricData.stockMeters) || 20,
      status: fabricData.status || "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(updatedFabric);
  }

  await db.storeSetting.upsert({
    where: { key: FABRIC_STORE_KEY },
    create: { key: FABRIC_STORE_KEY, value: all as any },
    update: { value: all as any },
  });

  return updatedFabric;
}

export async function deleteFabric(fabricIdOrId: string): Promise<boolean> {
  const all = await getAllFabrics();
  const filtered = all.filter(
    (f) => f.id !== fabricIdOrId && f.fabricId.toLowerCase() !== fabricIdOrId.toLowerCase()
  );

  if (filtered.length === all.length) return false;

  await db.storeSetting.upsert({
    where: { key: FABRIC_STORE_KEY },
    create: { key: FABRIC_STORE_KEY, value: filtered as any },
    update: { value: filtered as any },
  });

  return true;
}
