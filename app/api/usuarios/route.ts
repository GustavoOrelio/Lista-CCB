import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticateRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      include: {
        igreja: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    const usuariosFormatados = usuarios.map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      igreja: usuario.igreja?.nome || "",
      cargo: usuario.cargo || "",
      isAdmin: usuario.isAdmin,
    }));

    return NextResponse.json(usuariosFormatados);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { nome, email, senha, igrejaId, cargo, isAdmin } =
      await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar o usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        uid: `user-${Date.now()}`, // UID único
        nome,
        email,
        senha: hashedPassword,
        igrejaId: igrejaId || null,
        cargo: cargo || null,
        isAdmin: isAdmin || false,
      },
      include: {
        igreja: true,
      },
    });

    const usuarioFormatado = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      igreja: novoUsuario.igreja?.nome || "",
      cargo: novoUsuario.cargo || "",
      isAdmin: novoUsuario.isAdmin,
    };

    return NextResponse.json(usuarioFormatado, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
