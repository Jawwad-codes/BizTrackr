/** @format */

import * as XLSX from "xlsx";
import { Sale, Expense, Employee, Inventory, User } from "./models/types";

export interface ExcelExportOptions {
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  format?: "xlsx" | "csv";
}

export class ExcelExporter {
  private workbook: XLSX.WorkBook;

  constructor() {
    this.workbook = XLSX.utils.book_new();
  }

  // Format currency values
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  // Format date for display
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  // Add sales data to workbook
  addSalesSheet(sales: Sale[], options: ExcelExportOptions = {}) {
    const worksheetData = [
      // Header row
      ["Sales Report", "", "", "", ""],
      ["Generated on:", new Date().toLocaleDateString(), "", "", ""],
      ["", "", "", "", ""],
      ["Item", "Quantity", "Amount", "Date", "Total Value"],
    ];

    // Add sales data
    let totalSales = 0;
    let totalQuantity = 0;

    sales.forEach((sale) => {
      const totalValue = sale.amount * sale.quantity;
      totalSales += totalValue;
      totalQuantity += sale.quantity;

      worksheetData.push([
        sale.item,
        sale.quantity.toString(),
        this.formatCurrency(sale.amount),
        this.formatDate(sale.date),
        this.formatCurrency(totalValue),
      ]);
    });

    // Add summary row
    worksheetData.push(["", "", "", "", ""]);
    worksheetData.push([
      "TOTALS",
      totalQuantity.toString(),
      "",
      "",
      this.formatCurrency(totalSales),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet["!cols"] = [
      { width: 25 }, // Item
      { width: 10 }, // Quantity
      { width: 15 }, // Amount
      { width: 15 }, // Date
      { width: 15 }, // Total Value
    ];

    // Style the header
    worksheet["A1"].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: "center" },
    };

    XLSX.utils.book_append_sheet(this.workbook, worksheet, "Sales");
  }

  // Add expenses data to workbook
  addExpensesSheet(expenses: Expense[], options: ExcelExportOptions = {}) {
    const worksheetData = [
      ["Expenses Report", "", "", "", ""],
      ["Generated on:", new Date().toLocaleDateString(), "", "", ""],
      ["", "", "", "", ""],
      ["Category", "Description", "Amount", "Date", "Month"],
    ];

    let totalExpenses = 0;
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      totalExpenses += expense.amount;
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;

      const date = new Date(expense.date);
      const month = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      worksheetData.push([
        expense.category,
        expense.description,
        this.formatCurrency(expense.amount),
        this.formatDate(expense.date),
        month,
      ]);
    });

    // Add category breakdown
    worksheetData.push(["", "", "", "", ""]);
    worksheetData.push(["CATEGORY BREAKDOWN", "", "", "", ""]);
    Object.entries(categoryTotals).forEach(([category, total]) => {
      const percentage = ((total / totalExpenses) * 100).toFixed(1);
      worksheetData.push([
        category,
        "",
        this.formatCurrency(total),
        `${percentage}%`,
        "",
      ]);
    });

    worksheetData.push(["", "", "", "", ""]);
    worksheetData.push([
      "TOTAL EXPENSES",
      "",
      this.formatCurrency(totalExpenses),
      "",
      "",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!cols"] = [
      { width: 20 }, // Category
      { width: 30 }, // Description
      { width: 15 }, // Amount
      { width: 15 }, // Date
      { width: 15 }, // Month
    ];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, "Expenses");
  }

  // Add employees data to workbook
  addEmployeesSheet(employees: Employee[], options: ExcelExportOptions = {}) {
    const worksheetData = [
      ["Employees Report", "", "", "", ""],
      ["Generated on:", new Date().toLocaleDateString(), "", "", ""],
      ["", "", "", "", ""],
      ["Name", "Role", "Salary", "Hire Date", "Years Employed"],
    ];

    let totalSalary = 0;
    const roleCounts: { [key: string]: number } = {};

    employees.forEach((employee) => {
      totalSalary += employee.salary;
      roleCounts[employee.role] = (roleCounts[employee.role] || 0) + 1;

      let yearsEmployed = "";
      if (employee.hireDate) {
        const hireDate = new Date(employee.hireDate);
        const today = new Date();
        const years =
          (today.getTime() - hireDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365.25);
        yearsEmployed = years.toFixed(1);
      }

      worksheetData.push([
        employee.name,
        employee.role,
        this.formatCurrency(employee.salary),
        employee.hireDate ? this.formatDate(employee.hireDate) : "N/A",
        yearsEmployed,
      ]);
    });

    // Add role breakdown
    worksheetData.push(["", "", "", "", ""]);
    worksheetData.push(["ROLE BREAKDOWN", "", "", "", ""]);
    Object.entries(roleCounts).forEach(([role, count]) => {
      worksheetData.push([role, `${count} employees`, "", "", ""]);
    });

    worksheetData.push(["", "", "", "", ""]);
    worksheetData.push([
      "TOTAL EMPLOYEES",
      employees.length.toString(),
      "",
      "",
      "",
    ]);
    worksheetData.push([
      "TOTAL SALARY COST",
      "",
      this.formatCurrency(totalSalary),
      "",
      "",
    ]);
    worksheetData.push([
      "AVERAGE SALARY",
      "",
      this.formatCurrency(totalSalary / employees.length),
      "",
      "",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!cols"] = [
      { width: 25 }, // Name
      { width: 20 }, // Role
      { width: 15 }, // Salary
      { width: 15 }, // Hire Date
      { width: 15 }, // Years Employed
    ];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, "Employees");
  }

  // Add inventory data to workbook
  addInventorySheet(inventory: Inventory[], options: ExcelExportOptions = {}) {
    const worksheetData = [
      ["Inventory Report", "", "", "", "", "", "", ""],
      [
        "Generated on:",
        new Date().toLocaleDateString(),
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      ["", "", "", "", "", "", "", ""],
      [
        "Product",
        "Category",
        "Stock",
        "Cost Price",
        "Selling Price",
        "Profit Margin",
        "Status",
        "Total Value",
      ],
    ];

    let totalInventoryValue = 0;
    let lowStockCount = 0;
    const categoryBreakdown: {
      [key: string]: { count: number; value: number };
    } = {};

    inventory.forEach((item) => {
      const profitMargin =
        item.costPrice > 0
          ? (
              ((item.sellingPrice - item.costPrice) / item.costPrice) *
              100
            ).toFixed(1) + "%"
          : "N/A";

      const status = item.stock <= item.reorderLevel ? "LOW STOCK" : "OK";
      if (item.stock <= item.reorderLevel) lowStockCount++;

      const totalValue = item.stock * item.costPrice;
      totalInventoryValue += totalValue;

      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { count: 0, value: 0 };
      }
      categoryBreakdown[item.category].count++;
      categoryBreakdown[item.category].value += totalValue;

      worksheetData.push([
        item.productName,
        item.category,
        `${item.stock} ${item.unit}`,
        this.formatCurrency(item.costPrice),
        this.formatCurrency(item.sellingPrice),
        profitMargin,
        status,
        this.formatCurrency(totalValue),
      ]);
    });

    // Add category breakdown
    worksheetData.push(["", "", "", "", "", "", "", ""]);
    worksheetData.push(["CATEGORY BREAKDOWN", "", "", "", "", "", "", ""]);
    Object.entries(categoryBreakdown).forEach(([category, data]) => {
      const percentage = ((data.value / totalInventoryValue) * 100).toFixed(1);
      worksheetData.push([
        category,
        `${data.count} items`,
        "",
        "",
        "",
        `${percentage}%`,
        "",
        this.formatCurrency(data.value),
      ]);
    });

    worksheetData.push(["", "", "", "", "", "", "", ""]);
    worksheetData.push(["SUMMARY", "", "", "", "", "", "", ""]);
    worksheetData.push([
      "Total Products",
      inventory.length.toString(),
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    worksheetData.push([
      "Low Stock Items",
      lowStockCount.toString(),
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    worksheetData.push([
      "Total Inventory Value",
      "",
      "",
      "",
      "",
      "",
      "",
      this.formatCurrency(totalInventoryValue),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!cols"] = [
      { width: 25 }, // Product
      { width: 15 }, // Category
      { width: 12 }, // Stock
      { width: 12 }, // Cost Price
      { width: 12 }, // Selling Price
      { width: 12 }, // Profit Margin
      { width: 12 }, // Status
      { width: 15 }, // Total Value
    ];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, "Inventory");
  }

  // Add comprehensive dashboard sheet
  addDashboardSheet(data: {
    sales: Sale[];
    expenses: Expense[];
    employees: Employee[];
    inventory: Inventory[];
  }) {
    const totalSales = data.sales.reduce(
      (sum, sale) => sum + sale.amount * sale.quantity,
      0
    );
    const totalExpenses = data.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const totalSalaries = data.employees.reduce(
      (sum, emp) => sum + emp.salary,
      0
    );
    const totalInventoryValue = data.inventory.reduce(
      (sum, item) => sum + item.stock * item.costPrice,
      0
    );
    const netProfit = totalSales - totalExpenses;
    const profitMargin =
      totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0";

    const worksheetData = [
      ["BUSINESS DASHBOARD", "", "", ""],
      ["Generated on:", new Date().toLocaleDateString(), "", ""],
      ["", "", "", ""],
      ["KEY METRICS", "", "", ""],
      ["Total Sales", this.formatCurrency(totalSales), "", ""],
      ["Total Expenses", this.formatCurrency(totalExpenses), "", ""],
      ["Net Profit", this.formatCurrency(netProfit), "", ""],
      ["Profit Margin", `${profitMargin}%`, "", ""],
      ["", "", "", ""],
      ["OPERATIONAL METRICS", "", "", ""],
      ["Total Employees", data.employees.length.toString(), "", ""],
      ["Total Salary Cost", this.formatCurrency(totalSalaries), "", ""],
      ["Total Products", data.inventory.length.toString(), "", ""],
      ["Inventory Value", this.formatCurrency(totalInventoryValue), "", ""],
      [
        "Low Stock Items",
        data.inventory
          .filter((item) => item.stock <= item.reorderLevel)
          .length.toString(),
        "",
        "",
      ],
      ["", "", "", ""],
      ["RECENT ACTIVITY", "", "", ""],
      ["Recent Sales", data.sales.slice(-5).length.toString(), "", ""],
      ["Recent Expenses", data.expenses.slice(-5).length.toString(), "", ""],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!cols"] = [
      { width: 25 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
    ];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, "Dashboard");
  }

  // Generate and return the Excel file buffer
  generateExcel(): Buffer {
    return XLSX.write(this.workbook, { type: "buffer", bookType: "xlsx" });
  }

  // Generate CSV for a specific sheet
  generateCSV(sheetName: string): string {
    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    return XLSX.utils.sheet_to_csv(worksheet);
  }
}
