/** @format */

import mongoose, { Schema, Model } from "mongoose";
import { Inventory } from "./types";

// Define valid inventory categories
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

// Define the Inventory schema
const InventorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: INVENTORY_CATEGORIES,
        message: "Category must be one of: {VALUE}",
      },
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value) && value >= 0;
        },
        message: "Stock must be a non-negative integer",
      },
    },
    costPrice: {
      type: Number,
      required: [true, "Cost price is required"],
      min: [0, "Cost price must be positive"],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Cost price must be a valid positive number",
      },
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price must be positive"],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Selling price must be a valid positive number",
      },
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value) && value >= 0;
        },
        message: "Reorder level must be a non-negative integer",
      },
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: [
        "piece",
        "box",
        "kg",
        "gram",
        "liter",
        "meter",
        "service",
        "hour",
        "set",
        "pair",
        "dozen",
        "pack",
      ],
      default: "piece",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: "inventory",
  }
);

// Add indexes for better query performance
InventorySchema.index({ userId: 1, productName: 1 }); // Compound index for user-specific product queries
InventorySchema.index({ userId: 1, category: 1 }); // Compound index for user-specific category queries
InventorySchema.index({ userId: 1, stock: 1 }); // Compound index for user-specific stock queries
InventorySchema.index({ userId: 1, createdAt: -1 }); // Compound index for user-specific recent inventory

// Virtual for profit margin
InventorySchema.virtual("profitMargin").get(function () {
  if (this.costPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Virtual for low stock alert
InventorySchema.virtual("isLowStock").get(function () {
  return this.stock <= this.reorderLevel;
});

// Ensure virtual fields are serialized
InventorySchema.set("toJSON", { virtuals: true });
InventorySchema.set("toObject", { virtuals: true });

// Create and export the model
const InventoryModel =
  mongoose.models.Inventory ||
  mongoose.model<Inventory>("Inventory", InventorySchema);

export default InventoryModel;
