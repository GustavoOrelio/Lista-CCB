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
  voluntarioId: string;
  voluntarioNome: string;
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
        voluntarioId: item.voluntarioId,
        voluntarioNome: item.voluntarioNome,
        igrejaId: item.igrejaId,
        cargoId: item.cargoId,
        criadoEm: Timestamp.fromDate(new Date()),
      });

      // Atualiza as estatísticas do voluntário
      const voluntarioRef = doc(db, "voluntarios", item.voluntarioId);
      batch.update(voluntarioRef, {
        diasTrabalhados: increment(1),
        ultimaEscala: Timestamp.fromDate(item.data),
      });
    }

    await batch.commit();
  }

  static async gerarEscala(
    dias: Date[],
    igrejaId: string,
    cargoId: string
  ): Promise<EscalaItem[]> {
    console.log("Iniciando geração de escala:", { dias, igrejaId, cargoId });
    const escala: EscalaItem[] = [];

    // Ordena os dias para garantir que a distribuição seja feita cronologicamente
    const diasOrdenados = [...dias].sort((a, b) => a.getTime() - b.getTime());
    console.log(
      "Dias ordenados:",
      diasOrdenados.map((d) => d.toLocaleDateString())
    );

    for (const dia of diasOrdenados) {
      const diaDaSemana = this.getDiaDaSemana(dia);
      console.log("Buscando voluntários para:", {
        dia: dia.toLocaleDateString(),
        diaDaSemana,
      });

      const voluntariosDisponiveis = await this.getVoluntariosDisponiveis(
        diaDaSemana,
        igrejaId,
        cargoId
      );
      console.log(
        "Voluntários disponíveis:",
        voluntariosDisponiveis.map((v) => ({
          nome: v.nome,
          disponibilidades: v.disponibilidades,
          diasTrabalhados: v.diasTrabalhados,
        }))
      );

      if (voluntariosDisponiveis.length === 0) {
        console.warn(`Não há voluntários disponíveis para ${diaDaSemana}`);
        continue; // Pula para o próximo dia em vez de lançar erro
      }

      // Ordena voluntários por:
      // 1. Menor número de dias trabalhados
      // 2. Maior tempo desde a última escala
      const voluntarioOrdenados = voluntariosDisponiveis.sort((a, b) => {
        if (a.diasTrabalhados !== b.diasTrabalhados) {
          return a.diasTrabalhados - b.diasTrabalhados;
        }

        if (!a.ultimaEscala) return -1;
        if (!b.ultimaEscala) return 1;

        return a.ultimaEscala.getTime() - b.ultimaEscala.getTime();
      });

      const voluntarioSelecionado = voluntarioOrdenados[0];
      console.log("Voluntário selecionado:", {
        nome: voluntarioSelecionado.nome,
        dia: dia.toLocaleDateString(),
      });

      escala.push({
        data: dia,
        voluntarioId: voluntarioSelecionado.id,
        voluntarioNome: voluntarioSelecionado.nome,
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

    return snapshot.docs.map((doc) => ({
      data: doc.data().data.toDate(),
      voluntarioId: doc.data().voluntarioId,
      voluntarioNome: doc.data().voluntarioNome,
      igrejaId: doc.data().igrejaId,
      cargoId: doc.data().cargoId,
    }));
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
