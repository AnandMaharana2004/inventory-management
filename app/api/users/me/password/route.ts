import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse, BadRequestError, InternalServerError } from "@/lib/response";
import { userService } from "@/services/user.service";
import { changePasswordSchema } from "@/validation/user.validation";

export async function PATCH(request: Request) {
    try {
        // Authenticate — no role check needed; every role can change their own password
        const authUser = await AuthenticatinNeed(request);

        // Validate
        const body = await request.json();
        const result = changePasswordSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic — scoped to authUser.id, never an id from the request body/params
        if (typeof authUser.id !== "number") throw new InternalServerError("Id should be a number")
        await userService.ChangeOwnPassword(authUser.id, result.data);

        return Response.json(new ApiResponse("Password changed successfully", null));
    } catch (error) {
        return authErrorResponse(error);
    }
}