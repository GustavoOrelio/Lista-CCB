interface Voluntario {
  id: string;
  nome: string;
  disponibilidades: {
    domingoRDJ: boolean;
    domingo: boolean;
    segunda: boolean;
    terca: boolean;
    quarta: boolean;
    quinta: boolean;
    sexta: boolean;
    sabado: boolean;
  };
  diasTrabalhados: number;
  ultimaEscala: Date | null;
  cargoId: string;
  igrejaId: string;
}

interface EscalaItem {
  data: Date;
  voluntarios: {
    id: string;
    nome: string;
  }[];
  igrejaId: string;
  cargoId: string;
  tipoCulto: string;
}

interface Igreja {
  id: string;
  nome: string;
  diasCulto: string[];
  cultoDomingoRDJ?: boolean;
  cultoDomingo?: boolean;
  cultoSegunda?: boolean;
  cultoTerca?: boolean;
  cultoQuarta?: boolean;
  cultoQuinta?: boolean;
  cultoSexta?: boolean;
  cultoSabado?: boolean;
}

interface Cargo {
  id: string;
  nome: string;
}

export const escalaService = {
  async getIgrejas(): Promise<Igreja[]> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/escalas?action=igrejas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar igrejas");
    }

    const igrejas = await response.json();
    return igrejas.map((igreja: any) => this.convertPrismaToIgreja(igreja));
  },

  async getCargos(): Promise<Cargo[]> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/escalas?action=cargos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar cargos");
    }

    const cargos = await response.json();
    return cargos.map((cargo: any) => ({
      id: cargo.id,
      nome: cargo.nome,
    }));
  },

  async getEscalaDoMes(
    mes: number,
    ano: number,
    igrejaId: string,
    cargoId: string
  ): Promise<EscalaItem[]> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(
      `/api/escalas?action=escala&mes=${mes}&ano=${ano}&igrejaId=${igrejaId}&cargoId=${cargoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar escala");
    }

    const escala = await response.json();
    return escala.map((item: any) => ({
      ...item,
      data: new Date(item.data),
    }));
  },

  async gerarEscala(
    dias: Date[],
    igrejaId: string,
    cargoId: string
  ): Promise<EscalaItem[]> {
    const token = localStorage.getItem("auth-token");
    const response = await fetch("/api/escalas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "gerar",
        dias: dias.map((d) => d.toISOString()),
        igrejaId,
        cargoId,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao gerar escala");
    }

    const escala = await response.json();
    return escala.map((item: any) => ({
      ...item,
      data: new Date(item.data),
    }));
  },

  convertPrismaToIgreja(igrejaData: any): Igreja {
    const diasCulto: string[] = [];

    if (igrejaData.cultoDomingoRDJ) diasCulto.push("domingoRDJ");
    if (igrejaData.cultoDomingo) diasCulto.push("domingo");
    if (igrejaData.cultoSegunda) diasCulto.push("segunda");
    if (igrejaData.cultoTerca) diasCulto.push("terca");
    if (igrejaData.cultoQuarta) diasCulto.push("quarta");
    if (igrejaData.cultoQuinta) diasCulto.push("quinta");
    if (igrejaData.cultoSexta) diasCulto.push("sexta");
    if (igrejaData.cultoSabado) diasCulto.push("sabado");

    return {
      id: igrejaData.id,
      nome: igrejaData.nome,
      diasCulto,
      cultoDomingoRDJ: igrejaData.cultoDomingoRDJ,
      cultoDomingo: igrejaData.cultoDomingo,
      cultoSegunda: igrejaData.cultoSegunda,
      cultoTerca: igrejaData.cultoTerca,
      cultoQuarta: igrejaData.cultoQuarta,
      cultoQuinta: igrejaData.cultoQuinta,
      cultoSexta: igrejaData.cultoSexta,
      cultoSabado: igrejaData.cultoSabado,
    };
  },
};
