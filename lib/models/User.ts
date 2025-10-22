/** @format */

import mongoose, { Schema, Model } from "mongoose";
import { User } from "./types";
import bcrypt from "bcryptjs";

// Define the User schema
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    businessName: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },
    businessType: {
      type: String,
      required: false,
      enum: [
        "glass-hardware",
        "retail-store",
        "salon",
        "bakery",
        "construction-material",
        "tailoring-shop",
        "electronics-repair",
        "cleaning-service",
        "it-startup",
        "cosmetics-shop",
      ],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: "users",
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for better query performance
UserSchema.index({ email: 1 }); // Index for email queries
UserSchema.index({ createdAt: -1 }); // Index for recent users

// Create and export the model
const UserModel =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
