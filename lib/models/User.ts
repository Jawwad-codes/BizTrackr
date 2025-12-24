/** @format */

import mongoose, { Schema, Model } from "mongoose";
import { User } from "./types";
import bcrypt from "bcryptjs";

// Define the User schema
const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Keep this, Mongoose will create the index
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
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
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },
    businessType: {
      type: String,
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
    timestamps: true,
    collection: "users",
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
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

// Keep only additional indexes
UserSchema.index({ createdAt: -1 }); // For recent users queries

// Create and export the model
const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
