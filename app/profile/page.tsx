/** @format */

"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { User, Settings, Loader2, Edit2 } from "lucide-react";
import { useRequireAuth, useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { BusinessType, APIResponse } from "@/lib/models/types";
import {
  getBusinessTypeLabel,
  getBusinessTypeEmoji,
} from "@/lib/business-config";

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    businessType: "",
    email: "",
  });

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name || !formData.businessName || !formData.businessType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          businessName: formData.businessName,
          businessType: formData.businessType,
        }),
      });

      const result: APIResponse<any> = await response.json();

      if (result.success) {
        // Update user in auth context
        if (user) {
          login({
            ...user,
            name: formData.name,
            businessName: formData.businessName,
            businessType: formData.businessType,
          });
        }
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        email: user.email || "",
      });
    }
    setIsEditing(false);
  };

  // Don't render anything while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // If not loading and no user, the useRequireAuth hook will redirect
  if (!user) {
    return null;
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                  {user?.businessType &&
                    getBusinessTypeEmoji(
                      user.businessType as BusinessType
                    )}{" "}
                  Profile
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {user?.businessType
                    ? `${getBusinessTypeLabel(
                        user.businessType as BusinessType
                      )} Business`
                    : "Manage your account settings"}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ease-out"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Form */}
          <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Account Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label
                  htmlFor="businessType"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Business Type
                </label>
                <select
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData({ ...formData, businessType: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select your business type</option>
                  <option value="glass-hardware">🪞 Glass/Hardware</option>
                  <option value="retail-store">🛍️ Retail Store</option>
                  <option value="salon">💇 Salon</option>
                  <option value="bakery">🍰 Bakery</option>
                  <option value="construction-material">
                    🧱 Construction Material
                  </option>
                  <option value="tailoring-shop">🧵 Tailoring Shop</option>
                  <option value="electronics-repair">
                    💡 Electronics Repair
                  </option>
                  <option value="cleaning-service">🧽 Cleaning Service</option>
                  <option value="it-startup">🖥️ IT Startup</option>
                  <option value="cosmetics-shop">🧴 Cosmetics Shop</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-2 bg-secondary border border-border/40 text-foreground rounded-lg text-sm placeholder:text-muted-foreground transition-all duration-300 ease-out opacity-60 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed. Contact support if you need to update
                  your email.
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 border border-border/40 bg-transparent text-foreground hover:bg-secondary rounded-lg font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="border border-border/40 bg-card/50 backdrop-blur rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Account Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-accent">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-green-500">Active</p>
                <p className="text-sm text-muted-foreground">Account Status</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-blue-500">Free</p>
                <p className="text-sm text-muted-foreground">Plan Type</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
