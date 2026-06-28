import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError, InternalServerError } from "@/lib/response";
import { purchaseService } from "@/services/purchase.service";
import { createPurchaseSchema } from "@/validation/purchase.validation";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authUser = await AuthenticatinNeed(request);

    // Authorize — admin or manager can create purchase orders
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

    // Validate
    const body = await request.json();
    const result = createPurchaseSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    if (typeof authUser.id !== "number") throw new InternalServerError("Id should be a number")

    // Business Logic
    const purchase = await purchaseService.CreatePurchase(result.data, authUser.id);

    return Response.json(
      new ApiResponse("Purchase order created successfully", purchase),
      { status: 201 }
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    // Authenticate
    await AuthenticatinNeed(request);

    const { searchParams } = new URL(request.url);
    const vendorIdParam = searchParams.get("vendorId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let vendorId: number | undefined;
    if (vendorIdParam) {
      vendorId = Number(vendorIdParam);
      if (!Number.isInteger(vendorId) || vendorId <= 0) {
        throw new BadRequestError("Invalid vendorId.");
      }
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestError("Invalid startDate or endDate.");
      }
    }

    // Business Logic
    const purchases = await purchaseService.ListPurchases(vendorId, startDate, endDate);

    return Response.json(new ApiResponse("Purchases fetched successfully", purchases));
  } catch (error) {
    return authErrorResponse(error);
  }
}