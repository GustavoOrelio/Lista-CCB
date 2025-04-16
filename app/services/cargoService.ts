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
import { Cargo } from "../types/cargo";

const COLECAO = "cargos";

export const cargoService = {
  async listar(): Promise<Cargo[]> {
    const cargosRef = collection(db, COLECAO);
    const q = query(cargosRef, orderBy("nome"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Cargo[];
  },

  async adicionar(cargo: Omit<Cargo, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLECAO), cargo);
    return docRef.id;
  },

  async atualizar(id: string, cargo: Omit<Cargo, "id">): Promise<void> {
    const docRef = doc(db, COLECAO, id);
    await updateDoc(docRef, cargo);
  },

  async excluir(id: string): Promise<void> {
    const docRef = doc(db, COLECAO, id);
    await deleteDoc(docRef);
  },
};
