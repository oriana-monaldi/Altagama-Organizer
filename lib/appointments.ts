import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
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

export async function getAppointments(
  patente?: string,
  fecha?: string
): Promise<Appointment[]> {
  console.log("[v0] getAppointments called", { patente, fecha });

  const constraints: any[] = [];

  // If fecha is provided, filter exact match on fecha (stored as yyyy-mm-dd)
  if (fecha && fecha.trim() !== "") {
    constraints.push(where("fecha", "==", fecha));
  }

  // If patente provided, add prefix range constraints (normalize to uppercase)
  if (patente && patente.trim() !== "") {
    const p = patente.trim().toUpperCase();
    constraints.push(where("patente", ">=", p));
    constraints.push(where("patente", "<=", p + "\uf8ff"));
    // Order by patente first for range query, then by fecha desc
    constraints.push(orderBy("patente"));
    constraints.push(orderBy("fecha", "desc"));
  } else {
    // Default ordering
    constraints.push(orderBy("fecha", "desc"));
  }

  const q = query(appointmentsCollection, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Appointment[];
}

export async function addAppointment(
  appointment: Omit<Appointment, "id" | "createdAt">
): Promise<string> {
  // Compare dates as YYYY-MM-DD strings to avoid timezone parsing issues
  function toLocalISO(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const todayISO = toLocalISO(new Date());
  const selectedISO = (appointment.fecha || "").trim();

  if (!selectedISO) {
    throw new Error("Fecha de turno inválida");
  }

  if (selectedISO < todayISO) {
    throw new Error("No puedes crear un turno para una fecha anterior a hoy");
  }

  // If appointment is for today, ensure time is later than now
  if (selectedISO === todayISO) {
    const hora = (appointment.hora || "").trim();
    if (!hora) throw new Error("Hora de turno inválida");
    const [hh, mm] = hora.split(":").map((v) => parseInt(v, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm))
      throw new Error("Hora de turno inválida");

    const [y, m, d] = selectedISO.split("-").map((v) => parseInt(v, 10));
    const selectedDateTime = new Date(y, m - 1, d, hh, mm, 0, 0);
    const now = new Date();
    if (selectedDateTime <= now) {
      throw new Error(
        "No puedes crear un turno para una hora anterior a la actual"
      );
    }
  }

  const docRef = await addDoc(appointmentsCollection, {
    ...appointment,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateAppointment(
  id: string,
  appointment: Partial<Appointment>
): Promise<void> {
  const docRef = doc(db, "turnos", id);
  await updateDoc(docRef, appointment);
}

export async function deleteAppointment(id: string): Promise<void> {
  const docRef = doc(db, "turnos", id);
  await deleteDoc(docRef);
}
