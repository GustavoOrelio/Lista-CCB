import { NextRequest, NextResponse } from "next/server";
import { cargoService } from "@/app/services/cargoService";
import { authenticateRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const cargos = await cargoService.listar();
    return NextResponse.json(cargos);
  } catch (error) {
    console.error("Erro ao listar cargos:", error);
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

    const cargoData = await request.json();
    const id = await cargoService.adicionar(cargoData);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cargo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
