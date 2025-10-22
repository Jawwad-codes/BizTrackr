/** @format */

import { ObjectId } from "mongodb";

// Base interface for all models with MongoDB ObjectId
export interface BaseModel {
  _id?: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Business type options
export type BusinessType =
  | "glass-hardware"
  | "retail-store"
  | "salon"
  | "bakery"
  | "construction-material"
  | "tailoring-shop"
  | "electronics-repair"
  | "cleaning-service"
  | "it-startup"
  | "cosmetics-shop";

// User interface for authentication
export interface User extends BaseModel {
  email: string;
  password: string; // This will be hashed
  name: string;
  businessName?: string;
  businessType?: BusinessType;
  createdAt: Date;
}

// Sale interface for sales data
export interface Sale extends BaseModel {
  userId: ObjectId | string;
  item: string;
  amount: number;
  quantity: number;
  date: string;
}

// Expense interface for expense data
export interface Expense extends BaseModel {
  userId: ObjectId | string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

// Employee interface for employee data
export interface Employee extends BaseModel {
  userId: ObjectId | string;
  name: string;
  role: string;
  salary: number;
  hireDate?: string;
}

// Inventory interface for inventory management
export interface Inventory extends BaseModel {
  userId: ObjectId | string;
  productName: string;
  category: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  description?: string;
  unit: string;
}

// Chart data point for dashboard analytics
export interface ChartDataPoint {
  date: string;
  sales: number;
  expenses: number;
  profit: number;
}

// Category data for expense breakdown
export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

// Activity item for recent activity feed
export interface ActivityItem {
  id: string;
  type: "sale" | "expense" | "employee";
  description: string;
  amount?: number;
  date: string;
}

// Dashboard metrics interface
export interface DashboardMetrics {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalInventoryValue: number;
  lowStockItems: number;
  totalProducts: number;
  chartData: ChartDataPoint[];
  categoryData: CategoryData[];
  recentActivity: ActivityItem[];
}

// API Response types
export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface APISuccess<T> {
  success: true;
  data: T;
}

export type APIResponse<T> = APISuccess<T> | APIError;
