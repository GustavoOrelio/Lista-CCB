import { NextRequest, NextResponse } from "next/server";
import { igrejaService } from "@/app/services/igrejaService";
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
    const igrejaData = await request.json();

    await igrejaService.atualizar(id, igrejaData);
    return NextResponse.json({ message: "Igreja atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar igreja:", error);
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
    await igrejaService.excluir(id);
    return NextResponse.json({ message: "Igreja excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir igreja:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
