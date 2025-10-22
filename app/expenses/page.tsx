/** @format */

"use client";

import { Sidebar } from "@/components/sidebar";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Expense, APIResponse } from "@/lib/models/types";
import { APIError } from "@/components/api-error-handler";
import {
  LoadingSpinner,
  TableSkeleton,
  CardSkeleton,
  LoadingButton,
} from "@/components/loading-states";
import { useLoading, useMultipleLoading } from "@/hooks/use-loading";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  "Rent/Lease",
  "Utilities",
  "Payroll",
  "Office Supplies",
  "Marketing & Advertising",
  "Insurance",
  "Professional Services",
  "Equipment",
  "Travel",
  "Meals & Entertainment",
  "Software & Subscriptions",
  "Maintenance & Repairs",
  "Shipping & Delivery",
  "Taxes & Licenses",
  "Other",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
  });

  const { loading, error, withLoading, clearError } = useLoading({
    initialLoading: true,
  });
  const { isLoading, withLoading: withMultipleLoading } = useMultipleLoading();

  // Fetch expenses data on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const result = await withLoading(async () => {
      const response = await fetch("/api/expenses");
      const result: APIResponse<Expense[]> = await response.json();

      if (result.success) {
        setExpenses(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Loaded ${result.length} expense records`);
    }
  };

  const handleAdd = async () => {
    if (
      !formData.category ||
      !formData.description ||
      !formData.amount ||
      !formData.date
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await withMultipleLoading("add", async () => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
          date: formData.date,
        }),
      });

      const result: APIResponse<Expense> = await response.json();

      if (result.success) {
        setExpenses([result.data, ...expenses]);
        setFormData({ category: "", description: "", amount: "", date: "" });
        setShowForm(false);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(
        `Expense added: ${result.description} for $${result.amount}`
      );
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense._id as string);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (
      !formData.category ||
      !formData.description ||
      !formData.amount ||
      !formData.date ||
      !editingId
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await withMultipleLoading("update", async () => {
      const response = await fetch(`/api/expenses/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
          date: formData.date,
        }),
      });

      const result: APIResponse<Expense> = await response.json();

      if (result.success) {
        setExpenses(
          expenses.map((e) => (e._id === editingId ? result.data : e))
        );
        setFormData({ category: "", description: "", amount: "", date: "" });
        setShowForm(false);
        setEditingId(null);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(
        `Expense updated: ${result.description} for $${result.amount}`
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ category: "", description: "", amount: "", date: "" });
    setShowForm(false);
  };

  const handleDelete = async (id: string, description: string) => {
    const result = await withMultipleLoading(`delete-${id}`, async () => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const result: APIResponse<Expense> = await response.json();

      if (result.success) {
        setExpenses(expenses.filter((e) => e._id !== id));
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Expense deleted: ${description}`);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Expenses
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track your business expenses
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Error Message */}
          <APIError
            error={error}
            onRetry={fetchExpenses}
            onDismiss={clearError}
          />

          {/* Total Expenses Card */}
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Total Expenses
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg space-y-4 animate-slide-up">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit Expense" : "Add New Expense"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm transition-all duration-300 ease-out"
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
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
            </div>
          )}

          {/* Expenses Table */}
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : expenses.length === 0 ? (
            <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No expense records found
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Amount
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
                    {expenses.map((expense) => (
                      <tr
                        key={expense._id?.toString()}
                        className="border-b border-border/40 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {expense.category}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium text-sm">
                          {expense.description}
                        </td>
                        <td className="px-4 py-3 text-red-500 font-semibold text-sm">
                          ${expense.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-sm">
                          {expense.date}
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <LoadingButton
                            onClick={() =>
                              handleDelete(
                                expense._id as string,
                                expense.description
                              )
                            }
                            loading={isLoading(`delete-${expense._id}`)}
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
