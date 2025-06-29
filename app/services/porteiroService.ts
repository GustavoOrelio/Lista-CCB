import { prisma } from "../lib/prisma";

export interface Porteiro {
  id?: string;
  name: string;
  canWorkTuesday: boolean;
  canWorkSaturday: boolean;
  serviceCount: number;
}

export async function addPorteiro(
  porteiro: Omit<Porteiro, "id">
): Promise<string> {
  // Por enquanto vou implementar usando o modelo Voluntario
  // TODO: Criar um modelo específico Porteiro no schema se necessário
  const novoVoluntario = await prisma.voluntario.create({
    data: {
      nome: porteiro.name,
      telefone: "", // Campo obrigatório, deixar vazio por enquanto
      igrejaId: "default-igreja-id", // TODO: Pegar da configuração
      cargoId: "default-cargo-id", // TODO: Pegar da configuração
      terca: porteiro.canWorkTuesday,
      sabado: porteiro.canWorkSaturday,
    },
  });

  return novoVoluntario.id;
}

export async function getPorteiros(): Promise<Porteiro[]> {
  // Por enquanto vou buscar dos voluntários
  // TODO: Implementar com modelo específico se necessário
  const voluntarios = await prisma.voluntario.findMany({
    orderBy: { criadoEm: "asc" },
  });

  return voluntarios.map((voluntario) => ({
    id: voluntario.id,
    name: voluntario.nome,
    canWorkTuesday: voluntario.terca,
    canWorkSaturday: voluntario.sabado,
    serviceCount: 0, // TODO: Implementar contagem baseada nas escalas
  }));
}

export async function updatePorteiro(
  id: string,
  porteiro: Partial<Porteiro>
): Promise<void> {
  const updateData: any = {};

  if (porteiro.name) updateData.nome = porteiro.name;
  if (porteiro.canWorkTuesday !== undefined)
    updateData.terca = porteiro.canWorkTuesday;
  if (porteiro.canWorkSaturday !== undefined)
    updateData.sabado = porteiro.canWorkSaturday;

  await prisma.voluntario.update({
    where: { id },
    data: updateData,
  });
}

export async function deletePorteiro(id: string): Promise<void> {
  await prisma.voluntario.delete({
    where: { id },
  });
}
