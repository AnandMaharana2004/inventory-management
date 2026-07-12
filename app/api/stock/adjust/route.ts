// app/api/stock/adjust/route.ts
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError, InternalServerError } from "@/lib/response";
import { stockService } from "@/services/stock.service";
import { adjustStockSchema } from "@/validation/stock.validation";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authUser = await AuthenticatinNeed(request);

    // Authorize — admin or manager can adjust stock
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

    // Validate
    const body = await request.json();
    const result = adjustStockSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    if (typeof authUser.id !== "number") throw new InternalServerError("Id should be a number")

    // Business Logic
    const stock = await stockService.AdjustStock(result.data, authUser.id);

    return Response.json(
      new ApiResponse("Stock adjusted successfully", stock)
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}