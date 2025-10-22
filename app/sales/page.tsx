/** @format */

"use client";

import { Sidebar } from "@/components/sidebar";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Sale, APIResponse, BusinessType } from "@/lib/models/types";
import { toast } from "sonner";
import { APIError } from "@/components/api-error-handler";
import {
  TableSkeleton,
  CardSkeleton,
  LoadingButton,
} from "@/components/loading-states";
import { useLoading, useMultipleLoading } from "@/hooks/use-loading";
import { useAuth } from "@/lib/auth-context";
import {
  getBusinessConfig,
  getBusinessTypeLabel,
  getBusinessTypeEmoji,
} from "@/lib/business-config";
import { motion } from "framer-motion";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item: "",
    amount: "",
    quantity: "",
    date: "",
  });

  const { loading, error, withLoading, clearError } = useLoading({
    initialLoading: true,
  });
  const { isLoading, withLoading: withMultipleLoading } = useMultipleLoading();
  const { user } = useAuth();

  // Get business configuration
  const businessType = user?.businessType as BusinessType;
  const businessConfig = businessType ? getBusinessConfig(businessType) : null;
  const businessLabel = businessType
    ? getBusinessTypeLabel(businessType)
    : "Business";
  const businessEmoji = businessType
    ? getBusinessTypeEmoji(businessType)
    : "🏢";

  // Fetch sales data on component mount
  useEffect(() => {
    fetchSales();
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  const fetchSales = async () => {
    const result = await withLoading(async () => {
      const response = await fetch("/api/sales");
      const result: APIResponse<Sale[]> = await response.json();

      if (result.success) {
        setSales(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result && result.length > 0) {
      toast.success(`Loaded ${result.length} sales records`);
    }
  };

  const handleAdd = async () => {
    if (
      !formData.item ||
      !formData.amount ||
      !formData.quantity ||
      !formData.date
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate numeric inputs
    const amount = Number.parseFloat(formData.amount);
    const quantity = Number.parseInt(formData.quantity);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const result = await withMultipleLoading("add", async () => {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: formData.item.trim(),
          amount: amount,
          quantity: quantity,
          date: formData.date,
        }),
      });

      const result: APIResponse<Sale> = await response.json();

      if (result.success) {
        setSales([result.data, ...sales]);
        setFormData({ item: "", amount: "", quantity: "", date: "" });
        setShowForm(false);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Sale added: ${result.item} for $${result.amount}`);
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale._id as string);
    setFormData({
      item: sale.item,
      amount: sale.amount.toString(),
      quantity: (sale.quantity || 1).toString(), // Default to 1 if quantity is missing
      date: sale.date,
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (
      !formData.item ||
      !formData.amount ||
      !formData.quantity ||
      !formData.date ||
      !editingId
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate numeric inputs
    const amount = Number.parseFloat(formData.amount);
    const quantity = Number.parseInt(formData.quantity);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const result = await withMultipleLoading("update", async () => {
      const response = await fetch(`/api/sales/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: formData.item.trim(),
          amount: amount,
          quantity: quantity,
          date: formData.date,
        }),
      });

      const result: APIResponse<Sale> = await response.json();

      if (result.success) {
        setSales(sales.map((s) => (s._id === editingId ? result.data : s)));
        setFormData({ item: "", amount: "", quantity: "", date: "" });
        setShowForm(false);
        setEditingId(null);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Sale updated: ${result.item} for $${result.amount}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ item: "", amount: "", quantity: "", date: "" });
    setShowForm(false);
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (
      !confirm(`Are you sure you want to delete the sale for "${itemName}"?`)
    ) {
      return;
    }

    const result = await withMultipleLoading(`delete-${id}`, async () => {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });

      const result: APIResponse<Sale> = await response.json();

      if (result.success) {
        setSales(sales.filter((s) => s._id !== id));
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Sale deleted: ${itemName}`);
    }
  };

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                {businessEmoji} Sales
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {businessType
                  ? `Welcome, ${businessLabel} Business!`
                  : "Welcome!"}{" "}
                Manage your sales records
              </p>
            </motion.div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Sale
            </button>
          </div>

          {/* Error Message */}
          <APIError error={error} onRetry={fetchSales} onDismiss={clearError} />

          {/* Total Sales Card */}
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
              <p className="text-2xl sm:text-3xl font-bold text-accent">
                ${totalSales.toLocaleString()}
              </p>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <motion.div
              className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg space-y-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit Sale" : "Add New Sale"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder={businessConfig?.itemLabel || "Item name"}
                  value={formData.item}
                  onChange={(e) =>
                    setFormData({ ...formData, item: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="number"
                  placeholder={businessConfig?.quantityLabel || "Quantity"}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  min="1"
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="number"
                  placeholder={businessConfig?.priceLabel || "Price"}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  step="0.01"
                  min="0"
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm transition-all duration-300 ease-out"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <LoadingButton
                  onClick={editingId ? handleUpdate : handleAdd}
                  loading={isLoading(editingId ? "update" : "add")}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-all duration-300 ease-out"
                >
                  {editingId ? "Update" : "Save"}
                </LoadingButton>
                <button
                  onClick={
                    editingId
                      ? handleCancelEdit
                      : () => {
                          setShowForm(false);
                          clearError();
                        }
                  }
                  disabled={isLoading("add")}
                  className="px-4 py-2 border border-border/40 bg-transparent text-foreground hover:bg-secondary rounded-lg font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Sales Table */}
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : sales.length === 0 ? (
            <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No sales records found
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Sale
              </button>
            </div>
          ) : (
            <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        {businessConfig?.itemLabel || "Item"}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">
                        {businessConfig?.quantityLabel || "Quantity"}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        {businessConfig?.priceLabel || "Price"}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr
                        key={sale._id?.toString()}
                        className="border-b border-border/40 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground font-medium text-sm">
                          {sale.item}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-sm">
                          {sale.quantity || 1}{" "}
                          {businessConfig?.defaultUnit || "pcs"}
                        </td>
                        <td className="px-4 py-3 text-accent font-semibold text-sm">
                          ${sale.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-sm">
                          {sale.date}
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <LoadingButton
                            onClick={() =>
                              handleDelete(sale._id as string, sale.item)
                            }
                            loading={isLoading(`delete-${sale._id}`)}
                            className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </LoadingButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
