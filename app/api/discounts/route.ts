import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { discountService } from "@/services/discount.service";
import { createDiscountSchema } from "@/validation/discount.validation";

export async function POST(request: Request) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can create discounts
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        // Validate
        const body = await request.json();
        const result = createDiscountSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        if (!authUser || typeof authUser.id !== "number") {
            throw new BadRequestError("Invalid user id");
        }
        const discount = await discountService.CreateDiscount(result.data, authUser.id);

        return Response.json(new ApiResponse("Discount created successfully", discount), {
            status: 201,
        });
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function GET(request: Request) {
    try {
        // Authenticate — any logged-in role can view discounts (needed at billing time too)
        await AuthenticatinNeed(request);

        // Parse filter query param
        const { searchParams } = new URL(request.url);
        const filterParam = searchParams.get("filter") ?? "current";

        if (!["all", "active", "current"].includes(filterParam)) {
            throw new BadRequestError(
                "Invalid filter. Must be one of: all, active, current."
            );
        }

        // Business Logic
        const discounts = await discountService.ListDiscounts(
            filterParam as "all" | "active" | "current"
        );

        return Response.json(
            new ApiResponse("Discounts fetched successfully", discounts)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}