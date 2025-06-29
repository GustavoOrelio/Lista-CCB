import { NextRequest, NextResponse } from "next/server";
import { cargoService } from "@/app/services/cargoService";
import { authenticateRequest } from "@/app/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;
    const cargoData = await request.json();

    await cargoService.atualizar(id, cargoData);
    return NextResponse.json({ message: "Cargo atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar cargo:", error);
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
    if (!auth) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;
    await cargoService.excluir(id);
    return NextResponse.json({ message: "Cargo excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cargo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
