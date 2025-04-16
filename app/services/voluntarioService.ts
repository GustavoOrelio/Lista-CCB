import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Voluntario } from "../types/voluntario";

const COLECAO = "voluntarios";

export const voluntarioService = {
  async listar(): Promise<Voluntario[]> {
    const voluntariosRef = collection(db, COLECAO);
    const q = query(voluntariosRef, orderBy("nome"));
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
};
