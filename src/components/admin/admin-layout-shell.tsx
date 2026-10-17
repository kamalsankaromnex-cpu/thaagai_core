"use client";

import { useState } from "react";
import { AdminSession } from "@/server/auth/auth";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

interface AdminLayoutShellProps {
  user: AdminSession;
  pendingOrdersCount: number;
  lowStockCount: number;
  children: React.ReactNode;
}

export function AdminLayoutShell({
  user,
  pendingOrdersCount,
  lowStockCount,
  children,
}: AdminLayoutShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-thaagai-bg text-thaagai-ink dark:bg-thaagai-cardDark dark:text-thaagai-inkDark">
      {/* Left Sidebar */}
      <AdminSidebar
        user={user}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Persistent Top Header */}
        <AdminHeader
          user={user}
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          pendingOrdersCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
