import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Validar se o payload contém os campos necessários
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.isAdmin === "boolean"
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        isAdmin: payload.isAdmin,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
}

export async function authenticateRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}
