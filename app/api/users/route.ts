import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { userService } from "@/services/user.service";
import { createUserSchema } from "@/validation/user.validation";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authUser = await AuthenticatinNeed(request);

    // Authorize — only admin can create users
    requireRole(authUser, UserRole.ADMIN);

    // Validate
    const body = await request.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    // Business Logic
    const user = await userService.CreateUser(result.data);

    return Response.json(new ApiResponse("User created successfully", user), {
      status: 201,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    // Authenticate
    const authUser = await AuthenticatinNeed(request);

    // Authorize — only admin can list all users
    requireRole(authUser, UserRole.ADMIN);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;

    // Business Logic
    const users = await userService.ListUsers(search);

    return Response.json(new ApiResponse("Users fetched successfully", users));
  } catch (error) {
    return authErrorResponse(error);
  }
}