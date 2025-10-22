/** @format */

import { BusinessType } from "./models/types";

export interface BusinessConfig {
  label: string;
  emoji: string;
  itemLabel: string;
  quantityLabel: string;
  priceLabel: string;
  defaultUnit: string;
  categories: string[];
}

export const businessConfigs: Record<BusinessType, BusinessConfig> = {
  "glass-hardware": {
    label: "Glass/Hardware",
    emoji: "🪞",
    itemLabel: "Product Name",
    quantityLabel: "Quantity (Boxes)",
    priceLabel: "Price",
    defaultUnit: "box",
    categories: ["Glass Sheets", "Hardware", "Tools", "Accessories", "Mirrors"],
  },
  "retail-store": {
    label: "Retail Store",
    emoji: "🛍️",
    itemLabel: "Product Name",
    quantityLabel: "Quantity (Pieces)",
    priceLabel: "Price",
    defaultUnit: "piece",
    categories: [
      "Clothing",
      "Electronics",
      "Home & Garden",
      "Books",
      "Accessories",
    ],
  },
  salon: {
    label: "Salon",
    emoji: "💇",
    itemLabel: "Service Name",
    quantityLabel: "Sessions",
    priceLabel: "Price",
    defaultUnit: "service",
    categories: [
      "Hair Cut",
      "Hair Color",
      "Facial",
      "Manicure",
      "Pedicure",
      "Massage",
    ],
  },
  bakery: {
    label: "Bakery",
    emoji: "🍰",
    itemLabel: "Item Name",
    quantityLabel: "Quantity (Pieces)",
    priceLabel: "Price",
    defaultUnit: "piece",
    categories: ["Cakes", "Pastries", "Bread", "Cookies", "Custom Orders"],
  },
  "construction-material": {
    label: "Construction Material",
    emoji: "🧱",
    itemLabel: "Material Name",
    quantityLabel: "Quantity (Units)",
    priceLabel: "Price",
    defaultUnit: "piece",
    categories: ["Cement", "Bricks", "Steel", "Sand", "Gravel", "Pipes"],
  },
  "tailoring-shop": {
    label: "Tailoring Shop",
    emoji: "🧵",
    itemLabel: "Garment Type",
    quantityLabel: "Pieces",
    priceLabel: "Price",
    defaultUnit: "piece",
    categories: [
      "Shirts",
      "Pants",
      "Dresses",
      "Suits",
      "Alterations",
      "Custom",
    ],
  },
  "electronics-repair": {
    label: "Electronics Repair",
    emoji: "💡",
    itemLabel: "Service/Part",
    quantityLabel: "Units",
    priceLabel: "Price",
    defaultUnit: "service",
    categories: [
      "Phone Repair",
      "Laptop Repair",
      "TV Repair",
      "Parts",
      "Diagnostics",
    ],
  },
  "cleaning-service": {
    label: "Cleaning Service",
    emoji: "🧽",
    itemLabel: "Service Type",
    quantityLabel: "Hours/Sessions",
    priceLabel: "Price",
    defaultUnit: "hour",
    categories: [
      "House Cleaning",
      "Office Cleaning",
      "Deep Cleaning",
      "Carpet Cleaning",
      "Window Cleaning",
    ],
  },
  "it-startup": {
    label: "IT Startup",
    emoji: "🖥️",
    itemLabel: "Service/Product",
    quantityLabel: "Units/Hours",
    priceLabel: "Price",
    defaultUnit: "service",
    categories: [
      "Web Development",
      "Mobile Apps",
      "Consulting",
      "Software",
      "Support",
    ],
  },
  "cosmetics-shop": {
    label: "Cosmetics Shop",
    emoji: "🧴",
    itemLabel: "Product Name",
    quantityLabel: "Quantity (Pieces)",
    priceLabel: "Price",
    defaultUnit: "piece",
    categories: ["Skincare", "Makeup", "Fragrances", "Hair Care", "Body Care"],
  },
};

export function getBusinessConfig(businessType: BusinessType): BusinessConfig {
  return businessConfigs[businessType];
}

export function getBusinessTypeLabel(businessType: BusinessType): string {
  return businessConfigs[businessType]?.label || businessType;
}

export function getBusinessTypeEmoji(businessType: BusinessType): string {
  return businessConfigs[businessType]?.emoji || "🏢";
}
