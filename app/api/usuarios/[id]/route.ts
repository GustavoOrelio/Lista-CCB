import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticateRequest } from "@/app/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;
    const { nome, email, senha, igrejaId, cargo, isAdmin } =
      await request.json();

    if (!nome || !email) {
      return NextResponse.json(
        { message: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe (excluindo o usuário atual)
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome,
      email,
      igrejaId: igrejaId || null,
      cargo: cargo || null,
      isAdmin: isAdmin || false,
    };

    // Se senha foi fornecida, fazer hash
    if (senha && senha.trim() !== "") {
      updateData.senha = await bcrypt.hash(senha, 10);
    }

    // Atualizar o usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
      include: {
        igreja: true,
      },
    });

    const usuarioFormatado = {
      id: usuarioAtualizado.id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      igreja: usuarioAtualizado.igreja?.nome || "",
      cargo: usuarioAtualizado.cargo || "",
      isAdmin: usuarioAtualizado.isAdmin,
    };

    return NextResponse.json(usuarioFormatado);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Impedir que o usuário delete a si mesmo
    if (id === auth.userId) {
      return NextResponse.json(
        { message: "Você não pode deletar sua própria conta" },
        { status: 400 }
      );
    }

    // Deletar o usuário
    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
