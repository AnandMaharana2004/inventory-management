import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { vendorService } from "@/services/vendor.service";
import { updateVendorSchema } from "@/validation/vendor.validation";

type RouteParams = { params: { id: string } };

function parseId(idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid vendor id.");
    }
    return id;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        // Authenticate — any logged-in role can view a vendor
        await AuthenticatinNeed(request);

        const id = parseId(params.id);

        const vendor = await vendorService.GetVendorById(id);

        return Response.json(new ApiResponse("Vendor fetched successfully", vendor));
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can update vendors
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = parseId(params.id);

        // Validate
        const body = await request.json();
        const result = updateVendorSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const vendor = await vendorService.UpdateVendor(id, result.data);

        return Response.json(new ApiResponse("Vendor updated successfully", vendor));
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can delete vendors
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = parseId(params.id);

        // Business Logic
        await vendorService.DeleteVendor(id);

        return Response.json(new ApiResponse("Vendor deleted successfully", null));
    } catch (error) {
        return authErrorResponse(error);
    }
}