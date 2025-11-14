import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export interface Appointment {
  id?: string;
  nombreCompleto: string;
  telefono: string;
  descripcion: string;
  fecha: string;
  hora: string;
  patente: string;
  modelo: string;
  createdAt?: Timestamp;
}

const appointmentsCollection = collection(db, "turnos");

export async function getAppointments(): Promise<Appointment[]> {
  const q = query(appointmentsCollection, orderBy("fecha", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Appointment[];
}

export async function addAppointment(appointment: Omit<Appointment, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(appointmentsCollection, {
    ...appointment,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
  const docRef = doc(db, "turnos", id);
  await updateDoc(docRef, appointment);
}

export async function deleteAppointment(id: string): Promise<void> {
  const docRef = doc(db, "turnos", id);
  await deleteDoc(docRef);
}
