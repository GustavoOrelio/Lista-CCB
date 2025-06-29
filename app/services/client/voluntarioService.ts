import { Voluntario } from "../../types/voluntario";

export const voluntarioService = {
  async listar(filtros?: {
    igrejaId?: string;
    cargoId?: string;
  }): Promise<Voluntario[]> {
    const token = localStorage.getItem("auth-token");
    const params = new URLSearchParams();
    if (filtros?.igrejaId) params.append("igrejaId", filtros.igrejaId);
    if (filtros?.cargoId) params.append("cargoId", filtros.cargoId);

    const response = await fetch(`/api/voluntarios?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao carregar voluntários");
    }
    return response.json();
  },

  async adicionar(voluntario: Omit<Voluntario, "id">): Promise<string> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/voluntarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voluntario),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar voluntário");
    }

    const result = await response.json();
    return result.id;
  },

  async atualizar(id: string, voluntario: Omit<Voluntario, "id">) {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`/api/voluntarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voluntario),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar voluntário");
    }
  },

  async excluir(id: string) {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`/api/voluntarios/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir voluntário");
    }
  },
};
