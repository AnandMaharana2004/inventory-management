import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { customerService } from "@/services/customer.service";
import { updateCustomerSchema } from "@/validation/customer.validation";

type RouteParams = { params: { id: string } };

function parseId(idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid customer id.");
    }
    return id;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        // Authenticate — any logged-in role can view a customer
        await AuthenticatinNeed(request);

        const id = parseId(params.id);

        const { searchParams } = new URL(request.url);
        const includeBills = searchParams.get("include") === "bills";

        const customer = await customerService.GetCustomerById(id, includeBills);

        return Response.json(new ApiResponse("Customer fetched successfully", customer));
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can update customers
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = parseId(params.id);

        // Validate
        const body = await request.json();
        const result = updateCustomerSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const customer = await customerService.UpdateCustomer(id, result.data);

        return Response.json(new ApiResponse("Customer updated successfully", customer));
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can delete customers
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = parseId(params.id);

        // Business Logic
        await customerService.DeleteCustomer(id);

        return Response.json(new ApiResponse("Customer deleted successfully", null));
    } catch (error) {
        return authErrorResponse(error);
    }
}