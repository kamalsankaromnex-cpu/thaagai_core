"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CustomerUser {
  id: string;
  mobileNumber: string;
  fullName: string | null;
  email: string | null;
  mobileVerifiedAt: string | null;
  createdAt: string;
  addressesCount?: number;
  ordersCount?: number;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (mobileNumber: string) => Promise<{ success: boolean; devOtp?: string; expiresInSeconds?: number }>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<{ success: boolean; customer: CustomerUser }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          return;
        }
      }
      setCustomer(null);
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const requestOtp = async (mobileNumber: string) => {
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to request OTP.");
    }
    return data;
  };

  const verifyOtp = async (mobileNumber: string, otp: string) => {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to verify OTP.");
    }
    setCustomer(data.customer);
    return data;
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCustomer(null);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        requestOtp,
        verifyOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}
