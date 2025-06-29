import { prisma } from "@/app/lib/prisma";

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

export class EscalaService {
  private static convertPrismaToIgreja(igrejaData: any): Igreja {
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
  }

  static async getIgrejas(): Promise<Igreja[]> {
    const igrejas = await prisma.igreja.findMany({
      orderBy: { nome: "asc" },
    });

    return igrejas.map((igreja) => this.convertPrismaToIgreja(igreja));
  }

  static async getCargos(): Promise<Cargo[]> {
    const cargos = await prisma.cargo.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    return cargos.map((cargo) => ({
      id: cargo.id,
      nome: cargo.nome,
    }));
  }

  static async getVoluntariosDisponiveis(
    diaSemana: string,
    igrejaId: string,
    cargoId: string
  ): Promise<Voluntario[]> {
    // Construir a condição de disponibilidade dinamicamente
    const whereClause: any = {
      igrejaId,
      cargoId,
    };

    // Adicionar a condição específica do dia
    const diaKey = diaSemana === "domingoRDJ" ? "domingoRDJ" : diaSemana;
    whereClause[diaKey] = true;

    const voluntarios = await prisma.voluntario.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
    });

    return voluntarios.map((voluntario) => ({
      id: voluntario.id,
      nome: voluntario.nome,
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
      diasTrabalhados: 0, // TODO: Implementar contagem baseada nas escalas
      ultimaEscala: null, // TODO: Implementar busca da última escala
      cargoId: voluntario.cargoId,
      igrejaId: voluntario.igrejaId,
    }));
  }

  private static getDiaDaSemana(data: Date): string {
    const dias = [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];
    return dias[data.getDay()];
  }

  private static async salvarEscala(escala: EscalaItem[]) {
    if (escala.length === 0) return;

    // Usar uma transação para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // Agrupar escalas por mês para otimização
      const escalasPorDia = new Map<string, EscalaItem[]>();

      escala.forEach((item) => {
        const dataKey = item.data.toISOString().split("T")[0];
        if (!escalasPorDia.has(dataKey)) {
          escalasPorDia.set(dataKey, []);
        }
        escalasPorDia.get(dataKey)!.push(item);
      });

      // Salvar cada escala como um item individual
      for (const [, itensEscala] of escalasPorDia) {
        for (const item of itensEscala) {
          // Criar o item da escala
          const escalaItem = await tx.escalaItem.create({
            data: {
              data: item.data,
              igrejaId: item.igrejaId,
              cargoId: item.cargoId,
              tipoCulto: item.tipoCulto,
            },
          });

          // Criar os relacionamentos com voluntários
          for (const voluntario of item.voluntarios) {
            await tx.voluntarioEscala.create({
              data: {
                voluntarioId: voluntario.id,
                escalaItemId: escalaItem.id,
              },
            });
          }
        }
      }
    });
  }

  private static async deletarEscalaExistente(
    mes: number,
    ano: number,
    igrejaId: string,
    cargoId: string
  ) {
    // Calcular o início e fim do mês
    const inicioMes = new Date(ano, mes, 1);
    const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59);

    try {
      // Buscar escalas do mês
      const escalasExistentes = await prisma.escalaItem.findMany({
        where: {
          igrejaId,
          cargoId,
          data: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
      });

      // Deletar relacionamentos e escalas
      for (const escala of escalasExistentes) {
        await prisma.voluntarioEscala.deleteMany({
          where: { escalaItemId: escala.id },
        });

        await prisma.escalaItem.delete({
          where: { id: escala.id },
        });
      }
    } catch (error) {
      console.log("Erro ao deletar escala existente:", error);
    }
  }

  static async gerarEscala(
    dias: Date[],
    igrejaId: string,
    cargoId: string
  ): Promise<EscalaItem[]> {
    // Deleta a escala antiga do mesmo mês
    if (dias.length > 0) {
      const primeiroDia = dias[0];
      await this.deletarEscalaExistente(
        primeiroDia.getMonth(),
        primeiroDia.getFullYear(),
        igrejaId,
        cargoId
      );
    }

    const escala: EscalaItem[] = [];
    const contagemEscalas: { [voluntarioId: string]: number } = {};
    const contagemPedido: { [voluntarioId: string]: number } = {};
    const contagemAbrirIgreja: { [voluntarioId: string]: number } = {};
    const diasProcessados = new Set<string>();

    // Ordena os dias para garantir que a distribuição seja feita cronologicamente
    const diasOrdenados = [...dias].sort((a, b) => a.getTime() - b.getTime());

    // Primeiro, vamos buscar todos os voluntários disponíveis para qualquer dia
    const todosVoluntarios = await this.getVoluntariosDisponiveis(
      "sabado", // Usamos qualquer dia aqui, pois vamos filtrar depois
      igrejaId,
      cargoId
    );

    // Inicializa os contadores para todos os voluntários
    todosVoluntarios.forEach((v) => {
      contagemEscalas[v.id] = 0;
      contagemPedido[v.id] = 0;
      contagemAbrirIgreja[v.id] = 0;
    });

    // Busca a igreja uma única vez
    const igreja = await this.getIgrejaById(igrejaId);
    if (!igreja) {
      console.error("Igreja não encontrada:", igrejaId);
      return [];
    }

    // Para cada dia, vamos buscar os voluntários disponíveis
    for (const dia of diasOrdenados) {
      const diaDaSemana = [
        "domingo",
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
      ][dia.getDay()];

      const dataString = dia.toISOString().split("T")[0];
      if (diasProcessados.has(dataString)) {
        continue;
      }

      // Array para guardar os tipos de culto que precisamos processar para este dia
      const cultosParaProcessar: string[] = [];

      // Se for domingo, verifica se precisa processar RDJ e/ou culto normal
      if (diaDaSemana === "domingo") {
        // Se tem RDJ, adiciona
        if (igreja.cultoDomingoRDJ === true) {
          cultosParaProcessar.push("domingoRDJ");
        }
        // Se tem culto normal de domingo, adiciona também
        if (igreja.cultoDomingo === true) {
          cultosParaProcessar.push("domingo");
        }
        diasProcessados.add(dataString);
      } else {
        cultosParaProcessar.push(diaDaSemana);
        diasProcessados.add(dataString);
      }

      // Processa cada tipo de culto para este dia
      for (const tipoCulto of cultosParaProcessar) {
        // Busca os voluntários disponíveis para este tipo de culto específico
        const voluntariosDisponiveis = await this.getVoluntariosDisponiveis(
          tipoCulto,
          igrejaId,
          cargoId
        );

        if (voluntariosDisponiveis.length < 2) {
          continue;
        }

        // Ordena os voluntários por número de escalas e última data de trabalho
        const voluntariosOrdenados = [...voluntariosDisponiveis].sort(
          (a, b) => {
            // Primeiro critério: número de escalas
            const diferencaEscalas =
              (contagemEscalas[a.id] || 0) - (contagemEscalas[b.id] || 0);
            if (diferencaEscalas !== 0) return diferencaEscalas;

            // Segundo critério: última data de escala
            const ultimaA = a.ultimaEscala ? a.ultimaEscala.getTime() : 0;
            const ultimaB = b.ultimaEscala ? b.ultimaEscala.getTime() : 0;
            return ultimaA - ultimaB;
          }
        );

        // Seleciona os dois primeiros voluntários
        const voluntariosSelecionados = voluntariosOrdenados.slice(0, 2);

        // Determina quem vai fazer cada função baseado no histórico
        let voluntariosOrganizados = [...voluntariosSelecionados];

        // Verifica quem tem mais pedidos e mais aberturas
        const v1PedidoCount = contagemPedido[voluntariosOrganizados[0].id] || 0;
        const v1AbrirCount =
          contagemAbrirIgreja[voluntariosOrganizados[0].id] || 0;
        const v2PedidoCount = contagemPedido[voluntariosOrganizados[1].id] || 0;
        const v2AbrirCount =
          contagemAbrirIgreja[voluntariosOrganizados[1].id] || 0;

        // Se o primeiro voluntário tem mais pedidos que aberturas, ele vai abrir
        // Ou se o segundo tem mais aberturas que pedidos, o primeiro vai pedir
        if (v1PedidoCount > v1AbrirCount || v2AbrirCount > v2PedidoCount) {
          voluntariosOrganizados = [
            voluntariosOrganizados[1],
            voluntariosOrganizados[0],
          ];
        }

        // Atualiza os contadores
        contagemPedido[voluntariosOrganizados[0].id] =
          (contagemPedido[voluntariosOrganizados[0].id] || 0) + 1;
        contagemAbrirIgreja[voluntariosOrganizados[1].id] =
          (contagemAbrirIgreja[voluntariosOrganizados[1].id] || 0) + 1;

        // Atualiza o contador geral de escalas
        voluntariosOrganizados.forEach((v) => {
          contagemEscalas[v.id] = (contagemEscalas[v.id] || 0) + 1;
        });

        // Adiciona à escala
        const novaData = new Date(dia);
        if (tipoCulto === "domingoRDJ") {
          novaData.setHours(9);
        } else if (tipoCulto === "domingo") {
          novaData.setHours(18);
        }

        escala.push({
          data: novaData,
          voluntarios: voluntariosOrganizados.map((v) => ({
            id: v.id,
            nome: v.nome,
          })),
          igrejaId,
          cargoId,
          tipoCulto,
        });
      }
    }

    if (escala.length > 0) {
      // Salva a escala gerada
      await this.salvarEscala(escala);
    }

    return escala;
  }

  static async getEscalaDoMes(
    mes: number,
    ano: number,
    igrejaId: string,
    cargoId: string
  ): Promise<EscalaItem[]> {
    // Calcular o início e fim do mês
    const inicioMes = new Date(ano, mes, 1);
    const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59);

    const escalas = await prisma.escalaItem.findMany({
      where: {
        igrejaId,
        cargoId,
        data: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
      include: {
        voluntarios: {
          include: {
            voluntario: true,
          },
        },
      },
      orderBy: {
        data: "asc",
      },
    });

    return escalas.map((escala) => ({
      data: escala.data,
      voluntarios: escala.voluntarios.map((v) => ({
        id: v.voluntario.id,
        nome: v.voluntario.nome,
      })),
      igrejaId: escala.igrejaId,
      cargoId: escala.cargoId,
      tipoCulto: escala.tipoCulto,
    }));
  }

  static async atualizarDiasCultoIgreja(
    igrejaId: string,
    diasCulto: string[]
  ): Promise<void> {
    const dadosAtualizacao = {
      cultoDomingoRDJ: diasCulto.includes("domingoRDJ"),
      cultoDomingo: diasCulto.includes("domingo"),
      cultoSegunda: diasCulto.includes("segunda"),
      cultoTerca: diasCulto.includes("terca"),
      cultoQuarta: diasCulto.includes("quarta"),
      cultoQuinta: diasCulto.includes("quinta"),
      cultoSexta: diasCulto.includes("sexta"),
      cultoSabado: diasCulto.includes("sabado"),
    };

    await prisma.igreja.update({
      where: { id: igrejaId },
      data: dadosAtualizacao,
    });
  }

  // Método auxiliar para buscar igreja por ID
  private static async getIgrejaById(id: string): Promise<Igreja | null> {
    const igreja = await prisma.igreja.findUnique({
      where: { id },
    });

    if (!igreja) return null;

    return this.convertPrismaToIgreja(igreja);
  }
}
