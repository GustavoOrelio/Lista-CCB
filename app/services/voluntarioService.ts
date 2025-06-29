import { prisma } from "../lib/prisma";
import { Voluntario } from "../types/voluntario";

export const voluntarioService = {
  async listar(filtros?: {
    igrejaId?: string;
    cargoId?: string;
  }): Promise<Voluntario[]> {
    const where: any = {};

    if (filtros?.igrejaId) {
      where.igrejaId = filtros.igrejaId;
    }

    if (filtros?.cargoId) {
      where.cargoId = filtros.cargoId;
    }

    const voluntarios = await prisma.voluntario.findMany({
      where,
      include: {
        igreja: true,
        cargo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return voluntarios.map((voluntario) => ({
      id: voluntario.id,
      nome: voluntario.nome,
      telefone: voluntario.telefone,
      igrejaId: voluntario.igrejaId,
      igrejaNome: voluntario.igreja.nome,
      cargoId: voluntario.cargoId,
      cargoNome: voluntario.cargo.nome,
      disponibilidades: {
        domingoRDJ: voluntario.domingoRDJ,
        domingo: voluntario.domingo,
        segunda: voluntario.segunda,
        terca: voluntario.terca,
        quarta: voluntario.quarta,
        quinta: voluntario.quinta,
        sexta: voluntario.sexta,
        sabado: voluntario.sabado,
      },
    }));
  },

  async adicionar(voluntario: Omit<Voluntario, "id">): Promise<string> {
    const novoVoluntario = await prisma.voluntario.create({
      data: {
        nome: voluntario.nome,
        telefone: voluntario.telefone,
        igrejaId: voluntario.igrejaId,
        cargoId: voluntario.cargoId,
        domingoRDJ: voluntario.disponibilidades?.domingoRDJ || false,
        domingo: voluntario.disponibilidades?.domingo || false,
        segunda: voluntario.disponibilidades?.segunda || false,
        terca: voluntario.disponibilidades?.terca || false,
        quarta: voluntario.disponibilidades?.quarta || false,
        quinta: voluntario.disponibilidades?.quinta || false,
        sexta: voluntario.disponibilidades?.sexta || false,
        sabado: voluntario.disponibilidades?.sabado || false,
      },
    });

    return novoVoluntario.id;
  },

  async atualizar(id: string, voluntario: Omit<Voluntario, "id">) {
    await prisma.voluntario.update({
      where: { id },
      data: {
        nome: voluntario.nome,
        telefone: voluntario.telefone,
        igrejaId: voluntario.igrejaId,
        cargoId: voluntario.cargoId,
        domingoRDJ: voluntario.disponibilidades?.domingoRDJ || false,
        domingo: voluntario.disponibilidades?.domingo || false,
        segunda: voluntario.disponibilidades?.segunda || false,
        terca: voluntario.disponibilidades?.terca || false,
        quarta: voluntario.disponibilidades?.quarta || false,
        quinta: voluntario.disponibilidades?.quinta || false,
        sexta: voluntario.disponibilidades?.sexta || false,
        sabado: voluntario.disponibilidades?.sabado || false,
      },
    });
  },

  async excluir(id: string) {
    await prisma.voluntario.delete({
      where: { id },
    });
  },
};
