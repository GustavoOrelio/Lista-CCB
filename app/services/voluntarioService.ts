import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
  where,
  CollectionReference,
  Query,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Voluntario } from "../types/voluntario";

const COLECAO = "voluntarios";

export const voluntarioService = {
  async listar(filtros?: {
    igrejaId?: string;
    cargoId?: string;
  }): Promise<Voluntario[]> {
    let q: CollectionReference | Query = collection(db, COLECAO);

    if (filtros) {
      const conditions = [];
      if (filtros.igrejaId) {
        conditions.push(where("igrejaId", "==", filtros.igrejaId));
      }
      if (filtros.cargoId) {
        conditions.push(where("cargoId", "==", filtros.cargoId));
      }
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Voluntario[];
  },

  async adicionar(voluntario: Omit<Voluntario, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLECAO), voluntario);
    return docRef.id;
  },

  async atualizar(id: string, voluntario: Omit<Voluntario, "id">) {
    const docRef = doc(db, COLECAO, id);
    await updateDoc(docRef, voluntario);
  },

  async excluir(id: string) {
    const docRef = doc(db, COLECAO, id);
    await deleteDoc(docRef);
  },
};
