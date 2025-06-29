import { Cargo } from "../../types/cargo";

export const cargoService = {
  async listar(): Promise<Cargo[]> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/cargos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao carregar cargos");
    }
    return response.json();
  },

  async adicionar(cargo: Omit<Cargo, "id">): Promise<string> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/cargos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cargo),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar cargo");
    }

    const result = await response.json();
    return result.id;
  },

  async atualizar(id: string, cargo: Omit<Cargo, "id">): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`/api/cargos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cargo),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar cargo");
    }
  },

  async excluir(id: string): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`/api/cargos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir cargo");
    }
  },
};
