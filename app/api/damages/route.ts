import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError, InternalServerError } from "@/lib/response";
import { damageService } from "@/services/damage.service";
import { createDamageSchema } from "@/validation/damage.validation";

export async function POST(request: Request) {
  try {
    const authUser = await AuthenticatinNeed(request);

    // Recording write-offs is a manager-level call, same tier as item/vendor mutations
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

    const body = await request.json();
    const result = createDamageSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0]?.message);
    }

    if (typeof authUser.id !== "number") throw new InternalServerError("ID should be a number")

    const damage = await damageService.CreateDamage(result.data, authUser.id);

    return Response.json(new ApiResponse("Damage recorded successfully", damage), {
      status: 201,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await AuthenticatinNeed(request);
    requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

    const { searchParams } = new URL(request.url);
    const itemIdParam = searchParams.get("itemId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let itemId: number | undefined;
    if (itemIdParam) {
      itemId = Number(itemIdParam);
      if (!Number.isInteger(itemId) || itemId <= 0) {
        throw new BadRequestError("Invalid itemId.");
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

    const damages = await damageService.ListDamages(itemId, startDate, endDate);

    return Response.json(new ApiResponse("Damages fetched successfully", damages));
  } catch (error) {
    return authErrorResponse(error);
  }
}