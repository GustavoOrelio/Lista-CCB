import { Igreja } from "../../types/igreja";

export const igrejaService = {
  async listar(): Promise<Igreja[]> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/igrejas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao carregar igrejas");
    }
    return response.json();
  },

  async adicionar(igreja: Omit<Igreja, "id">): Promise<string> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/igrejas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(igreja),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar igreja");
    }

    const result = await response.json();
    return result.id;
  },

  async atualizar(id: string, igreja: Omit<Igreja, "id">): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`/api/igrejas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(igreja),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar igreja");
    }
  },

  async excluir(id: string): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`/api/igrejas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir igreja");
    }
  },
};
