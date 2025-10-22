/** @format */

"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Inventory, APIResponse } from "@/lib/models/types";
import { useRequireAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const INVENTORY_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Books",
  "Home & Garden",
  "Sports & Outdoors",
  "Health & Beauty",
  "Automotive",
  "Office Supplies",
  "Toys & Games",
  "Services",
  "Other",
];

export default function InventoryPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    stock: "",
    costPrice: "",
    sellingPrice: "",
    reorderLevel: "",
    description: "",
  });

  // Don't render anything while checking authentication
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch("/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result: APIResponse<Inventory[]> = await response.json();

      if (result.success) {
        setInventory(result.data);
      } else {
        setError(result.error.message);
        toast.error(result.error.message);
      }
    } catch (err) {
      const errorMsg = "Failed to fetch inventory data";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (
      !formData.productName ||
      !formData.category ||
      !formData.stock ||
      !formData.costPrice ||
      !formData.sellingPrice ||
      !formData.reorderLevel
    ) {
      const errorMsg = "Please fill in all required fields";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: formData.productName,
          category: formData.category,
          stock: parseInt(formData.stock),
          costPrice: parseFloat(formData.costPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          reorderLevel: parseInt(formData.reorderLevel),
          description: formData.description,
        }),
      });

      const result: APIResponse<Inventory> = await response.json();

      if (result.success) {
        setInventory([result.data, ...inventory]);
        setFormData({
          productName: "",
          category: "",
          stock: "",
          costPrice: "",
          sellingPrice: "",
          reorderLevel: "",
          description: "",
        });
        setShowForm(false);
        toast.success("Inventory item added successfully!");
      } else {
        setError(result.error.message);
        toast.error(result.error.message);
      }
    } catch (err) {
      const errorMsg = "Failed to add inventory item";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error adding inventory item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Inventory) => {
    setEditingId(item._id as string);
    setFormData({
      productName: item.productName,
      category: item.category,
      stock: item.stock.toString(),
      costPrice: item.costPrice.toString(),
      sellingPrice: item.sellingPrice.toString(),
      reorderLevel: item.reorderLevel.toString(),
      description: item.description || "",
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (
      !formData.productName ||
      !formData.category ||
      !formData.stock ||
      !formData.costPrice ||
      !formData.sellingPrice ||
      !formData.reorderLevel ||
      !editingId
    ) {
      const errorMsg = "Please fill in all required fields";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`/api/inventory/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: formData.productName,
          category: formData.category,
          stock: parseInt(formData.stock),
          costPrice: parseFloat(formData.costPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          reorderLevel: parseInt(formData.reorderLevel),
          description: formData.description,
        }),
      });

      const result: APIResponse<Inventory> = await response.json();

      if (result.success) {
        setInventory(
          inventory.map((item) => (item._id === editingId ? result.data : item))
        );
        setFormData({
          productName: "",
          category: "",
          stock: "",
          costPrice: "",
          sellingPrice: "",
          reorderLevel: "",
          description: "",
        });
        setShowForm(false);
        setEditingId(null);
        toast.success("Inventory item updated successfully!");
      } else {
        setError(result.error.message);
        toast.error(result.error.message);
      }
    } catch (err) {
      const errorMsg = "Failed to update inventory item";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error updating inventory item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      productName: "",
      category: "",
      stock: "",
      costPrice: "",
      sellingPrice: "",
      reorderLevel: "",
      description: "",
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string, productName: string) => {
    try {
      setError(null);

      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: APIResponse<{ id: string }> = await response.json();

      if (result.success) {
        setInventory(inventory.filter((item) => item._id !== id));
        toast.success(`${productName} removed from inventory`);
      } else {
        setError(result.error.message);
        toast.error(result.error.message);
      }
    } catch (err) {
      const errorMsg = "Failed to delete inventory item";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error deleting inventory item:", err);
    }
  };

  const totalValue = inventory.reduce(
    (sum, item) => sum + item.stock * item.costPrice,
    0
  );
  const lowStockItems = inventory.filter(
    (item) => item.stock <= item.reorderLevel
  );

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Inventory
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your product inventory
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Items
                  </p>
                  {loading ? (
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-12 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {inventory.length}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Value
                  </p>
                  {loading ? (
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      ${totalValue.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Low Stock
                  </p>
                  {loading ? (
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-8 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-red-500">
                      {lowStockItems.length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="p-4 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-semibold">Low Stock Alert</p>
              </div>
              <p className="text-sm">
                {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""}{" "}
                running low:{" "}
                {lowStockItems.map((item) => item.productName).join(", ")}
              </p>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg space-y-4 animate-slide-up">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm transition-all duration-300 ease-out"
                >
                  <option value="">Select Category</option>
                  {INVENTORY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Stock quantity"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cost price"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Selling price"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="number"
                  placeholder="Reorder level"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
              </div>
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  disabled={submitting}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Adding..."
                    : editingId
                    ? "Update Product"
                    : "Add Product"}
                </button>
                <button
                  onClick={
                    editingId
                      ? handleCancelEdit
                      : () => {
                          setShowForm(false);
                          setError(null);
                        }
                  }
                  disabled={submitting}
                  className="px-4 py-2 border border-border/40 bg-transparent text-foreground hover:bg-secondary rounded-lg font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
                <p className="text-muted-foreground">
                  Loading inventory data...
                </p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No inventory items found
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">
                        Cost Price
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Selling Price
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground hidden lg:table-cell">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr
                        key={item._id?.toString()}
                        className={`border-b border-border/40 hover:bg-secondary/50 transition-colors ${
                          item.stock <= item.reorderLevel ? "bg-red-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-foreground font-medium text-sm">
                              {item.productName}
                            </p>
                            {item.stock <= item.reorderLevel && (
                              <p className="text-red-500 text-xs flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Low stock
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-sm">
                          {item.category}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-semibold ${
                              item.stock <= item.reorderLevel
                                ? "text-red-500"
                                : "text-foreground"
                            }`}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-sm">
                          ${item.costPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-accent font-semibold text-sm">
                          ${item.sellingPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-foreground font-semibold hidden lg:table-cell text-sm">
                          ${(item.stock * item.costPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(item._id as string, item.productName)
                            }
                            className="p-2 hover:bg-destructive/20 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
