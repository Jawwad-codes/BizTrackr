/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getUserFromRequest } from "@/lib/auth";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import EmployeeModel from "@/lib/models/Employee";
import InventoryModel from "@/lib/models/Inventory";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Generate sample data for the last 30 days
    const sampleData = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate random sales (1-5 sales per day)
      const numSales = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numSales; j++) {
        const saleAmount = Math.floor(Math.random() * 500) + 50; // $50-$550
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
        const items = [
          "Product A",
          "Product B",
          "Product C",
          "Service X",
          "Service Y",
        ];
        const item = items[Math.floor(Math.random() * items.length)];

        sampleData.push({
          type: "sale",
          data: {
            userId: user.userId,
            item,
            amount: saleAmount,
            quantity,
            date: dateStr,
          },
        });
      }

      // Generate random expenses (0-3 expenses per day)
      const numExpenses = Math.floor(Math.random() * 4);
      for (let j = 0; j < numExpenses; j++) {
        const expenseAmount = Math.floor(Math.random() * 200) + 20; // $20-$220
        const categories = [
          "Office Supplies",
          "Marketing",
          "Utilities",
          "Software",
          "Travel",
        ];
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const descriptions: { [key: string]: string[] } = {
          "Office Supplies": [
            "Printer paper",
            "Pens and pencils",
            "Folders",
            "Desk supplies",
          ],
          Marketing: [
            "Social media ads",
            "Print materials",
            "Website hosting",
            "SEO tools",
          ],
          Utilities: [
            "Electricity bill",
            "Internet service",
            "Phone service",
            "Water bill",
          ],
          Software: [
            "License renewal",
            "Cloud storage",
            "Development tools",
            "Design software",
          ],
          Travel: [
            "Client meeting",
            "Conference attendance",
            "Business trip",
            "Transportation",
          ],
        };
        const description =
          descriptions[category][
            Math.floor(Math.random() * descriptions[category].length)
          ];

        sampleData.push({
          type: "expense",
          data: {
            userId: user.userId,
            category,
            description,
            amount: expenseAmount,
            date: dateStr,
          },
        });
      }
    }

    // Generate sample employees if none exist
    const existingEmployees = await EmployeeModel.countDocuments({
      userId: user.userId,
    });
    if (existingEmployees === 0) {
      const employees = [
        { name: "John Smith", role: "Manager", salary: 5000 },
        { name: "Sarah Johnson", role: "Developer", salary: 4000 },
        { name: "Mike Wilson", role: "Designer", salary: 3500 },
        { name: "Lisa Brown", role: "Sales Representative", salary: 3000 },
      ];

      for (const emp of employees) {
        sampleData.push({
          type: "employee",
          data: {
            userId: user.userId,
            ...emp,
            hireDate: new Date(
              Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
          },
        });
      }
    }

    // Generate sample inventory if none exists
    const existingInventory = await InventoryModel.countDocuments({
      userId: user.userId,
    });
    if (existingInventory === 0) {
      const products = [
        {
          productName: "Laptop Computer",
          category: "Electronics",
          stock: 15,
          costPrice: 800,
          sellingPrice: 1200,
          reorderLevel: 5,
          unit: "piece",
        },
        {
          productName: "Office Chair",
          category: "Office Supplies",
          stock: 25,
          costPrice: 150,
          sellingPrice: 250,
          reorderLevel: 10,
          unit: "piece",
        },
        {
          productName: "Smartphone",
          category: "Electronics",
          stock: 8,
          costPrice: 400,
          sellingPrice: 600,
          reorderLevel: 5,
          unit: "piece",
        },
        {
          productName: "Desk Lamp",
          category: "Office Supplies",
          stock: 30,
          costPrice: 25,
          sellingPrice: 45,
          reorderLevel: 15,
          unit: "piece",
        },
        {
          productName: "Software License",
          category: "Software",
          stock: 50,
          costPrice: 100,
          sellingPrice: 150,
          reorderLevel: 20,
          unit: "piece",
        },
      ];

      for (const product of products) {
        sampleData.push({
          type: "inventory",
          data: {
            userId: user.userId,
            ...product,
            description: `High-quality ${product.productName.toLowerCase()}`,
          },
        });
      }
    }

    // Insert sample data
    let salesCreated = 0;
    let expensesCreated = 0;
    let employeesCreated = 0;
    let inventoryCreated = 0;

    for (const item of sampleData) {
      try {
        switch (item.type) {
          case "sale":
            await SaleModel.create(item.data);
            salesCreated++;
            break;
          case "expense":
            await ExpenseModel.create(item.data);
            expensesCreated++;
            break;
          case "employee":
            await EmployeeModel.create(item.data);
            employeesCreated++;
            break;
          case "inventory":
            await InventoryModel.create(item.data);
            inventoryCreated++;
            break;
        }
      } catch (error) {
        console.error(`Error creating ${item.type}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Sample data generated successfully",
        created: {
          sales: salesCreated,
          expenses: expensesCreated,
          employees: employeesCreated,
          inventory: inventoryCreated,
        },
      },
    });
  } catch (error) {
    console.error("Error generating sample data:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SAMPLE_DATA_ERROR",
          message: "Failed to generate sample data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
