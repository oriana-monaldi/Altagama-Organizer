"use client";

import { useEffect, useState } from "react";
import {
  getAppointments,
  deleteAppointment,
  type Appointment,
} from "@/lib/appointments";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Pencil, CalendarIcon, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentsListProps {
  onEdit?: (appointment: Appointment) => void;
  onAdd?: () => void;
}

export function AppointmentsList({ onEdit, onAdd }: AppointmentsListProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<"today" | "all">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayISO = formatDateISO(new Date());
    console.log(
      "[v0] Initial load - filterDate:",
      filterDate,
      "todayISO:",
      todayISO
    );
    if (filterDate === "today") loadAppointments(undefined, todayISO);
    else loadAppointments();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const todayISO = formatDateISO(new Date());
      const fechaFilter = filterDate === "today" ? todayISO : undefined;
      console.log(
        "[v0] Debounced load - searchTerm:",
        searchTerm,
        "fechaFilter:",
        fechaFilter
      );
      loadAppointments(searchTerm, fechaFilter);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filterDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterDate, selectedDate]);

  const loadAppointments = async (
    patenteFilter?: string,
    fechaFilter?: string
  ) => {
    try {
      console.log("[v0] Loading appointments from Firebase...", {
        patenteFilter,
        fechaFilter,
      });
      const data = await getAppointments(patenteFilter, fechaFilter);
      console.log("[v0] Loaded appointments:", data);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      function isoToLocalDate(iso: string) {
        const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
        return new Date(y, (m || 1) - 1, d || 1);
      }

      let finalData = data;
      if (!fechaFilter) {
        finalData = [...data].sort((a, b) => {
          const da = isoToLocalDate(a.fecha);
          const db = isoToLocalDate(b.fecha);
          const diffA = Math.abs(+da - +today);
          const diffB = Math.abs(+db - +today);
          if (diffA !== diffB) return diffA - diffB;
          const aFuture = +da >= +today ? 0 : 1;
          const bFuture = +db >= +today ? 0 : 1;
          if (aFuture !== bFuture) return aFuture - bFuture;
          return +da - +db;
        });
      }

      setAppointments(finalData);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatDateISO(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchTerm) {
      const s = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((apt) =>
        apt.patente.toLowerCase().includes(s)
      );
    }
    if (filterDate === "today") {
      const todayISO = formatDateISO(new Date());
      filtered = filtered.filter((apt) => apt.fecha === todayISO);
    } else if (filterDate === "all" && selectedDate) {
      const iso = formatDateISO(selectedDate);
      filtered = filtered.filter((apt) => apt.fecha === iso);
    }

    console.log("[v0] Filtered appointments:", filtered);
    setFilteredAppointments(filtered);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este turno?")) {
      try {
        await deleteAppointment(id);
        const todayISO = formatDateISO(new Date());
        const fechaFilter =
          filterDate === "today"
            ? todayISO
            : filterDate === "all" && selectedDate
            ? formatDateISO(selectedDate)
            : undefined;
        await loadAppointments(searchTerm, fechaFilter);
      } catch (error) {
        console.error("Error deleting appointment:", error);
      }
    }
  };

  const displayCount =
    filterDate === "today"
      ? filteredAppointments.filter(
          (apt) => apt.fecha === formatDateISO(new Date())
        ).length
      : filteredAppointments.length;

  return (
    <div className="space-y-6 flex flex-col">
      <p className="text-white text-sm">
        {displayCount} TURNO{displayCount !== 1 ? "S" : ""}
      </p>

      <div className="space-y-3">
        <p className="text-white text-sm font-medium">Filtrar por fecha:</p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              const todayISO = formatDateISO(new Date());
              setFilterDate("today");
              setSelectedDate(new Date());
              loadAppointments(searchTerm, todayISO);
            }}
            className={`flex-1 ${
              filterDate === "today"
                ? "bg-cyan-700 hover:bg-cyan-600"
                : "bg-transparent border border-white hover:bg-white/10"
            } text-white`}
          >
            HOY
          </Button>
          <Button
            onClick={() => {
              setFilterDate("all");
              setSearchTerm("");
              setSelectedDate(undefined);
              loadAppointments();
            }}
            className={`flex-1 ${
              filterDate === "all"
                ? "bg-cyan-700 hover:bg-cyan-600"
                : "bg-transparent border border-white hover:bg-white/10"
            } text-white`}
          >
            TODOS
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="w-full">
          <div className="bg-black border border-white/10 rounded-lg p-2 sm:p-4 mb-6 overflow-hidden">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date) {
                  setFilterDate("all");
                  const iso = formatDateISO(date as Date);
                  loadAppointments(searchTerm, iso);
                }
              }}
              locale={es}
              className="text-white w-full [&_table]:w-full [&_td]:text-center [&_th]:text-center"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <Card className="p-4 h-full bg-transparent">
            {loading ? (
              <p className="text-white text-center">Cargando turnos...</p>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center space-y-6">
                <p className="text-white text-xl font-semibold">
                  No hay turnos registrados para{" "}
                  {filterDate === "today" ? "hoy" : "esta fecha"}
                </p>
                {user?.role === "admin" && onAdd && (
                  <Button
                    onClick={onAdd}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Agendar Turno
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="relative overflow-hidden flex flex-col bg-cyan-900/20 rounded-lg w-full md:max-w-3xl mx-auto"
                  >
                    {user?.role === "admin" && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                        <Button
                          onClick={() => onEdit?.(apt)}
                          size="icon"
                          variant="ghost"
                          title="Editar turno"
                          className="bg-cyan-700/60 hover:bg-cyan-700/80 text-white p-2 rounded"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(apt.id!)}
                          size="icon"
                          variant="ghost"
                          title="Eliminar turno"
                          className="bg-red-700/60 hover:bg-red-700/80 text-white p-2 rounded"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto max-h-96 p-6 pt-12">
                      <div className="space-y-3 min-w-0">
                        <div className="pr-2">
                          <h3 className="text-white font-bold text-xl">
                            {apt.nombreCompleto}
                          </h3>
                        </div>
                        <p className="text-cyan-300 text-sm font-semibold flex items-center gap-2">
                          <CalendarIcon size={16} />
                          {format(parseISO(apt.fecha), "dd/MM/yyyy", {
                            locale: es,
                          })}{" "}
                          - {apt.hora}
                        </p>
                        <div className="border-t border-cyan-700/50 pt-3 space-y-2">
                          <div>
                            <p className="text-cyan-300 text-xs font-semibold uppercase">
                              Patente
                            </p>
                            <p className="text-white font-mono text-lg">
                              {apt.patente}
                            </p>
                          </div>
                          <div>
                            <p className="text-cyan-300 text-xs font-semibold uppercase">
                              Modelo
                            </p>
                            <p className="text-white font-mono text-lg">
                              {apt.modelo}
                            </p>
                          </div>
                          <div>
                            <p className="text-cyan-300 text-xs font-semibold uppercase">
                              Teléfono
                            </p>
                            <p className="text-white">{apt.telefono}</p>
                          </div>
                        </div>
                        <div className="border-t border-cyan-700/50 pt-3">
                          <p className="text-cyan-200 text-sm italic word-break">
                            {apt.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}