"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  PlusCircle,
  PackageCheck,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Loader2,
  AlertCircle,
  IndianRupee,
  Boxes,
  ArrowRight,
} from "lucide-react";

interface POItem {
  id: string;
  variantId?: string | null;
  sku?: string | null;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: string | number;
  lineTotal: string | number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: "DRAFT" | "ORDERED" | "PARTIAL_RECEIVED" | "RECEIVED" | "CANCELLED";
  orderDate: string;
  expectedDate?: string | null;
  subtotal: string | number;
  totalAmount: string | number;
  notes?: string | null;
  supplier: { id: string; name: string; code: string };
  items: POItem[];
}

export default function AdminPurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [variants, setVariants] = useState<Array<{ id: string; sku: string; size: string; productName: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Create PO Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [poItems, setPoItems] = useState<
    Array<{ variantId: string; sku: string; productName: string; quantityOrdered: number; unitCost: number }>
  >([
    { variantId: "", sku: "", productName: "", quantityOrdered: 10, unitCost: 850 },
  ]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Receive Goods Modal State
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receiveInvoiceNumber, setReceiveInvoiceNumber] = useState("");
  const [receiveItems, setReceiveItems] = useState<
    Array<{ poItemId: string; variantId?: string | null; productName: string; quantityOrdered: number; previouslyReceived: number; quantityAccepted: number; unitCost: number }>
  >([]);
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const [poRes, supRes, invRes] = await Promise.all([
        fetch("/api/admin/purchases"),
        fetch("/api/admin/suppliers"),
        fetch("/api/admin/inventory"),
      ]);

      if (poRes.ok) {
        const poData = await poRes.json();
        setPurchaseOrders(poData.purchaseOrders || []);
      }
      if (supRes.ok) {
        const supData = await supRes.json();
        setSuppliers(supData.suppliers || []);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        const flattenedVariants: Array<{ id: string; sku: string; size: string; productName: string }> = [];
        (invData.products || []).forEach((prod: any) => {
          (prod.variants || []).forEach((v: any) => {
            flattenedVariants.push({
              id: v.id,
              sku: v.sku,
              size: v.size || "Free Size",
              productName: `${prod.name} (${v.size || "Free"})`,
            });
          });
        });
        setVariants(flattenedVariants);
      }
    } catch (err) {
      console.error("Failed to load purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleAddItemRow = () => {
    setPoItems((prev) => [
      ...prev,
      { variantId: "", sku: "", productName: "", quantityOrdered: 10, unitCost: 850 },
    ]);
  };

  const handleVariantSelect = (index: number, variantId: string) => {
    const v = variants.find((item) => item.id === variantId);
    setPoItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        variantId,
        sku: v?.sku || "",
        productName: v?.productName || "",
      };
      return copy;
    });
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!selectedSupplierId) {
      setCreateError("Please select a textile supplier.");
      return;
    }

    const validItems = poItems.filter((i) => i.productName.trim() && i.quantityOrdered > 0);
    if (validItems.length === 0) {
      setCreateError("Please specify at least one valid item with a name and quantity.");
      return;
    }

    try {
      setCreateSubmitting(true);
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          expectedDate: expectedDate || undefined,
          notes: poNotes.trim() || undefined,
          items: validItems,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setCreateError(json.error || "Failed to create purchase order");
        return;
      }

      setIsCreateModalOpen(false);
      fetchPurchases();
    } catch (err) {
      console.error("Error creating PO:", err);
      setCreateError("A network error occurred.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setReceiveInvoiceNumber("");
    setReceiveError(null);
    setReceiveItems(
      po.items.map((i) => {
        const remaining = Math.max(0, i.quantityOrdered - i.quantityReceived);
        return {
          poItemId: i.id,
          variantId: i.variantId,
          productName: i.productName,
          quantityOrdered: i.quantityOrdered,
          previouslyReceived: i.quantityReceived,
          quantityAccepted: remaining,
          unitCost: Number(i.unitCost),
        };
      })
    );
  };

  const handleProcessReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPO) return;
    setReceiveError(null);

    const itemsToReceive = receiveItems.filter((i) => i.quantityAccepted > 0);
    if (itemsToReceive.length === 0) {
      setReceiveError("Please specify at least one accepted item quantity greater than 0.");
      return;
    }

    try {
      setReceiveSubmitting(true);
      const res = await fetch(`/api/admin/purchases/${receivingPO.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: receiveInvoiceNumber.trim() || undefined,
          items: itemsToReceive.map((i) => ({
            poItemId: i.poItemId,
            variantId: i.variantId || undefined,
            quantityAccepted: i.quantityAccepted,
            unitCost: i.unitCost,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setReceiveError(json.error || "Failed to process receipt");
        return;
      }

      setReceivingPO(null);
      fetchPurchases();
    } catch (err) {
      console.error("Error receiving goods:", err);
      setReceiveError("A network error occurred.");
    } finally {
      setReceiveSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Purchase Orders & Receiving
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Create procurement POs for cotton weavers, accept goods receipts, restock size variants, and track supplier payables.
          </p>
        </div>

        <button
          onClick={() => {
            if (suppliers.length > 0 && !selectedSupplierId) {
              setSelectedSupplierId(suppliers[0].id);
            }
            setIsCreateModalOpen(true);
          }}
          className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-thaagai-wineHover"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* PO List Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-thaagai-wine" />
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-thaagai-ink/30 dark:text-thaagai-inkDark/30" />
            <h3 className="mt-3 text-sm font-bold text-thaagai-ink dark:text-white">
              No purchase orders yet
            </h3>
            <p className="mt-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Create a purchase order to stock raw fabrics, packaging, or stitched Churidar sets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-thaagai-line/80 bg-thaagai-sand/30 font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/60">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Items & Quantities</th>
                  <th className="px-4 py-3 text-right">Order Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-thaagai-line/50 dark:divide-thaagai-line/30">
                {purchaseOrders.map((po) => {
                  const totalOrdered = po.items.reduce((s, i) => s + i.quantityOrdered, 0);
                  const totalReceived = po.items.reduce((s, i) => s + i.quantityReceived, 0);

                  return (
                    <tr
                      key={po.id}
                      className="transition-colors hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/10"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="font-mono font-bold text-thaagai-wine dark:text-thaagai-gold">
                          {po.poNumber}
                        </span>
                        <div className="text-[10px] text-thaagai-ink/50">
                          {new Date(po.orderDate).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-thaagai-ink dark:text-white">
                          {po.supplier.name}
                        </p>
                        <span className="font-mono text-[10px] text-thaagai-ink/50">
                          {po.supplier.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-thaagai-ink/80 dark:text-white/80">
                          {po.items.map((i) => `${i.productName} (${i.quantityReceived}/${i.quantityOrdered})`).join(", ")}
                        </p>
                        <div className="mt-1 text-[11px] font-semibold text-thaagai-gold">
                          Fulfilled: {totalReceived} / {totalOrdered} pcs
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-bold text-thaagai-ink dark:text-white">
                        ₹{Number(po.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            po.status === "RECEIVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : po.status === "PARTIAL_RECEIVED"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                          }`}
                        >
                          {po.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        {po.status !== "RECEIVED" && po.status !== "CANCELLED" ? (
                          <button
                            onClick={() => openReceiveModal(po)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-thaagai-line bg-white px-3 py-1.5 text-xs font-semibold text-thaagai-wine hover:border-thaagai-wine hover:bg-thaagai-sand/40 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-thaagai-gold"
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                            <span>Receive Goods</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            Fully Received
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create PO */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                Create Purchase Order
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="mt-4 space-y-4 text-xs">
              {createError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Textile Supplier *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 border-t border-thaagai-line/60 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                    Line Items & Variants
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-thaagai-wine hover:underline dark:text-thaagai-gold"
                  >
                    + Add Another Item
                  </button>
                </div>

                {poItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 rounded-lg border border-thaagai-line/60 bg-thaagai-sand/20 p-2.5 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20"
                  >
                    <div className="col-span-6">
                      <label className="block text-[10px] font-semibold text-thaagai-ink/60">
                        Link Existing Variant or Enter Name
                      </label>
                      <select
                        value={item.variantId || ""}
                        onChange={(e) => handleVariantSelect(index, e.target.value)}
                        className="mt-1 h-9 w-full rounded-md border border-thaagai-line bg-white px-2 text-[11px] text-thaagai-ink outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                      >
                        <option value="">-- Custom / Fabric Roll --</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.productName} ({v.sku})
                          </option>
                        ))}
                      </select>
                      {!item.variantId && (
                        <input
                          type="text"
                          placeholder="e.g. Pure Georgette Fabric 50m"
                          value={item.productName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPoItems((prev) => {
                              const copy = [...prev];
                              copy[index].productName = val;
                              return copy;
                            });
                          }}
                          className="mt-1.5 h-8 w-full rounded border border-thaagai-line bg-white px-2 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                        />
                      )}
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-thaagai-ink/60">
                        Qty Ordered
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantityOrdered}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setPoItems((prev) => {
                            const copy = [...prev];
                            copy[index].quantityOrdered = val;
                            return copy;
                          });
                        }}
                        className="mt-1 h-9 w-full rounded-md border border-thaagai-line bg-white px-2 text-xs font-bold text-thaagai-ink outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-thaagai-ink/60">
                        Unit Cost (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPoItems((prev) => {
                            const copy = [...prev];
                            copy[index].unitCost = val;
                            return copy;
                          });
                        }}
                        className="mt-1 h-9 w-full rounded-md border border-thaagai-line bg-white px-2 text-xs font-bold text-thaagai-ink outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Notes & Special Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Urgent festive dispatch by Friday via Tiruppur Express"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-thaagai-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {createSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Issue Purchase Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Goods */}
      {receivingPO && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <div>
                <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                  Goods Receipt ({receivingPO.poNumber})
                </h3>
                <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                  Supplier: {receivingPO.supplier.name}
                </p>
              </div>
              <button
                onClick={() => setReceivingPO(null)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReceipt} className="mt-4 space-y-4 text-xs">
              {receiveError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{receiveError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Supplier Invoice / Delivery Challan No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-991"
                  value={receiveInvoiceNumber}
                  onChange={(e) => setReceiveInvoiceNumber(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              {/* Items to Receive */}
              <div className="space-y-3 border-t border-thaagai-line/60 pt-3">
                <h4 className="font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                  Enter Accepted Pieces
                </h4>

                {receiveItems.map((item, idx) => (
                  <div
                    key={item.poItemId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-thaagai-line/60 bg-thaagai-sand/20 p-3 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-thaagai-ink dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-thaagai-ink/60">
                        Ordered: {item.quantityOrdered} · Received so far: {item.previouslyReceived}
                      </p>
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] font-semibold text-thaagai-ink/60">
                        Accept Now
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantityOrdered - item.previouslyReceived}
                        value={item.quantityAccepted}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setReceiveItems((prev) => {
                            const copy = [...prev];
                            copy[idx].quantityAccepted = val;
                            return copy;
                          });
                        }}
                        className="mt-1 h-9 w-full rounded border border-thaagai-line bg-white px-2 text-center text-xs font-bold text-thaagai-ink outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-emerald-50 p-3 text-[11px] text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 inline mr-1 text-emerald-600" />
                Accepted items will automatically increment inventory variants and create an expense record in Finance.
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-thaagai-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => setReceivingPO(null)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receiveSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
                >
                  {receiveSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Goods Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
