import { Voluntario } from "../../types/voluntario";

// Tipo Porteiro simplificado baseado em Voluntario
export interface Porteiro extends Voluntario {}

export const getPorteiros = async (): Promise<Porteiro[]> => {
  const response = await fetch("/api/voluntarios");
  if (!response.ok) {
    throw new Error("Erro ao carregar porteiros");
  }
  return response.json();
};

export const addPorteiro = async (
  porteiro: Omit<Porteiro, "id">
): Promise<string> => {
  const response = await fetch("/api/voluntarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(porteiro),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar porteiro");
  }

  const result = await response.json();
  return result.id;
};

export const updatePorteiro = async (
  id: string,
  porteiro: Omit<Porteiro, "id">
): Promise<void> => {
  const response = await fetch(`/api/voluntarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(porteiro),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar porteiro");
  }
};

export const deletePorteiro = async (id: string): Promise<void> => {
  const response = await fetch(`/api/voluntarios/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir porteiro");
  }
};
