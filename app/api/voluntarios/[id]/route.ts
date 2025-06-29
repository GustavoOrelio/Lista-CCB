import { NextRequest, NextResponse } from "next/server";
import { voluntarioService } from "@/app/services/voluntarioService";
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
    const voluntarioData = await request.json();

    await voluntarioService.atualizar(id, voluntarioData);
    return NextResponse.json({ message: "Voluntário atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar voluntário:", error);
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
    await voluntarioService.excluir(id);
    return NextResponse.json({ message: "Voluntário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir voluntário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
