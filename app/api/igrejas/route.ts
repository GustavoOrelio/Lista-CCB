import { NextRequest, NextResponse } from "next/server";
import { igrejaService } from "@/app/services/igrejaService";
import { authenticateRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const igrejas = await igrejaService.listar();
    return NextResponse.json(igrejas);
  } catch (error) {
    console.error("Erro ao listar igrejas:", error);
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
    if (!auth) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const igrejaData = await request.json();
    const id = await igrejaService.adicionar(igrejaData);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar igreja:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
