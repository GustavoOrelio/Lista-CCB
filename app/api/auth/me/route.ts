import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verificar e decodificar o JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Buscar dados atualizados do usuário
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        igreja: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Retornar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      igreja: user.igreja?.nome || "",
      cargo: user.cargo || "",
      isAdmin: user.isAdmin,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}
