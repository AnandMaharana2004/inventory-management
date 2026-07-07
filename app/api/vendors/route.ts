import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { vendorService } from "@/services/vendor.service";
import { createVendorSchema } from "@/validation/vendor.validation";

export async function POST(request: Request) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can create vendors
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        // Validate
        const body = await request.json();
        const result = createVendorSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const vendor = await vendorService.CreateVendor(result.data);

        return Response.json(new ApiResponse("Vendor created successfully", vendor), {
            status: 201,
        });
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function GET(request: Request) {
    try {
        // Authenticate — any logged-in role can view vendors
        await AuthenticatinNeed(request);

        // Optional ?search=name query param
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") ?? undefined;

        // Business Logic
        const vendors = await vendorService.ListVendors(search);

        return Response.json(new ApiResponse("Vendors fetched successfully", vendors));
    } catch (error) {
        return authErrorResponse(error);
    }
}