"use client";

import { useState, useEffect, useTransition } from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileSpreadsheet,
  Pencil,
  RotateCcw,
} from "lucide-react";

interface FinanceRecord {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: string | number;
  paymentMethod: string;
  transactionDate: string;
  description: string;
  status: string;
  actor?: { name: string; email: string } | null;
}

interface FinanceMetrics {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  profitMargin: number;
}

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "SALES_REVENUE", label: "Sales Revenue" },
  { value: "FABRIC_SOURCING", label: "Fabric & Material Sourcing" },
  { value: "TAILORING_WAGES", label: "Tailoring & Artisan Wages" },
  { value: "PACKAGING", label: "Luxury Packaging & Boxes" },
  { value: "LOGISTICS", label: "Courier & Shipping" },
  { value: "MARKETING", label: "Advertising & Photography" },
  { value: "STUDIO_RENT", label: "Atelier Rent & Utilities" },
  { value: "MISCELLANEOUS", label: "Miscellaneous Operating Expense" },
];

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<FinanceRecord[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    profitMargin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [timeframe, setTimeframe] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Modal Form State
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [formCategory, setFormCategory] = useState("PACKAGING");
  const [formAmount, setFormAmount] = useState("");
  const [formMethod, setFormMethod] = useState("BANK_TRANSFER");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<FinanceRecord | null>(null);
  const [editCategory, setEditCategory] = useState("PACKAGING");
  const [editAmount, setEditAmount] = useState("");
  const [editMethod, setEditMethod] = useState("BANK_TRANSFER");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = (tx: FinanceRecord) => {
    setEditingTx(tx);
    setEditCategory(tx.category);
    setEditAmount(String(tx.amount));
    setEditMethod(tx.paymentMethod);
    setEditDate(new Date(tx.transactionDate).toISOString().slice(0, 10));
    setEditDescription(tx.description);
    setEditError(null);
  };

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeframe !== "all") params.set("timeframe", timeframe);
      if (activeTab !== "ALL") params.set("type", activeTab);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/finance?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setMetrics(
          data.metrics || {
            totalIncome: 0,
            totalExpenses: 0,
            netBalance: 0,
            profitMargin: 0,
          }
        );
      }
    } catch (err) {
      console.error("Failed to load finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [timeframe, activeTab, categoryFilter, searchQuery]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!formDescription.trim()) {
      setFormError("Please enter a description for this transaction.");
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          category: formCategory,
          amount: numAmount,
          paymentMethod: formMethod,
          transactionDate: formDate,
          description: formDescription.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to record transaction");
        return;
      }

      // Reset form and close
      setFormAmount("");
      setFormDescription("");
      setIsModalOpen(false);
      fetchFinanceData();
    } catch (err) {
      console.error("Error creating transaction:", err);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setEditError(null);

    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setEditError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!editDescription.trim()) {
      setEditError("Please enter a description for this transaction.");
      return;
    }

    try {
      setEditSubmitting(true);
      const res = await fetch(`/api/admin/finance/${editingTx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editCategory,
          amount: numAmount,
          paymentMethod: editMethod,
          transactionDate: editDate,
          description: editDescription.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setEditError(json.error || "Failed to update transaction");
        return;
      }

      setEditingTx(null);
      fetchFinanceData();
    } catch (err) {
      console.error("Error updating transaction:", err);
      setEditError("A network error occurred. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleReverseTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to mark this transaction as REVERSED in the accounting ledger?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/finance/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFinanceData();
      }
    } catch (err) {
      console.error("Error reversing transaction:", err);
    }
  };

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Payment Method",
      "Amount (INR)",
      "Status",
      "Recorded By",
    ];

    const rows = transactions.map((t) => [
      `"${new Date(t.transactionDate).toLocaleDateString("en-IN")}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.paymentMethod}"`,
      t.amount,
      `"${t.status}"`,
      `"${t.actor?.name || "System"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `thaagai_finance_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Income & Expenses
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Real-time ledger of boutique sales inflow, production expenditure, packaging, and net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg border border-thaagai-line bg-white px-3.5 text-xs font-semibold text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine disabled:opacity-50 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
          >
            <Download className="h-4 w-4 text-thaagai-gold" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-thaagai-wineHover"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Income */}
        <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Realized Income
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
              ₹{metrics.totalIncome.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Confirmed client sales & orders
          </p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Operating Outflow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
              ₹{metrics.totalExpenses.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Materials, packaging, logistics, overheads
          </p>
        </div>

        {/* Net Boutique Profit */}
        <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Net Balance / Profit
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                metrics.netBalance >= 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {metrics.netBalance >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold tracking-tight ${
                metrics.netBalance >= 0
                  ? "text-thaagai-ink dark:text-white"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ₹{metrics.netBalance.toLocaleString("en-IN")}
            </span>
            <span className="rounded-full bg-thaagai-sand px-2 py-0.5 text-xs font-bold text-thaagai-wine dark:bg-thaagai-sandDark dark:text-thaagai-gold">
              {metrics.profitMargin}% margin
            </span>
          </div>
          <p className="mt-2 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Realized cash position for selected period
          </p>
        </div>
      </div>

      {/* Controls Bar: Timeframe, Tab, Category, Search */}
      <div className="rounded-xl border border-thaagai-line bg-white p-4 shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs */}
          <div className="flex rounded-lg border border-thaagai-line/80 bg-thaagai-sand/30 p-1 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-thaagai-wine shadow-xs dark:bg-thaagai-cardDark dark:text-white"
                  : "text-thaagai-ink/70 hover:text-thaagai-ink dark:text-thaagai-inkDark/70"
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("INCOME")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "INCOME"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-thaagai-ink/70 hover:text-emerald-700 dark:text-thaagai-inkDark/70"
              }`}
            >
              Income Inflow
            </button>
            <button
              onClick={() => setActiveTab("EXPENSE")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "EXPENSE"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-thaagai-ink/70 hover:text-rose-700 dark:text-thaagai-inkDark/70"
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Timeframe & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="h-9 rounded-lg border border-thaagai-line/80 bg-white px-2.5 text-xs font-medium text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Fiscal Year</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-thaagai-line/80 bg-white px-2.5 text-xs font-medium text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-thaagai-ink/40" />
              <input
                type="text"
                placeholder="Search notes or methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-lg border border-thaagai-line/80 bg-white pl-8 pr-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-thaagai-wine" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="mx-auto h-10 w-10 text-thaagai-ink/30 dark:text-thaagai-inkDark/30" />
            <h3 className="mt-3 text-sm font-bold text-thaagai-ink dark:text-white">
              No financial transactions found
            </h3>
            <p className="mt-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Try adjusting your timeframe filter or record a new expense or revenue entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-thaagai-line/80 bg-thaagai-sand/30 font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/60">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-thaagai-line/50 dark:divide-thaagai-line/30">
                {transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";

                  return (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/10"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                        {new Date(tx.transactionDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-thaagai-ink dark:text-white">
                          {tx.description}
                        </p>
                        {tx.actor && (
                          <p className="text-[10px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                            By {tx.actor.name}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="rounded bg-thaagai-sand/70 px-2 py-0.5 text-[10px] font-semibold text-thaagai-ink dark:bg-thaagai-sandDark dark:text-white">
                          {tx.category.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-thaagai-ink/80 dark:text-white/80">
                        {tx.paymentMethod}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-bold">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-700 dark:text-rose-400"
                          }
                        >
                          {isIncome ? "+" : "-"}₹
                          {Number(tx.amount).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            tx.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : tx.status === "REVERSED"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(tx)}
                            title="Edit Transaction"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-thaagai-line text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {tx.status !== "REVERSED" && (
                            <button
                              type="button"
                              onClick={() => handleReverseTransaction(tx.id)}
                              title="Mark Reversed"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/30"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                Record Financial Transaction
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Inflow vs Outflow toggle */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                  Transaction Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("EXPENSE");
                      setFormCategory("PACKAGING");
                    }}
                    className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold transition-all ${
                      formType === "EXPENSE"
                        ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        : "border-thaagai-line bg-white text-thaagai-ink/70 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                    }`}
                  >
                    <ArrowDownRight className="h-4 w-4" />
                    <span>Expense (Outflow)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("INCOME");
                      setFormCategory("SALES_REVENUE");
                    }}
                    className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold transition-all ${
                      formType === "INCOME"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-thaagai-line bg-white text-thaagai-ink/70 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Income (Inflow)</span>
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Amount (₹ INR) *
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-thaagai-ink/50">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2400"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="h-10 w-full rounded-lg border border-thaagai-line bg-white pl-8 pr-3 text-sm font-bold text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c.value !== "ALL").map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Payment Method *
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Description & Reference Note *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 500 Luxury Gold Foil Box Packaging restock"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-thaagai-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Record Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <div>
                <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                  Edit Transaction
                </h3>
                <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                  {editingTx.type} • ID: {editingTx.id.slice(0, 10)}...
                </p>
              </div>
              <button
                onClick={() => setEditingTx(null)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTransaction} className="mt-4 space-y-4 text-xs">
              {editError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                >
                  {CATEGORIES.filter((c) => c.value !== "ALL").map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Amount (₹ INR)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-thaagai-ink/40">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full rounded-lg border border-thaagai-line bg-white p-2.5 pl-7 text-xs font-mono font-bold text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Payment Method
                </label>
                <select
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                >
                  <option value="BANK_TRANSFER">NEFT / RTGS Bank Transfer</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash Drawer</option>
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Description / Reference Note
                </label>
                <input
                  type="text"
                  required
                  placeholder="Reference note"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-thaagai-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {editSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
