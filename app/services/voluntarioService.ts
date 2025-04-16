import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Voluntario } from "../types/voluntario";

const COLECAO = "voluntarios";

export const voluntarioService = {
  async listar(): Promise<Voluntario[]> {
    const snapshot = await getDocs(collection(db, COLECAO));
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
