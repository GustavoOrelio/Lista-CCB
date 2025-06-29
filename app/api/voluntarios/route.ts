import { NextRequest, NextResponse } from "next/server";
import { voluntarioService } from "@/app/services/voluntarioService";
import { authenticateRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const igrejaId = searchParams.get("igrejaId");
    const cargoId = searchParams.get("cargoId");

    const filtros: any = {};
    if (igrejaId) filtros.igrejaId = igrejaId;
    if (cargoId) filtros.cargoId = cargoId;

    const voluntarios = await voluntarioService.listar(filtros);
    return NextResponse.json(voluntarios);
  } catch (error) {
    console.error("Erro ao listar voluntários:", error);
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

    const voluntarioData = await request.json();
    const id = await voluntarioService.adicionar(voluntarioData);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar voluntário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
