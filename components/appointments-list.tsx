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
import { format, isToday, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentsListProps {
  onEdit?: (appointment: Appointment) => void;
  onAdd?: () => void;
}

export function AppointmentsList({ onEdit, onAdd }: AppointmentsListProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<"today" | "all">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterDate, selectedDate]);

  const loadAppointments = async () => {
    try {
      console.log("[v0] Loading appointments from Firebase...");
      const data = await getAppointments();
      console.log("[v0] Loaded appointments:", data);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by search term (patente)
    if (searchTerm) {
      filtered = filtered.filter((apt) =>
        apt.patente.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate === "today") {
      // Show only today's appointments
      filtered = filtered.filter((apt) => {
        try {
          const aptDate = parseISO(apt.fecha);
          return isToday(aptDate);
        } catch {
          return false;
        }
      });
    } else if (filterDate === "all" && selectedDate) {
      // Only filter by calendar when user explicitly selected a date while in "all" mode
      filtered = filtered.filter((apt) => {
        try {
          const aptDate = parseISO(apt.fecha);
          return isSameDay(aptDate, selectedDate);
        } catch {
          return false;
        }
      });
    }

    console.log("[v0] Filtered appointments:", filtered);
    setFilteredAppointments(filtered);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este turno?")) {
      try {
        await deleteAppointment(id);
        await loadAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
      }
    }
  };

  const displayCount =
    filterDate === "today"
      ? filteredAppointments.filter((apt) => {
          try {
            const aptDate = parseISO(apt.fecha);
            return isToday(aptDate);
          } catch {
            return false;
          }
        }).length
      : filteredAppointments.length;

  return (
    <div className="space-y-6 flex flex-col">
      <p className="text-white text-sm">
        {displayCount} TURNO{displayCount !== 1 ? "S" : ""}
      </p>

      <Input
        type="text"
        placeholder="Buscar por patente"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500"
      />

      <div className="space-y-3">
        <p className="text-white text-sm font-medium">Filtrar por fecha:</p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setFilterDate("today");
              setSelectedDate(new Date());
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
            onClick={() => setFilterDate("all")}
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
        {/* Calendario - arriba del listado */}
        <div className="w-full">
          <div className="bg-black border border-white/10 rounded-lg p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date) {
                  setFilterDate("all");
                }
              }}
              locale={es}
              className="text-white w-full"
            />
          </div>
        </div>

        {/* Turno Cards - debajo del calendario */}
        <div className="flex-1 min-w-0">
          <Card className="p-4 h-full bg-transparent">
            {loading ? (
              <p className="text-white text-center">Cargando turnos...</p>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center space-y-6">
                <p className="text-white text-xl font-semibold">
                  No tienes turnos para {filterDate === "today" ? "hoy" : "esta fecha"}
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
                  <div key={apt.id} className="relative overflow-hidden flex flex-col bg-cyan-900/20 rounded-lg w-full md:max-w-3xl mx-auto">
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
                          <h3 className="text-white font-bold text-xl">{apt.nombreCompleto}</h3>
                        </div>
                        <p className="text-cyan-300 text-sm font-semibold flex items-center gap-2">
                          <CalendarIcon size={16} />
                          {format(parseISO(apt.fecha), "dd/MM/yyyy", { locale: es })} - {apt.hora}
                        </p>
                        <div className="border-t border-cyan-700/50 pt-3 space-y-2">
                          <div>
                            <p className="text-cyan-300 text-xs font-semibold uppercase">Patente</p>
                            <p className="text-white font-mono text-lg">{apt.patente}</p>
                          </div>
                          <div>
                            <p className="text-cyan-300 text-xs font-semibold uppercase">Modelo</p>
                            <p className="text-white font-mono text-lg">{apt.modelo}</p>
                          </div>
                          <div>
                            <p className="text-cyan-300 text-xs font-semibold uppercase">Teléfono</p>
                            <p className="text-white">{apt.telefono}</p>
                          </div>
                        </div>
                        <div className="border-t border-cyan-700/50 pt-3">
                          <p className="text-cyan-200 text-sm italic word-break">{apt.descripcion}</p>
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
