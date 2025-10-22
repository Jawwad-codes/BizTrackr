/** @format */

"use client";

import { Sidebar } from "@/components/sidebar";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Employee, APIResponse } from "@/lib/models/types";
import { APIError } from "@/components/api-error-handler";
import {
  LoadingSpinner,
  TableSkeleton,
  CardSkeleton,
  LoadingButton,
} from "@/components/loading-states";
import { useLoading, useMultipleLoading } from "@/hooks/use-loading";
import { useRequireAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const EMPLOYEE_ROLES = [
  "Owner/Manager",
  "Sales Representative",
  "Accountant",
  "Marketing Manager",
  "Customer Service",
  "Operations Manager",
  "Developer",
  "Designer",
  "Administrative Assistant",
  "Technician",
  "Consultant",
  "Other",
];

export default function EmployeesPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", salary: "" });

  const { loading, error, withLoading, clearError } = useLoading({
    initialLoading: true,
  });
  const { isLoading, withLoading: withMultipleLoading } = useMultipleLoading();

  // Don't render anything while checking authentication
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Authenticating..." size="lg" />
      </div>
    );
  }

  // Fetch employees data on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const result = await withLoading(async () => {
      // Get user token from localStorage
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch("/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result: APIResponse<Employee[]> = await response.json();

      if (result.success) {
        setEmployees(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Loaded ${result.length} employee records`);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.role || !formData.salary) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await withMultipleLoading("add", async () => {
      // Get user token from localStorage
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          salary: Number.parseFloat(formData.salary),
        }),
      });

      const result: APIResponse<Employee> = await response.json();

      if (result.success) {
        setEmployees([result.data, ...employees]);
        setFormData({ name: "", role: "", salary: "" });
        setShowForm(false);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Employee added: ${result.name} as ${result.role}`);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee._id as string);
    setFormData({
      name: employee.name,
      role: employee.role,
      salary: employee.salary.toString(),
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.role || !formData.salary || !editingId) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await withMultipleLoading("update", async () => {
      // Get user token from localStorage
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`/api/employees/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          salary: Number.parseFloat(formData.salary),
        }),
      });

      const result: APIResponse<Employee> = await response.json();

      if (result.success) {
        setEmployees(
          employees.map((e) => (e._id === editingId ? result.data : e))
        );
        setFormData({ name: "", role: "", salary: "" });
        setShowForm(false);
        setEditingId(null);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Employee updated: ${result.name} - ${result.role}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", role: "", salary: "" });
    setShowForm(false);
  };

  const handleDelete = async (id: string, employeeName: string) => {
    const result = await withMultipleLoading(`delete-${id}`, async () => {
      // Get user token from localStorage
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: APIResponse<Employee> = await response.json();

      if (result.success) {
        setEmployees(employees.filter((e) => e._id !== id));
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success(`Employee deleted: ${employeeName}`);
    }
  };

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Employees
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your team and payroll
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>

          {/* Error Message */}
          <APIError
            error={error}
            onRetry={fetchEmployees}
            onDismiss={clearError}
          />

          {/* Total Payroll Card */}
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Total Monthly Payroll
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-accent">
                ${totalPayroll.toLocaleString()}
              </p>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg space-y-4 animate-slide-up">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit Employee" : "Add New Employee"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Employee name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
                />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm transition-all duration-300 ease-out"
                >
                  <option value="">Select role</option>
                  {EMPLOYEE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Monthly salary"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out"
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

          {/* Employees Table */}
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : employees.length === 0 ? (
            <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No employee records found
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Employee
              </button>
            </div>
          ) : (
            <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">
                        Salary
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee._id?.toString()}
                        className="border-b border-border/40 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground font-medium text-sm">
                          {employee.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {employee.role}
                        </td>
                        <td className="px-4 py-3 text-accent font-semibold hidden md:table-cell text-sm">
                          ${employee.salary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <LoadingButton
                            onClick={() =>
                              handleDelete(
                                employee._id as string,
                                employee.name
                              )
                            }
                            loading={isLoading(`delete-${employee._id}`)}
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
