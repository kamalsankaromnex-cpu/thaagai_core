"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/context/customer-auth-context";
import {
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  Plus,
  Home,
  Briefcase,
  Building,
  RotateCw,
  User,
} from "lucide-react";

interface SavedAddress {
  id: string;
  recipientName: string;
  mobileNumber: string;
  houseOrFlat: string;
  buildingName?: string | null;
  street: string;
  locality: string;
  landmark?: string | null;
  pinCode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  addressType: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "NEW">("NEW");
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Address Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [houseOrFlat, setHouseOrFlat] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [street, setStreet] = useState("");
  const [locality, setLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [addressType, setAddressType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [saveToProfile, setSaveToProfile] = useState(false);

  // PIN lookup
  const [postOffices, setPostOffices] = useState<string[]>([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  // General checkout state
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch customer's saved addresses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setAddressesLoading(true);
      fetch("/api/customers/me/addresses")
        .then((r) => (r.ok ? r.json() : { addresses: [] }))
        .then((data) => {
          const list: SavedAddress[] = data.addresses || [];
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else {
            setSelectedAddressId("NEW");
          }
        })
        .catch(console.error)
        .finally(() => setAddressesLoading(false));

      if (customer) {
        if (customer.fullName && !customerName) setCustomerName(customer.fullName);
        if (customer.mobileNumber && !customerPhone) setCustomerPhone(customer.mobileNumber);
      }
    } else {
      setSelectedAddressId("NEW");
    }
  }, [isAuthenticated, customer]);

  // Debounced 6-digit PIN code lookup
  useEffect(() => {
    if (selectedAddressId !== "NEW") return;
    const cleanPin = pinCode.trim();
    if (!/^[1-9]\d{5}$/.test(cleanPin)) {
      setPostOffices([]);
      setPinMsg(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setPinLoading(true);
      setPinMsg(null);
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
          setPinMsg(`Autofilled: ${data.district}, ${data.state}`);
        } else {
          setPinMsg(data.error || "Postal service not reachable. Please enter city & state manually.");
        }
      } catch {
        if (isMounted) {
          setPinMsg("Could not verify PIN code. You may type city and state manually.");
        }
      } finally {
        if (isMounted) setPinLoading(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pinCode, locality, selectedAddressId]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
            <ShoppingBag className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mt-6 font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
          Your Shopping Bag is Empty
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          Please add at least one piece to your bag before checking out.
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
          >
            <span>Browse Collection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError("Please confirm consent to receive your order verification on WhatsApp.");
      return;
    }

    if (selectedAddressId === "NEW") {
      if (!customerName.trim() || customerName.trim().length < 2) {
        setError("Please enter a valid recipient full name (at least 2 characters).");
        return;
      }
      const cleanPhone = customerPhone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError("Please enter a valid 10-digit Indian WhatsApp mobile number starting with 6, 7, 8, or 9.");
        return;
      }
      const cleanPin = pinCode.trim();
      if (!/^[1-9]\d{5}$/.test(cleanPin)) {
        setError("Please enter a valid 6-digit Indian postal PIN code.");
        return;
      }
      if (!houseOrFlat.trim()) {
        setError("Please enter Flat / House No. / Floor / Building details.");
        return;
      }
      if (!street.trim()) {
        setError("Please enter Street, Road, or Area name.");
        return;
      }
      if (!city.trim()) {
        setError("Please enter City or Town.");
        return;
      }
      if (!state.trim()) {
        setError("Please select or enter State.");
        return;
      }
    }

    setLoading(true);

    try {
      let finalName = customerName.trim();
      let finalPhone = customerPhone.replace(/\D/g, "");
      let finalAddress = `${houseOrFlat.trim()}${buildingName.trim() ? `, ${buildingName.trim()}` : ""}, ${street.trim()}, ${locality.trim() || city.trim()}`;
      let finalCity = city.trim();
      let finalState = state.trim();
      let finalPin = pinCode.trim();
      let deliverySnapshot: any = {
        recipientName: finalName,
        mobileNumber: finalPhone,
        houseOrFlat: houseOrFlat.trim(),
        buildingName: buildingName.trim() || null,
        street: street.trim(),
        locality: locality.trim() || finalCity,
        landmark: landmark.trim() || null,
        pinCode: finalPin,
        city: finalCity,
        district: district.trim() || finalCity,
        state: finalState,
        country: "India",
        addressType,
      };

      if (selectedAddressId !== "NEW") {
        const found = savedAddresses.find((a) => a.id === selectedAddressId);
        if (found) {
          finalName = found.recipientName;
          finalPhone = found.mobileNumber;
          finalAddress = `${found.houseOrFlat}${found.buildingName ? `, ${found.buildingName}` : ""}, ${found.street}, ${found.locality}`;
          finalCity = found.city;
          finalState = found.state;
          finalPin = found.pinCode;
          deliverySnapshot = { ...found };
        }
      } else if (isAuthenticated && saveToProfile) {
        fetch("/api/customers/me/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientName: finalName,
            mobileNumber: finalPhone,
            houseOrFlat,
            buildingName: buildingName || null,
            street,
            locality: locality || finalCity,
            landmark: landmark || null,
            pinCode: finalPin,
            city: finalCity,
            district: district || finalCity,
            state: finalState,
            country: "India",
            addressType,
            isDefault: savedAddresses.length === 0,
          }),
        }).catch(console.error);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: finalName,
          customerPhone: finalPhone,
          address: finalAddress,
          city: finalCity,
          state: finalState,
          pinCode: finalPin,
          deliverySnapshot,
          consent: true,
          honeypot,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            customizations: i.customizations,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not submit order request. Please review your details.");
        setLoading(false);
        return;
      }

      // Order created successfully
      clearCart();
      router.push(`/order-success/${data.reference}?wa=${encodeURIComponent(data.whatsappUrl)}`);
    } catch {
      setError("A network error occurred. Please verify your internet connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 border-b border-thaagai-line/60 pb-4">
        <h1 className="font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
          Order Request & Delivery
        </h1>
        <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          No advance payment required. We will confirm piece availability, sizing, and shipping directly on WhatsApp.
        </p>
      </div>

      {/* Guest Login Promotion Banner */}
      {!isAuthenticated && (
        <div className="mb-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-thaagai-line/70 bg-thaagai-sand/30 p-4 sm:flex-row sm:items-center dark:bg-thaagai-sandDark/20">
          <div className="flex items-center gap-2.5 text-xs text-thaagai-ink dark:text-white">
            <User className="h-4 w-4 text-thaagai-wine shrink-0" />
            <span>Have an account? Sign in with mobile OTP to use saved addresses and view past orders.</span>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="flex h-9 shrink-0 items-center rounded-md bg-thaagai-wine px-3 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
          >
            Sign In with OTP
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Customer Address Details Column */}
        <div className="space-y-6 lg:col-span-7">
          
          {/* Saved Addresses Section (If Authenticated & Has Saved Addresses) */}
          {isAuthenticated && savedAddresses.length > 0 && (
            <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                  1. Choose Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedAddressId("NEW")}
                  className="flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Enter New Address
                </button>
              </div>

              <div className="space-y-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  const TypeIcon = addr.addressType === "HOME" ? Home : addr.addressType === "WORK" ? Briefcase : Building;

                  return (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-thaagai-wine bg-thaagai-sand/10 ring-1 ring-thaagai-wine dark:bg-thaagai-cardDark"
                          : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 h-4 w-4 text-thaagai-wine focus:ring-thaagai-wine"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-thaagai-ink dark:text-white">
                            {addr.recipientName}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-thaagai-sand px-1.5 py-0.5 text-[10px] font-semibold text-thaagai-ink">
                            <TypeIcon className="h-2.5 w-2.5 text-thaagai-gold" />
                            {addr.addressType}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded bg-thaagai-wine px-1.5 py-0.5 text-[10px] font-bold text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                          {addr.houseOrFlat}{addr.buildingName ? `, ${addr.buildingName}` : ""}, {addr.street}, {addr.locality}
                        </p>
                        <p className="text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                          {addr.city}, {addr.state} - <strong className="font-semibold">{addr.pinCode}</strong>
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-thaagai-ink/60">
                          Phone: +91 {addr.mobileNumber}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Address Entry Form (Shown if selectedAddressId === 'NEW' or guest) */}
          {(selectedAddressId === "NEW" || !isAuthenticated || savedAddresses.length === 0) && (
            <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
              <h2 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                {savedAddresses.length > 0 ? "New Delivery Address" : "1. Delivery Information"}
              </h2>

              <div className="mt-4 space-y-4">
                {/* Contact Name & Mobile */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      Recipient Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Priya Sundaram"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      WhatsApp Mobile Number *
                    </label>
                    <div className="mt-1 flex rounded-md border border-thaagai-line bg-white dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
                      <span className="inline-flex h-11 items-center border-r border-thaagai-line px-2.5 text-xs font-medium text-thaagai-ink/70 dark:border-thaagai-line/40 dark:text-thaagai-inkDark/70">
                        +91
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        required
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="h-11 w-full bg-transparent px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:outline-none dark:text-white dark:placeholder:text-stone-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 6-Digit PIN Code with Autofill */}
                <div>
                  <label htmlFor="pinCode" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    6-Digit Indian PIN Code *
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="pinCode"
                      type="text"
                      required
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 600017"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs font-semibold text-thaagai-ink placeholder:font-normal placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                    {pinLoading && (
                      <div className="absolute right-3 top-3">
                        <RotateCw className="h-4 w-4 animate-spin text-thaagai-wine" />
                      </div>
                    )}
                  </div>
                  {pinMsg && (
                    <p className="mt-1 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      {pinMsg}
                    </p>
                  )}
                </div>

                {/* Flat & Building */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="flat" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      Door / Flat / House No. *
                    </label>
                    <input
                      id="flat"
                      type="text"
                      required
                      value={houseOrFlat}
                      onChange={(e) => setHouseOrFlat(e.target.value)}
                      placeholder="e.g. Flat 302, Door 14"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="bldg" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      Building / Apartment Name
                    </label>
                    <input
                      id="bldg"
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="e.g. Sri Krishna Apartments"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>

                {/* Street */}
                <div>
                  <label htmlFor="street" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Street / Road / Main *
                  </label>
                  <input
                    id="street"
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 74 Gandhi Road"
                    className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>

                {/* Locality Dropdown or Text */}
                <div>
                  <label htmlFor="locality" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                    Locality / Post Office / Area *
                  </label>
                  {postOffices.length > 0 ? (
                    <select
                      id="locality"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                    >
                      {postOffices.map((po) => (
                        <option key={po} value={po}>
                          {po}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="locality"
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. T. Nagar"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  )}
                </div>

                {/* Landmark, City & State */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="landmark" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      Landmark (Optional)
                    </label>
                    <input
                      id="landmark"
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near Panagal Park"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      City / Town *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                      State *
                    </label>
                    <input
                      id="state"
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="mt-1 h-11 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>

                {/* Save Address to Profile Checkbox (If Authenticated) */}
                {isAuthenticated && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="saveProfile"
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                    />
                    <label htmlFor="saveProfile" className="text-xs font-medium text-thaagai-ink dark:text-white">
                      Save this address to my profile for future orders
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp Consent Box */}
          <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
              />
              <span className="text-xs leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                I agree to submit this order request to Thaagai and confirm details, measurements, and delivery coordination on WhatsApp.
              </span>
            </label>
          </div>

          {/* Invisible Honeypot Field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_hp">Leave empty</label>
            <input
              id="website_hp"
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
              Order Review ({itemCount} pieces)
            </h2>

            <div className="mt-4 max-h-72 divide-y divide-thaagai-line/40 overflow-y-auto pr-1">
              {items.map((item) => {
                const unit = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
                return (
                  <div key={item.variantId} className="flex gap-3 py-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded border border-thaagai-line/60 bg-thaagai-sand/30">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] text-thaagai-ink/40">
                          Piece
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-1 font-serif text-xs font-bold text-thaagai-ink dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-thaagai-ink/60">
                        {[item.size, item.colour].filter(Boolean).join(" · ")}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-thaagai-ink/70">Qty: {item.quantity}</span>
                        <span className="font-bold text-thaagai-wine">
                          ₹{(unit * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-thaagai-line/60 pt-4 text-xs">
              <div className="flex justify-between text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                <span>Catalog Subtotal</span>
                <span className="font-mono font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                <span>Shipping</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Coordinated on WhatsApp</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-thaagai-line/60 pt-3">
                <span className="text-sm font-bold text-thaagai-ink dark:text-white">Estimated Total</span>
                <span className="font-sans text-xl font-bold text-thaagai-wine">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Mandatory Locked Disclosure */}
            <div className="mt-6 rounded-lg bg-thaagai-sand/40 p-3.5 text-center dark:bg-thaagai-sandDark/30">
              <p className="text-[11px] font-medium leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                Orders are requests until the seller confirms them on WhatsApp.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-thaagai-wine text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{loading ? "Submitting Request..." : "Request Order via WhatsApp"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
