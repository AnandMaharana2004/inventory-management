import { UserRole } from "@/lib/generated/prisma/client";
import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError, InternalServerError } from "@/lib/response";
import { saleService } from "@/services/sale.service";
import { createSaleSchema } from "@/validation/sale.validation";

export async function POST(request: Request) {
  try {
    const authUser = await AuthenticatinNeed(request);

    // Billing is a salesman's core job — manager/admin can also create on their behalf
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESMAN);

    const body = await request.json();
    const result = createSaleSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    if (typeof authUser.id !== "number") throw new InternalServerError("Id should be a number")

    const sale = await saleService.CreateSale(result.data, authUser.id);

    return Response.json(new ApiResponse("Sale bill created successfully", sale), {
      status: 201,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    await AuthenticatinNeed(request);

    const { searchParams } = new URL(request.url);
    const customerIdParam = searchParams.get("customerId");
    const paymentStatusParam = searchParams.get("paymentStatus");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let customerId: number | undefined;
    if (customerIdParam) {
      customerId = Number(customerIdParam);
      if (!Number.isInteger(customerId) || customerId <= 0) {
        throw new BadRequestError("Invalid customerId.");
      }
    }

    let paymentStatus: PaymentStatus | undefined;
    if (paymentStatusParam) {
      if (!Object.values(PaymentStatus).includes(paymentStatusParam as PaymentStatus)) {
        throw new BadRequestError("Invalid paymentStatus.");
      }
      paymentStatus = paymentStatusParam as PaymentStatus;
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

    const sales = await saleService.ListSales(customerId, paymentStatus, startDate, endDate);

    return Response.json(new ApiResponse("Sales fetched successfully", sales));
  } catch (error) {
    return authErrorResponse(error);
  }
}