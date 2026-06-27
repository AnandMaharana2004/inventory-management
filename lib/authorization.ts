import { UserRole } from "@/lib/generated/prisma/client";
import { ForbiddenError } from "@/lib/response";

export function requireRole(
    user: { role?: string },
    ...roles: UserRole[]
) {
    if (
        !user.role ||
        !roles.includes(user.role as UserRole)
    ) {
        throw new ForbiddenError(
            "You are not authorized to perform this action."
        );
    }
}