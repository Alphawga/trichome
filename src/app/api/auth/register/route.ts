import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { signUpApiSchema } from "@/lib/validations/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convert camelCase to snake_case for validation schema
    const bodyForValidation = {
      first_name: body.firstName || body.first_name,
      last_name: body.lastName || body.last_name,
      email: body.email,
      phone: body.phone || "",
      password: body.password,
    };

    const validatedData = signUpApiSchema.parse(bodyForValidation);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
          field: "email",
        },
        { status: 409 },
      );
    }

    if (validatedData.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: validatedData.phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            message: "An account with this phone number already exists",
            field: "phone",
          },
          { status: 409 },
        );
      }
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(validatedData.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: passwordValidation.error || "Invalid password" },
        { status: 400 },
      );
    }

    // Hash password following security best practices
    const hashedPassword = await hashPassword(validatedData.password);

    // Create new user using Prisma-generated types
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password_hash: hashedPassword,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        name: `${validatedData.first_name} ${validatedData.last_name}`,
        phone: validatedData.phone,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    // Following CODING_RULES.md - proper error handling
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target[0] : undefined;
      return NextResponse.json(
        {
          message:
            field === "phone"
              ? "An account with this phone number already exists"
              : "An account with this email already exists",
          field: field === "phone" ? "phone" : "email",
        },
        { status: 409 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
