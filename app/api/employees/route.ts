/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import EmployeeModel from "@/lib/models/Employee";
import { Employee, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";

// GET /api/employees - Retrieve all employees
export async function GET(
  request: NextRequest
): Promise<NextResponse<APIResponse<Employee[]>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const employees = await EmployeeModel.find({ userId: user.userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Return plain JavaScript objects for better performance

    return NextResponse.json({
      success: true,
      data: employees as unknown as Employee[],
    });
  } catch (error) {
    console.error("Error fetching employees:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_EMPLOYEES_ERROR",
          message: "Failed to retrieve employees data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create new employee
export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResponse<Employee>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.role || body.salary === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Missing required fields: name, role, and salary are required",
            details: { received: body },
          },
        },
        { status: 400 }
      );
    }

    // Validate salary is a positive number
    if (typeof body.salary !== "number" || body.salary < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Salary must be a positive number",
            details: { salary: body.salary },
          },
        },
        { status: 400 }
      );
    }

    // Validate role against allowed values
    const validRoles = [
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

    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Role must be one of: ${validRoles.join(", ")}`,
            details: { role: body.role, validRoles },
          },
        },
        { status: 400 }
      );
    }

    // Validate hire date format if provided (optional field)
    if (body.hireDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.hireDate)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Hire date must be in YYYY-MM-DD format",
              details: { hireDate: body.hireDate },
            },
          },
          { status: 400 }
        );
      }

      // Validate that it's a valid date
      const date = new Date(body.hireDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Hire date must be a valid date",
              details: { hireDate: body.hireDate },
            },
          },
          { status: 400 }
        );
      }
    }

    // Create new employee
    const employeeData: Partial<Employee> = {
      userId: user.userId,
      name: body.name.trim(),
      role: body.role.trim(),
      salary: body.salary,
    };

    // Add hire date if provided
    if (body.hireDate) {
      employeeData.hireDate = body.hireDate;
    }

    const newEmployee = new EmployeeModel(employeeData);
    const savedEmployee = await newEmployee.save();

    return NextResponse.json(
      {
        success: true,
        data: savedEmployee.toObject() as Employee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid employee data",
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_EMPLOYEE_ERROR",
          message: "Failed to create employee",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
