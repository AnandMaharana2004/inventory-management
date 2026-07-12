// app/api/stock/opening/route.ts
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError, InternalServerError } from "@/lib/response";
import { stockService } from "@/services/stock.service";
import { createOpeningStockSchema } from "@/validation/stock.validation";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authUser = await AuthenticatinNeed(request);

    // Authorize — admin or manager can set opening stock
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

    // Validate
    const body = await request.json();
    const result = createOpeningStockSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    if (typeof authUser.id !== "number") throw new InternalServerError("Id should be a number")

    // Business Logic
    const stock = await stockService.CreateOpeningStock(result.data, authUser.id);

    return Response.json(
      new ApiResponse("Opening stock created successfully", stock),
      { status: 201 }
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}