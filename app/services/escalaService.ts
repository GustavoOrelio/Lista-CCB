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
  getDoc,
} from "firebase/firestore";

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

interface IgrejaFirebase {
  id: string;
  nome: string;
  cultoDomingoRDJ: boolean;
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
  private static convertFirebaseToIgreja(
    id: string,
    data: Partial<IgrejaFirebase>
  ): Igreja {
    const diasCulto: string[] = [];

    if (data.cultoDomingoRDJ) diasCulto.push("domingoRDJ");
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
      cultoDomingoRDJ: data.cultoDomingoRDJ || false,
      cultoDomingo: data.cultoDomingo || false,
      cultoSegunda: data.cultoSegunda || false,
      cultoTerca: data.cultoTerca || false,
      cultoQuarta: data.cultoQuarta || false,
      cultoQuinta: data.cultoQuinta || false,
      cultoSexta: data.cultoSexta || false,
    };
  }

  private static convertDiasCultoToFirebase(
    diasCulto: string[]
  ): Partial<IgrejaFirebase> {
    return {
      cultoDomingoRDJ: diasCulto.includes("domingoRDJ"),
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

  static async getVoluntariosDisponiveis(
    diaSemana: string,
    igrejaId: string,
    cargoId: string
  ): Promise<Voluntario[]> {
    const voluntariosRef = collection(db, "voluntarios");
    const q = query(
      voluntariosRef,
      where("igrejaId", "==", igrejaId),
      where("cargoId", "==", cargoId)
    );

    const querySnapshot = await getDocs(q);
    const voluntarios: Voluntario[] = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const disponibilidades = data.disponibilidades || {};

      // Verifica se o voluntário está disponível para o dia específico
      const diaKey = diaSemana === "domingoRDJ" ? "domingoRDJ" : diaSemana;
      if (disponibilidades[diaKey]) {
        voluntarios.push({
          id: doc.id,
          nome: data.nome,
          disponibilidades,
          diasTrabalhados: data.diasTrabalhados || 0,
          ultimaEscala: data.ultimaEscala ? data.ultimaEscala.toDate() : null,
          cargoId: data.cargoId,
          igrejaId: data.igrejaId,
        });
      }
    }

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
        tipoCulto: item.tipoCulto,
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
    const diasProcessados = new Set<string>();

    // Ordena os dias para garantir que a distribuição seja feita cronologicamente
    const diasOrdenados = [...dias].sort((a, b) => a.getTime() - b.getTime());

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

        // Atualiza o contador de escalas
        voluntariosSelecionados.forEach((v) => {
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
          voluntarios: voluntariosSelecionados.map((v) => ({
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
        tipoCulto: data.tipoCulto || "domingo",
      };
    });
  }

  static async atualizarDiasCultoIgreja(
    igrejaId: string,
    diasCulto: string[]
  ): Promise<void> {
    const igrejaRef = doc(db, "igrejas", igrejaId);
    const dadosAtualizados = this.convertDiasCultoToFirebase(diasCulto);

    await updateDoc(igrejaRef, dadosAtualizados);
  }

  // Método auxiliar para buscar igreja por ID
  private static async getIgrejaById(id: string): Promise<Igreja | null> {
    const igrejaRef = doc(db, "igrejas", id);
    const igrejaDoc = await getDoc(igrejaRef);

    if (!igrejaDoc.exists()) return null;

    const data = igrejaDoc.data();
    return {
      id: igrejaDoc.id,
      nome: data.nome,
      diasCulto: data.diasCulto || [],
      cultoDomingoRDJ: data.cultoDomingoRDJ || false,
      cultoDomingo: data.cultoDomingo || false,
      cultoSegunda: data.cultoSegunda || false,
      cultoTerca: data.cultoTerca || false,
      cultoQuarta: data.cultoQuarta || false,
      cultoQuinta: data.cultoQuinta || false,
      cultoSexta: data.cultoSexta || false,
      cultoSabado: data.cultoSabado || false,
    };
  }
}
