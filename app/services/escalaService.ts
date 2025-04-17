import { db } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  increment,
  Timestamp,
  writeBatch,
  updateDoc,
} from "firebase/firestore";

interface Voluntario {
  id: string;
  nome: string;
  disponibilidades: {
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
}

interface IgrejaFirebase {
  id: string;
  nome: string;
  cultoDomingo: boolean;
  cultoSegunda: boolean;
  cultoTerca: boolean;
  cultoQuarta: boolean;
  cultoQuinta: boolean;
  cultoSexta: boolean;
  cultoSabado: boolean;
}

interface Igreja {
  id: string;
  nome: string;
  diasCulto: string[];
}

interface Cargo {
  id: string;
  nome: string;
}

export class EscalaService {
  private static convertFirebaseToIgreja(
    id: string,
    data: Partial<IgrejaFirebase>
  ): Igreja {
    const diasCulto: string[] = [];

    if (data.cultoDomingo) diasCulto.push("domingo");
    if (data.cultoSegunda) diasCulto.push("segunda");
    if (data.cultoTerca) diasCulto.push("terca");
    if (data.cultoQuarta) diasCulto.push("quarta");
    if (data.cultoQuinta) diasCulto.push("quinta");
    if (data.cultoSexta) diasCulto.push("sexta");
    if (data.cultoSabado) diasCulto.push("sabado");

    return {
      id,
      nome: data.nome || "",
      diasCulto,
    };
  }

  private static convertDiasCultoToFirebase(
    diasCulto: string[]
  ): Partial<IgrejaFirebase> {
    return {
      cultoDomingo: diasCulto.includes("domingo"),
      cultoSegunda: diasCulto.includes("segunda"),
      cultoTerca: diasCulto.includes("terca"),
      cultoQuarta: diasCulto.includes("quarta"),
      cultoQuinta: diasCulto.includes("quinta"),
      cultoSexta: diasCulto.includes("sexta"),
      cultoSabado: diasCulto.includes("sabado"),
    };
  }

  static async getIgrejas(): Promise<Igreja[]> {
    const igrejasRef = collection(db, "igrejas");
    const snapshot = await getDocs(igrejasRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("Dados da igreja:", {
        id: doc.id,
        nome: data.nome,
        dadosCompletos: data,
      });

      return this.convertFirebaseToIgreja(doc.id, data);
    });
  }

  static async getCargos(): Promise<Cargo[]> {
    const cargosRef = collection(db, "cargos");
    const snapshot = await getDocs(cargosRef);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Cargo)
    );
  }

  private static async getVoluntariosDisponiveis(
    diaDaSemana: string,
    igrejaId: string,
    cargoId: string
  ): Promise<Voluntario[]> {
    const voluntariosRef = collection(db, "voluntarios");
    const q = query(
      voluntariosRef,
      where("igrejaId", "==", igrejaId),
      where("cargoId", "==", cargoId)
    );

    console.log("Buscando voluntários:", { igrejaId, cargoId, diaDaSemana });
    const snapshot = await getDocs(q);
    console.log("Total de voluntários encontrados:", snapshot.docs.length);

    const voluntarios = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        console.log("Dados do voluntário:", { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data,
          diasTrabalhados: data.diasTrabalhados || 0,
          ultimaEscala: data.ultimaEscala ? data.ultimaEscala.toDate() : null,
          disponibilidades: data.disponibilidades || {
            domingo: false,
            segunda: false,
            terca: false,
            quarta: false,
            quinta: false,
            sexta: false,
            sabado: false,
          },
        } as Voluntario;
      })
      .filter((voluntario) => {
        const disponivel =
          voluntario.disponibilidades[
            diaDaSemana as keyof typeof voluntario.disponibilidades
          ];
        console.log("Verificando disponibilidade:", {
          voluntario: voluntario.nome,
          diaDaSemana,
          disponibilidades: voluntario.disponibilidades,
          disponivel,
        });
        return disponivel;
      });

    return voluntarios;
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
    const escalaRef = collection(db, "escalas");
    const batch = writeBatch(db);

    // Salva a escala
    for (const item of escala) {
      await addDoc(escalaRef, {
        data: Timestamp.fromDate(item.data),
        voluntarios: item.voluntarios,
        igrejaId: item.igrejaId,
        cargoId: item.cargoId,
        criadoEm: Timestamp.fromDate(new Date()),
      });

      // Atualiza as estatísticas dos voluntários
      for (const voluntario of item.voluntarios) {
        const voluntarioRef = doc(db, "voluntarios", voluntario.id);
        batch.update(voluntarioRef, {
          diasTrabalhados: increment(1),
          ultimaEscala: Timestamp.fromDate(item.data),
        });
      }
    }

    await batch.commit();
  }

  private static async deletarEscalaExistente(
    mes: number,
    ano: number,
    igrejaId: string,
    cargoId: string
  ) {
    const escalaRef = collection(db, "escalas");
    const inicio = new Date(ano, mes, 1);
    const fim = new Date(ano, mes + 1, 0);

    const q = query(
      escalaRef,
      where("igrejaId", "==", igrejaId),
      where("cargoId", "==", cargoId),
      where("data", ">=", Timestamp.fromDate(inicio)),
      where("data", "<=", Timestamp.fromDate(fim))
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    // Deleta todos os documentos da escala antiga
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (snapshot.docs.length > 0) {
      await batch.commit();
      console.log(
        `Escala antiga deletada: ${snapshot.docs.length} registros removidos`
      );
    }
  }

  static async gerarEscala(
    dias: Date[],
    igrejaId: string,
    cargoId: string
  ): Promise<EscalaItem[]> {
    console.log("Iniciando geração de escala:", { dias, igrejaId, cargoId });

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

    // Mapa para controlar quantas vezes cada voluntário foi escalado
    const contagemEscalas: { [voluntarioId: string]: number } = {};

    // Ordena os dias para garantir que a distribuição seja feita cronologicamente
    const diasOrdenados = [...dias].sort((a, b) => a.getTime() - b.getTime());
    console.log(
      "Dias ordenados:",
      diasOrdenados.map((d) => d.toLocaleDateString())
    );

    // Primeiro, vamos buscar todos os voluntários disponíveis para qualquer dia
    const todosVoluntarios = await this.getVoluntariosDisponiveis(
      "sabado", // Usamos qualquer dia aqui, pois vamos filtrar depois
      igrejaId,
      cargoId
    );

    // Inicializa o contador para todos os voluntários
    todosVoluntarios.forEach((v) => {
      contagemEscalas[v.id] = 0;
    });

    for (const dia of diasOrdenados) {
      const diaDaSemana = this.getDiaDaSemana(dia);
      console.log("Buscando voluntários para:", {
        dia: dia.toLocaleDateString(),
        diaDaSemana,
      });

      // Filtra os voluntários disponíveis para este dia específico
      const voluntariosDisponiveis = todosVoluntarios.filter(
        (v) =>
          v.disponibilidades[diaDaSemana as keyof typeof v.disponibilidades]
      );

      console.log(
        "Voluntários disponíveis:",
        voluntariosDisponiveis.map((v) => ({
          nome: v.nome,
          disponibilidades: v.disponibilidades,
          vezesEscalado: contagemEscalas[v.id],
        }))
      );

      // Precisamos de pelo menos 2 voluntários disponíveis
      if (voluntariosDisponiveis.length < 2) {
        console.warn(
          `Não há voluntários suficientes para ${diaDaSemana} (mínimo 2 necessários)`
        );
        continue;
      }

      // Ordena voluntários por:
      // 1. Menor número de vezes escalado no mês atual
      // 2. Menor número total de dias trabalhados
      // 3. Maior tempo desde a última escala
      const voluntariosOrdenados = voluntariosDisponiveis.sort((a, b) => {
        // Primeiro critério: número de vezes escalado no mês atual
        const diffEscalasMes = contagemEscalas[a.id] - contagemEscalas[b.id];
        if (diffEscalasMes !== 0) return diffEscalasMes;

        // Segundo critério: total de dias trabalhados
        if (a.diasTrabalhados !== b.diasTrabalhados) {
          return a.diasTrabalhados - b.diasTrabalhados;
        }

        // Terceiro critério: tempo desde a última escala
        if (!a.ultimaEscala) return -1;
        if (!b.ultimaEscala) return 1;
        return a.ultimaEscala.getTime() - b.ultimaEscala.getTime();
      });

      // Seleciona os 2 voluntários com menos escalas
      const voluntariosSelecionados = voluntariosOrdenados.slice(0, 2);

      // Atualiza o contador de escalas
      voluntariosSelecionados.forEach((v) => {
        contagemEscalas[v.id] = (contagemEscalas[v.id] || 0) + 1;
      });

      console.log("Voluntários selecionados:", {
        dia: dia.toLocaleDateString(),
        voluntarios: voluntariosSelecionados.map((v) => ({
          nome: v.nome,
          vezesEscalado: contagemEscalas[v.id],
        })),
      });

      // Adiciona os dois voluntários à mesma linha da escala
      escala.push({
        data: dia,
        voluntarios: voluntariosSelecionados.map((v) => ({
          id: v.id,
          nome: v.nome,
        })),
        igrejaId,
        cargoId,
      });
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
    const escalaRef = collection(db, "escalas");
    const inicio = new Date(ano, mes, 1);
    const fim = new Date(ano, mes + 1, 0);

    const q = query(
      escalaRef,
      where("igrejaId", "==", igrejaId),
      where("cargoId", "==", cargoId),
      where("data", ">=", Timestamp.fromDate(inicio)),
      where("data", "<=", Timestamp.fromDate(fim)),
      orderBy("data", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        data: data.data.toDate(),
        voluntarios: data.voluntarios,
        igrejaId: data.igrejaId,
        cargoId: data.cargoId,
      };
    });
  }

  static async atualizarDiasCultoIgreja(
    igrejaId: string,
    diasCulto: string[]
  ): Promise<void> {
    const igrejaRef = doc(db, "igrejas", igrejaId);
    const dadosAtualizados = this.convertDiasCultoToFirebase(diasCulto);

    console.log("Atualizando dias de culto:", {
      igrejaId,
      diasCulto,
      dadosAtualizados,
    });

    await updateDoc(igrejaRef, dadosAtualizados);
  }
}
