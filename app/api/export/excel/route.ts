/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getUserFromRequest } from "@/lib/auth";
import { ExcelExporter } from "@/lib/excel-export";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import EmployeeModel from "@/lib/models/Employee";
import InventoryModel from "@/lib/models/Inventory";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("type") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter if provided
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Create Excel exporter
    const exporter = new ExcelExporter();

    // Fetch data based on export type
    if (exportType === "all" || exportType === "sales") {
      const salesFilter = { userId: user.userId, ...dateFilter };
      const sales = await SaleModel.find(salesFilter).sort({ date: -1 }).lean();
      exporter.addSalesSheet(sales as any);
    }

    if (exportType === "all" || exportType === "expenses") {
      const expensesFilter = { userId: user.userId, ...dateFilter };
      const expenses = await ExpenseModel.find(expensesFilter)
        .sort({ date: -1 })
        .lean();
      exporter.addExpensesSheet(expenses as any);
    }

    if (exportType === "all" || exportType === "employees") {
      const employees = await EmployeeModel.find({ userId: user.userId })
        .sort({ name: 1 })
        .lean();
      exporter.addEmployeesSheet(employees as any);
    }

    if (exportType === "all" || exportType === "inventory") {
      const inventory = await InventoryModel.find({ userId: user.userId })
        .sort({ productName: 1 })
        .lean();
      exporter.addInventorySheet(inventory as any);
    }

    // Add dashboard sheet for comprehensive export
    if (exportType === "all") {
      const [sales, expenses, employees, inventory] = await Promise.all([
        SaleModel.find({ userId: user.userId }).sort({ date: -1 }).lean(),
        ExpenseModel.find({ userId: user.userId }).sort({ date: -1 }).lean(),
        EmployeeModel.find({ userId: user.userId }).sort({ name: 1 }).lean(),
        InventoryModel.find({ userId: user.userId })
          .sort({ productName: 1 })
          .lean(),
      ]);

      exporter.addDashboardSheet({
        sales: sales as any,
        expenses: expenses as any,
        employees: employees as any,
        inventory: inventory as any,
      });
    }

    // Generate file
    const buffer = exporter.generateExcel();

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `business-export-${exportType}-${timestamp}.xlsx`;

    // Return file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EXPORT_ERROR",
          message: "Failed to generate Excel export",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

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

    // Get request body
    const body = await request.json();
    const { exportType = "all", dateRange, includeMetadata = true } = body;

    // Connect to database
    await connectToDatabase();

    // Build date filter if provided
    const dateFilter: any = {};
    if (dateRange?.start && dateRange?.end) {
      dateFilter.date = {
        $gte: dateRange.start,
        $lte: dateRange.end,
      };
    }

    // Create Excel exporter
    const exporter = new ExcelExporter();

    // Fetch and add data based on export type
    if (exportType === "all" || exportType === "sales") {
      const salesFilter = { userId: user.userId, ...dateFilter };
      const sales = await SaleModel.find(salesFilter).sort({ date: -1 }).lean();
      exporter.addSalesSheet(sales as any, { includeMetadata, dateRange });
    }

    if (exportType === "all" || exportType === "expenses") {
      const expensesFilter = { userId: user.userId, ...dateFilter };
      const expenses = await ExpenseModel.find(expensesFilter)
        .sort({ date: -1 })
        .lean();
      exporter.addExpensesSheet(expenses as any, {
        includeMetadata,
        dateRange,
      });
    }

    if (exportType === "all" || exportType === "employees") {
      const employees = await EmployeeModel.find({ userId: user.userId })
        .sort({ name: 1 })
        .lean();
      exporter.addEmployeesSheet(employees as any, {
        includeMetadata,
        dateRange,
      });
    }

    if (exportType === "all" || exportType === "inventory") {
      const inventory = await InventoryModel.find({ userId: user.userId })
        .sort({ productName: 1 })
        .lean();
      exporter.addInventorySheet(inventory as any, {
        includeMetadata,
        dateRange,
      });
    }

    // Add dashboard sheet for comprehensive export
    if (exportType === "all") {
      const [sales, expenses, employees, inventory] = await Promise.all([
        SaleModel.find({ userId: user.userId }).sort({ date: -1 }).lean(),
        ExpenseModel.find({ userId: user.userId }).sort({ date: -1 }).lean(),
        EmployeeModel.find({ userId: user.userId }).sort({ name: 1 }).lean(),
        InventoryModel.find({ userId: user.userId })
          .sort({ productName: 1 })
          .lean(),
      ]);

      exporter.addDashboardSheet({
        sales: sales as any,
        expenses: expenses as any,
        employees: employees as any,
        inventory: inventory as any,
      });
    }

    // Generate file
    const buffer = exporter.generateExcel();

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `business-export-${exportType}-${timestamp}.xlsx`;

    // Return file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EXPORT_ERROR",
          message: "Failed to generate Excel export",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
