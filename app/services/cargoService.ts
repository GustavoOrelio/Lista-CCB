import { prisma } from "../lib/prisma";
import { Cargo } from "../types/cargo";

export const cargoService = {
  async listar(): Promise<Cargo[]> {
    const cargos = await prisma.cargo.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return cargos.map((cargo) => ({
      id: cargo.id,
      nome: cargo.nome,
      descricao: cargo.descricao,
      ativo: cargo.ativo,
    }));
  },

  async adicionar(cargo: Omit<Cargo, "id">): Promise<string> {
    const novoCargo = await prisma.cargo.create({
      data: {
        nome: cargo.nome,
        descricao: cargo.descricao,
        ativo: cargo.ativo,
      },
    });

    return novoCargo.id;
  },

  async atualizar(id: string, cargo: Omit<Cargo, "id">): Promise<void> {
    await prisma.cargo.update({
      where: { id },
      data: {
        nome: cargo.nome,
        descricao: cargo.descricao,
        ativo: cargo.ativo,
      },
    });
  },

  async excluir(id: string): Promise<void> {
    await prisma.cargo.update({
      where: { id },
      data: {
        ativo: false,
      },
    });
  },
};
