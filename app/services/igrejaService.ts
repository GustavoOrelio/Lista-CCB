import { prisma } from "../lib/prisma";
import { Igreja } from "../types/igreja";

export const igrejaService = {
  async listar(): Promise<Igreja[]> {
    const igrejas = await prisma.igreja.findMany({
      orderBy: {
        nome: "asc",
      },
    });

    return igrejas.map((igreja) => ({
      id: igreja.id,
      nome: igreja.nome,
      cultoDomingoRDJ: igreja.cultoDomingoRDJ,
      cultoDomingo: igreja.cultoDomingo,
      cultoSegunda: igreja.cultoSegunda,
      cultoTerca: igreja.cultoTerca,
      cultoQuarta: igreja.cultoQuarta,
      cultoQuinta: igreja.cultoQuinta,
      cultoSexta: igreja.cultoSexta,
      cultoSabado: igreja.cultoSabado,
    }));
  },

  async adicionar(igreja: Omit<Igreja, "id">): Promise<string> {
    const novaIgreja = await prisma.igreja.create({
      data: {
        nome: igreja.nome,
        cultoDomingoRDJ: igreja.cultoDomingoRDJ,
        cultoDomingo: igreja.cultoDomingo,
        cultoSegunda: igreja.cultoSegunda,
        cultoTerca: igreja.cultoTerca,
        cultoQuarta: igreja.cultoQuarta,
        cultoQuinta: igreja.cultoQuinta,
        cultoSexta: igreja.cultoSexta,
        cultoSabado: igreja.cultoSabado,
      },
    });

    return novaIgreja.id;
  },

  async atualizar(id: string, igreja: Omit<Igreja, "id">): Promise<void> {
    await prisma.igreja.update({
      where: { id },
      data: {
        nome: igreja.nome,
        cultoDomingoRDJ: igreja.cultoDomingoRDJ,
        cultoDomingo: igreja.cultoDomingo,
        cultoSegunda: igreja.cultoSegunda,
        cultoTerca: igreja.cultoTerca,
        cultoQuarta: igreja.cultoQuarta,
        cultoQuinta: igreja.cultoQuinta,
        cultoSexta: igreja.cultoSexta,
        cultoSabado: igreja.cultoSabado,
      },
    });
  },

  async excluir(id: string): Promise<void> {
    await prisma.igreja.delete({
      where: { id },
    });
  },
};
