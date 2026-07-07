import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { saleService } from "@/services/sale.service";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    { params }: RouteParams
) {
    try {
        await AuthenticatinNeed(request);

        const { id } = await params;

        const saleId = Number(id);
        if (!Number.isInteger(saleId) || saleId <= 0) {
            throw new BadRequestError("Invalid sale id.");
        }

        const sale = await saleService.GetSaleById(saleId);

        return Response.json(
            new ApiResponse("Sale bill fetched successfully", sale)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}