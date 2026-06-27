import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { itemService } from "@/services/item.service";
import { createItemSchema } from "@/validation/item.validation";

export async function POST(request: Request) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can create items
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        // Validate
        const body = await request.json();
        const result = createItemSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const item = await itemService.CreateItem(result.data);

        return Response.json(new ApiResponse("Item created successfully", item), {
            status: 201,
        });
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function GET(request: Request) {
    try {
        // Authenticate — any logged-in role can view items
        await AuthenticatinNeed(request);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") ?? undefined;
        const statusParam = searchParams.get("status") ?? "all";

        if (!["all", "active"].includes(statusParam)) {
            throw new BadRequestError("Invalid status. Must be one of: all, active.");
        }

        // Business Logic
        const items = await itemService.ListItems(search, statusParam as "all" | "active");

        return Response.json(new ApiResponse("Items fetched successfully", items));
    } catch (error) {
        return authErrorResponse(error);
    }
}