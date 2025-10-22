/** @format */

import mongoose, { Schema, Model } from "mongoose";
import { Employee } from "./types";

// Define valid employee roles
const EMPLOYEE_ROLES = [
  "Manager",
  "Developer",
  "Designer",
  "Sales Representative",
  "Marketing Specialist",
  "Accountant",
  "HR Specialist",
  "Customer Support",
  "Operations",
  "Intern",
  "Consultant",
  "Other",
];

// Define the Employee schema
const EmployeeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      validate: {
        validator: function (value: string) {
          // Name should contain at least 2 characters and allow letters, numbers, spaces, hyphens, apostrophes, and dots
          return /^[a-zA-Z0-9\s\-'.]{2,}$/.test(value);
        },
        message:
          "Name must contain at least 2 characters and only letters, numbers, spaces, hyphens, apostrophes, and dots",
      },
    },
    role: {
      type: String,
      required: [true, "Employee role is required"],
      enum: {
        values: EMPLOYEE_ROLES,
        message: "Role must be one of: {VALUE}",
      },
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary must be positive"],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Salary must be a valid positive number",
      },
    },
    hireDate: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          if (!value) return true; // Optional field

          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) return false;

          // Validate that it's a valid date
          const date = new Date(value);
          return date instanceof Date && !isNaN(date.getTime());
        },
        message: "Hire date must be in YYYY-MM-DD format and be a valid date",
      },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: "employees",
  }
);

// Add indexes for better query performance
EmployeeSchema.index({ userId: 1, name: 1 }); // Compound index for user-specific name queries
EmployeeSchema.index({ userId: 1, role: 1 }); // Compound index for user-specific role queries
EmployeeSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user-specific recent employees

// Create and export the model
const EmployeeModel =
  mongoose.models.Employee ||
  mongoose.model<Employee>("Employee", EmployeeSchema);

export default EmployeeModel;
