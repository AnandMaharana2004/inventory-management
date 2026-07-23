// app/api/sales/route.ts
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { saleService } from "@/services/sale.service";
import { createSaleSchema } from "@/validation/sale.validation";
import { listSalesQuerySchema } from "@/validation/sale.validation.additions";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authUser = await AuthenticatinNeed(request);

    // Authorize — any role can create a sale
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESMAN);

    // Validate
    const body = await request.json();
    const result = createSaleSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    // Business Logic
    // NOTE: verify `authUser.id` matches the actual field your AuthenticatinNeed returns.
    const sale = await saleService.CreateSale(result.data, authUser?.id || 0);

    return Response.json(new ApiResponse("Sale created successfully", sale), {
      status: 201,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    // Authenticate — any role can view sales
    await AuthenticatinNeed(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    const result = listSalesQuerySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    // Business Logic
    const sales = await saleService.ListSales(
      result.data.customerId,
      result.data.paymentStatus,
      result.data.startDate,
      result.data.endDate
    );

    return Response.json(new ApiResponse("Sales fetched successfully", sales));
  } catch (error) {
    return authErrorResponse(error);
  }
}