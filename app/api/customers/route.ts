import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { customerService } from "@/services/customer.service";
import { createCustomerSchema } from "@/validation/customer.validation";

export async function POST(request: Request) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — admin or manager can create customers
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        // Validate
        const body = await request.json();
        const result = createCustomerSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const customer = await customerService.CreateCustomer(result.data);

        return Response.json(new ApiResponse("Customer created successfully", customer), {
            status: 201,
        });
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function GET(request: Request) {
    try {
        // Authenticate — any logged-in role can view customers (salesman needs this for billing)
        await AuthenticatinNeed(request);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") ?? undefined;

        // Business Logic
        const customers = await customerService.ListCustomers(search);

        return Response.json(new ApiResponse("Customers fetched successfully", customers));
    } catch (error) {
        return authErrorResponse(error);
    }
}