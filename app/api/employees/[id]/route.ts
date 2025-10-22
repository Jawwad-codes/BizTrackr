/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import EmployeeModel from "@/lib/models/Employee";
import { Employee, APIResponse } from "@/lib/models/types";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// GET /api/employees/[id] - Get specific employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<Employee>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid employee ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const employee = await EmployeeModel.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPLOYEE_NOT_FOUND",
            message: "Employee not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee as unknown as Employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);

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
          code: "FETCH_EMPLOYEE_ERROR",
          message: "Failed to retrieve employee",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update existing employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<Employee>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid employee ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate salary if provided
    if (
      body.salary !== undefined &&
      (typeof body.salary !== "number" || body.salary < 0)
    ) {
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

    // Validate role if provided
    if (body.role !== undefined) {
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
    }

    // Validate hire date format if provided
    if (body.hireDate !== undefined && body.hireDate !== null) {
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

    // Prepare update data
    const updateData: Partial<Employee> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.role !== undefined) updateData.role = body.role.trim();
    if (body.salary !== undefined) updateData.salary = body.salary;
    if (body.hireDate !== undefined) updateData.hireDate = body.hireDate;

    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { _id: id, userId: user.userId },
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
        lean: true, // Return plain JavaScript object
      }
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPLOYEE_NOT_FOUND",
            message: "Employee not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEmployee as unknown as Employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);

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
          code: "UPDATE_EMPLOYEE_ERROR",
          message: "Failed to update employee",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse<{ id: string }>>> {
  try {
    // Authenticate user
    const user = requireAuth(request);

    await connectToDatabase();

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid employee ID format",
            details: { id },
          },
        },
        { status: 400 }
      );
    }

    const deletedEmployee = await EmployeeModel.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!deletedEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPLOYEE_NOT_FOUND",
            message: "Employee not found",
            details: { id },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error("Error deleting employee:", error);

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
          code: "DELETE_EMPLOYEE_ERROR",
          message: "Failed to delete employee",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
