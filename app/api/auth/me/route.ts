import { ApiResponse } from "@/lib/response";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await AuthenticatinNeed(request);


    return Response.json(new ApiResponse("Authenticated user fetched successfully", user));
  } catch (error) {
    return authErrorResponse(error);
  }
}
