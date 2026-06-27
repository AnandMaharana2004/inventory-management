import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { itemService } from "@/services/item.service";
import { updateItemSchema } from "@/validation/item.validation";

type RouteParams = { params: { id: string } };

function parseId(idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid item id.");
    }
    return id;
}

const VALID_INCLUDES = ["stock", "purchaseHistory", "salesHistory"] as const;

export async function GET(request: Request, { params }: RouteParams) {
    try {
        // Authenticate — any logged-in role can view an item
        await AuthenticatinNeed(request);

        const id = parseId(params.id);

        const { searchParams } = new URL(request.url);
        const includeParam = searchParams.get("include") ?? undefined;

        if (includeParam && !VALID_INCLUDES.includes(includeParam as any)) {
            throw new BadRequestError(
                "Invalid include. Must be one of: stock, purchaseHistory, salesHistory."
            );
        }

        const item = await itemService.GetItemById(
            id,
            includeParam as (typeof VALID_INCLUDES)[number] | undefined
        );

        return Response.json(new ApiResponse("Item fetched successfully", item));
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can update items
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = parseId(params.id);

        // Validate
        const body = await request.json();
        const result = updateItemSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const item = await itemService.UpdateItem(id, result.data);

        return Response.json(new ApiResponse("Item updated successfully", item));
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can delete items
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = parseId(params.id);

        // Business Logic
        await itemService.DeleteItem(id);

        return Response.json(new ApiResponse("Item deleted successfully", null));
    } catch (error) {
        return authErrorResponse(error);
    }
}