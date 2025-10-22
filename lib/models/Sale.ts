/** @format */

import mongoose, { Schema, Model } from "mongoose";
import { Sale } from "./types";

// Define the Sale schema
const SaleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    item: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Amount must be a valid positive number",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value) && value >= 1;
        },
        message: "Quantity must be a positive integer",
      },
      default: 1,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      validate: {
        validator: function (value: string) {
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) return false;

          // Validate that it's a valid date
          const date = new Date(value);
          return date instanceof Date && !isNaN(date.getTime());
        },
        message: "Date must be in YYYY-MM-DD format and be a valid date",
      },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: "sales",
  }
);

// Add indexes for better query performance
SaleSchema.index({ userId: 1, date: -1 }); // Compound index for user-specific date queries
SaleSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user-specific recent sales

// Create and export the model
const SaleModel =
  mongoose.models.Sale || mongoose.model<Sale>("Sale", SaleSchema);

export default SaleModel;
