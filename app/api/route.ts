import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await AuthenticatinNeed(request);

    return Response.json({ message: "Inventory Management API", user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
