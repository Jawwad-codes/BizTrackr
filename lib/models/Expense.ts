/** @format */

import mongoose, { Schema } from "mongoose";
import { Expense } from "./types";

// Define the Expense schema
const ExpenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
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
    collection: "expenses",
  }
);

// Add indexes for better query performance
ExpenseSchema.index({ userId: 1, date: -1 }); // Compound index for user-specific date queries
ExpenseSchema.index({ userId: 1, category: 1 }); // Compound index for user-specific category queries
ExpenseSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user-specific recent expenses

// Create and export the model
// Clear any existing model to ensure schema changes are applied
if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}

const ExpenseModel = mongoose.model<Expense>("Expense", ExpenseSchema);

export default ExpenseModel;
