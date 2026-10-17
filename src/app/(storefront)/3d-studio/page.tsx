import { Metadata } from "next";
import { KurtiStudioCustomizer } from "@/components/studio/kurti-studio-customizer";
import { getAllFabrics } from "@/server/services/fabric-service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "3D Fabric Atelier | Customize Real-Time Handloom Churidars & Kurtis | THAAGAI",
  description:
    "Explore Thaagai's physical handloom fabric inventory draped live in 3D. Customize necklines, sleeves, and measurements with instant tailor order manifests.",
  openGraph: {
    title: "3D Fabric Atelier | THAAGAI",
    description: "Real-time 3D Kurti customizer mapped with genuine Chennai handloom fabrics.",
  },
};

export default async function ThreeDStudioPage() {
  const [fabrics, settingsRecord] = await Promise.all([
    getAllFabrics(),
    db.storeSetting.findUnique({
      where: { key: "store_profile" },
    }),
  ]);

  const activeFabrics = fabrics.filter((f) => f.status === "ACTIVE");
  const storeProfile = settingsRecord?.value as any;

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-stone-900">
      <KurtiStudioCustomizer
        initialFabrics={activeFabrics}
        whatsappNumber={storeProfile?.supportPhone}
      />
    </div>
  );
}
