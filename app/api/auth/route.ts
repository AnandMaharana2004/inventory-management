import { cookies } from "next/headers";

import { Env } from "@/constants/env";
import { AUTH_TOKEN_COOKIE_NAME, getAuthTokenMaxAgeSeconds } from "@/lib/auth";

import { ApiResponse, AppError, BadRequestError } from "@/lib/response";

import { authService } from "@/services/auth.service";
import { loginSchema } from "@/validation/auth.validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);



    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message || "Invalid request data");
    }

    const { token, user } = await authService.Login(result.data);

    const cookieStore = await cookies();

    cookieStore.set(AUTH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: getAuthTokenMaxAgeSeconds(),
    });

    return Response.json(
      new ApiResponse("User logged in successfully", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        {
          success: error.success,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Unable to login. Please try again.",
      },
      { status: 500 },
    );
  }
}
