// app/api/stock/[itemId]/route.ts
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { stockService } from "@/services/stock.service";
import { itemIdParamSchema } from "@/validation/stock.validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // Authenticate
    await AuthenticatinNeed(request);

    // Validate
    const { itemId } = await params;
    const result = itemIdParamSchema.safeParse({ itemId });
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    // Business Logic
    const stock = await stockService.GetStockByItemId(result.data.itemId);

    return Response.json(new ApiResponse("Stock fetched successfully", stock));
  } catch (error) {
    return authErrorResponse(error);
  }
}