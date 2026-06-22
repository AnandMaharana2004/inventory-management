import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

import {
  AUTH_TOKEN_COOKIE_NAME,
  createAuthToken,
  getAuthTokenMaxAgeSeconds,
} from "@/lib/auth";
import prisma from "@/lib/prisma";

type LoginBody = {
  id?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginBody | null;
  const id = Number(body?.id);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!Number.isInteger(id) || id <= 0 || !password) {
    return NextResponse.json({ message: "Invalid login credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ message: "Invalid login credentials" }, { status: 401 });
  }

  const isPasswordValid = await compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return NextResponse.json({ message: "Invalid login credentials" }, { status: 401 });
  }

  const authUser = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
  const token = createAuthToken(authUser);
  const response = NextResponse.json({ user: authUser });

  response.cookies.set(AUTH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAuthTokenMaxAgeSeconds(),
  });

  return response;
}
