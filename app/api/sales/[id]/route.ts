import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { saleService } from "@/services/sale.service";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
    try {
        await AuthenticatinNeed(request);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid sale id.");
        }

        const sale = await saleService.GetSaleById(id);

        return Response.json(new ApiResponse("Sale bill fetched successfully", sale));
    } catch (error) {
        return authErrorResponse(error);
    }
}