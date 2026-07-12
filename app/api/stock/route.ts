// app/api/stock/route.ts
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse } from "@/lib/response";
import { stockService } from "@/services/stock.service";

export async function GET(request: Request) {
  try {
    // Authenticate
    await AuthenticatinNeed(request);

    const { searchParams } = new URL(request.url);
    const lowStockOnly = searchParams.get("lowStock") === "true";

    // Business Logic
    const stocks = lowStockOnly
      ? await stockService.GetLowStockItems()
      : await stockService.GetAllStocks();

    return Response.json(new ApiResponse("Stocks fetched successfully", stocks));
  } catch (error) {
    return authErrorResponse(error);
  }
}