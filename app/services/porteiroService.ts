import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export interface Porteiro {
  id?: string;
  name: string;
  canWorkTuesday: boolean;
  canWorkSaturday: boolean;
  serviceCount: number;
}

const COLLECTION_NAME = "porteiros";

export async function addPorteiro(
  porteiro: Omit<Porteiro, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...porteiro,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getPorteiros(): Promise<Porteiro[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "asc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Porteiro[];
}

export async function updatePorteiro(
  id: string,
  porteiro: Partial<Porteiro>
): Promise<void> {
  const porteiroRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(porteiroRef, porteiro);
}

export async function deletePorteiro(id: string): Promise<void> {
  const porteiroRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(porteiroRef);
}
