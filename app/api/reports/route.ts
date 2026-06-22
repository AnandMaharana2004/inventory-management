import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await AuthenticatinNeed(request);

    return Response.json({ message: "Reports API route", user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
