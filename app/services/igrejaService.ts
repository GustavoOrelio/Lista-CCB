import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Igreja } from "../types/igreja";

const COLECAO = "igrejas";

export const igrejaService = {
  async listar(): Promise<Igreja[]> {
    const igrejasRef = collection(db, COLECAO);
    const q = query(igrejasRef, orderBy("nome"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Igreja[];
  },

  async adicionar(igreja: Omit<Igreja, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLECAO), igreja);
    return docRef.id;
  },
};
