"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  Building,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  RotateCw,
  ArrowLeft,
  X,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

interface Address {
  id: string;
  recipientName: string;
  mobileNumber: string;
  houseOrFlat: string;
  buildingName?: string | null;
  street: string;
  locality: string;
  landmark?: string | null;
  pinCode: string;
  postOffice?: string | null;
  city: string;
  district: string;
  state: string;
  country: string;
  addressType: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states
  const [recipientName, setRecipientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [houseOrFlat, setHouseOrFlat] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [street, setStreet] = useState("");
  const [locality, setLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [addressType, setAddressType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);

  // Postal lookup states
  const [postOffices, setPostOffices] = useState<string[]>([]);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinLookupMsg, setPinLookupMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers/me/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account/addresses");
      return;
    }
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isLoading, isAuthenticated, router, fetchAddresses]);

  // Debounced Postal PIN Code Lookup
  useEffect(() => {
    const cleanPin = pinCode.trim();
    if (!/^[1-9]\d{5}$/.test(cleanPin)) {
      setPostOffices([]);
      setPinLookupMsg(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setPinLookupLoading(true);
      setPinLookupMsg(null);
      try {
        const res = await fetch(`/api/postal-codes/${cleanPin}`);
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.valid) {
          setState(data.state || "");
          setDistrict(data.district || "");
          setCity(data.city || data.district || "");
          const poList: string[] = data.postOffices || [];
          setPostOffices(poList);
          if (poList.length > 0 && !locality) {
            setLocality(poList[0]);
          }
          setPinLookupMsg(`Detected: ${data.district}, ${data.state}`);
        } else {
          setPinLookupMsg(data.error || "Postal service not reachable. Please enter city & state manually.");
        }
      } catch (err) {
        if (isMounted) {
          setPinLookupMsg("Could not verify PIN code. You may type city and state manually.");
        }
      } finally {
        if (isMounted) setPinLookupLoading(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pinCode, locality]);

  const openAddModal = () => {
    setEditingAddress(null);
    setRecipientName(customer?.fullName || "");
    setMobileNumber(customer?.mobileNumber || "");
    setPinCode("");
    setHouseOrFlat("");
    setBuildingName("");
    setStreet("");
    setLocality("");
    setLandmark("");
    setCity("");
    setDistrict("");
    setState("");
    setAddressType("HOME");
    setIsDefault(addresses.length === 0);
    setPostOffices([]);
    setPinLookupMsg(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setRecipientName(addr.recipientName);
    setMobileNumber(addr.mobileNumber);
    setPinCode(addr.pinCode);
    setHouseOrFlat(addr.houseOrFlat);
    setBuildingName(addr.buildingName || "");
    setStreet(addr.street);
    setLocality(addr.locality);
    setLandmark(addr.landmark || "");
    setCity(addr.city);
    setDistrict(addr.district);
    setState(addr.state);
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setPostOffices([]);
    setPinLookupMsg(null);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!recipientName.trim() || recipientName.trim().length < 2) {
      setFormError("Please enter recipient name (at least 2 characters).");
      return;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setFormError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    const cleanPin = pinCode.trim();
    if (!/^[1-9]\d{5}$/.test(cleanPin)) {
      setFormError("Please enter a valid 6-digit Indian postal PIN code.");
      return;
    }
    if (!houseOrFlat.trim()) {
      setFormError("Please enter flat, house no, or building name.");
      return;
    }
    if (!street.trim()) {
      setFormError("Please enter street, road, or area name.");
      return;
    }
    if (!city.trim()) {
      setFormError("Please enter city or town.");
      return;
    }
    if (!state.trim()) {
      setFormError("Please select or enter state.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        recipientName: recipientName.trim(),
        mobileNumber: cleanMobile,
        houseOrFlat: houseOrFlat.trim(),
        buildingName: buildingName.trim() || null,
        street: street.trim(),
        locality: locality.trim() || city.trim(),
        landmark: landmark.trim() || null,
        pinCode: cleanPin,
        city: city.trim(),
        district: district.trim() || city.trim(),
        state: state.trim(),
        country: "India",
        addressType,
        isDefault,
      };

      const url = editingAddress
        ? `/api/customers/me/addresses/${editingAddress.id}`
        : "/api/customers/me/addresses";
      const method = editingAddress ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save address.");
      }

      setModalOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/customers/me/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error("Delete address error:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/me/addresses/${id}/default`, { method: "PATCH" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error("Set default address error:", err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <RotateCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
        <p className="mt-2 text-xs text-thaagai-ink/60">Loading saved addresses...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-thaagai-line/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Account
            </Link>
          </div>
          <h1 className="mt-2 font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            Saved Addresses
          </h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Manage your delivery address book for instant checkout
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-thaagai-line p-12 text-center dark:border-thaagai-line/40">
          <div className="rounded-full bg-thaagai-sand/60 p-4 text-thaagai-wine dark:bg-thaagai-sandDark/40">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-base font-bold text-thaagai-ink dark:text-white">
            No Addresses Saved Yet
          </h2>
          <p className="mt-1 max-w-sm text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Save your home or work address with instant PIN code autofill to speed up WhatsApp checkout.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 flex h-11 min-h-[44px] items-center gap-2 rounded-lg bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Address</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {addresses.map((addr) => {
            const TypeIcon = addr.addressType === "HOME" ? Home : addr.addressType === "WORK" ? Briefcase : Building;

            return (
              <div
                key={addr.id}
                className={`relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all ${
                  addr.isDefault
                    ? "border-thaagai-wine/70 bg-thaagai-sand/10 dark:border-thaagai-wine/50 dark:bg-thaagai-cardDark"
                    : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TypeIcon className="h-3.5 w-3.5 text-thaagai-gold" />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-thaagai-gold">
                        {addr.addressType}
                      </span>
                    </div>

                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded bg-thaagai-wine px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                        <Check className="h-2.5 w-2.5" /> Default
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-thaagai-ink dark:text-white">
                    {addr.recipientName}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                    +91 {addr.mobileNumber}
                  </p>

                  <div className="mt-2.5 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    <p>{addr.houseOrFlat}{addr.buildingName ? `, ${addr.buildingName}` : ""}</p>
                    <p>{addr.street}</p>
                    <p>{addr.locality}</p>
                    <p>{addr.city}, {addr.state} - <strong className="font-semibold text-thaagai-ink dark:text-white">{addr.pinCode}</strong></p>
                    {addr.landmark && <p className="text-[11px] italic text-thaagai-ink/50">Landmark: {addr.landmark}</p>}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-thaagai-line/60 pt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="flex items-center gap-1 text-xs font-semibold text-thaagai-ink hover:text-thaagai-wine dark:text-thaagai-inkDark"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-semibold text-thaagai-wine hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-thaagai-line bg-white p-6 shadow-xl dark:border-thaagai-line/40 dark:bg-thaagai-cardDark sm:p-8">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-4">
              <h2 className="text-lg font-bold text-thaagai-wine">
                {editingAddress ? "Edit Saved Address" : "Add New Delivery Address"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full text-thaagai-ink/60 hover:text-thaagai-ink dark:text-thaagai-inkDark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="mt-5 space-y-4">
              {/* Recipient & Mobile */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Kavitha Raman"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Contact Mobile Number *
                  </label>
                  <div className="mt-1 flex rounded-lg border border-thaagai-line bg-white dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
                    <span className="inline-flex h-11 items-center border-r border-thaagai-line px-2.5 text-xs font-medium text-thaagai-ink/70 dark:border-thaagai-line/40 dark:text-thaagai-inkDark/70">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="h-11 w-full bg-transparent px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:outline-none dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>
              </div>

              {/* PIN Code Lookup */}
              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                  6-Digit Indian PIN Code *
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 600017"
                    className="h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs font-semibold text-thaagai-ink placeholder:font-normal placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                  {pinLookupLoading && (
                    <div className="absolute right-3 top-3">
                      <RotateCw className="h-4 w-4 animate-spin text-thaagai-wine" />
                    </div>
                  )}
                </div>
                {pinLookupMsg && (
                  <p className="mt-1 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {pinLookupMsg}
                  </p>
                )}
              </div>

              {/* House / Flat & Building */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Flat / House / Door No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseOrFlat}
                    onChange={(e) => setHouseOrFlat(e.target.value)}
                    placeholder="e.g. Flat 302, Door No. 14"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Building / Apartment Name
                  </label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="e.g. Sri Krishna Apartments"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              {/* Street */}
              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                  Street / Road / Main *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 74 Gandhi Road"
                  className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              {/* Locality (Select or Type) */}
              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                  Locality / Area / Post Office *
                </label>
                {postOffices.length > 0 ? (
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  >
                    {postOffices.map((po) => (
                      <option key={po} value={po}>
                        {po}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. T. Nagar"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                )}
              </div>

              {/* Landmark, City & State */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Panagal Park"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              {/* Address Type & Default */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Address Type
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    {(["HOME", "WORK", "OTHER"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`h-9 rounded-md px-3 text-xs font-semibold transition-colors ${
                          addressType === type
                            ? "bg-thaagai-wine text-white"
                            : "border border-thaagai-line bg-white text-thaagai-ink hover:bg-thaagai-sand/30 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                  />
                  <label htmlFor="isDefault" className="text-xs font-medium text-thaagai-ink dark:text-white">
                    Set as default delivery address
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-thaagai-line/60 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex h-11 min-h-[44px] items-center rounded-lg border border-thaagai-line bg-white px-4 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/30 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 min-h-[44px] items-center rounded-lg bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
