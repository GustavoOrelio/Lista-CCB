import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, sempre retornar sucesso mesmo se o usuário não existir
      return NextResponse.json({
        message:
          "Se o email existir, você receberá instruções para redefinir a senha.",
      });
    }

    // TODO: Implementar envio de email com token para reset de senha
    // Por enquanto, apenas log no console para desenvolvimento
    console.log(`Reset de senha solicitado para: ${email}`);

    return NextResponse.json({
      message:
        "Se o email existir, você receberá instruções para redefinir a senha.",
    });
  } catch (error) {
    console.error("Erro no reset de senha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
