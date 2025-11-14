"use client";

import { useEffect, useState } from "react";
import { getAppointments, deleteAppointment, type Appointment } from "@/lib/appointments";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Pencil, CalendarIcon, Plus } from 'lucide-react';
import { format, isToday, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentsListProps {
  onEdit?: (appointment: Appointment) => void;
  onAdd?: () => void;
}

export function AppointmentsList({ onEdit, onAdd }: AppointmentsListProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<"today" | "all">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
    } else if (selectedDate) {
      // Show appointments for the selected date
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

  const displayCount = filterDate === "today" 
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
    <div className="space-y-6">
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

      <div className="mb-3 md:mb-0">
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

      <Card className="bg-cyan-700/20 border-cyan-600 p-8">
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
              <Card
                key={apt.id}
                className="bg-cyan-800/50 border-cyan-600 p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {apt.nombreCompleto}
                    </h3>
                    <p className="text-cyan-200 text-sm">
                      <CalendarIcon className="inline w-4 h-4 mr-1" />
                      {format(parseISO(apt.fecha), "dd/MM/yyyy", { locale: es })} - {apt.hora}
                    </p>
                    <p className="text-white">
                      <span className="font-medium">Patente:</span> {apt.patente}
                    </p>
                    <p className="text-white">
                      <span className="font-medium">Modelo:</span> {apt.modelo}
                    </p>
                    <p className="text-white">
                      <span className="font-medium">Teléfono:</span> {apt.telefono}
                    </p>
                    <p className="text-cyan-100 text-sm mt-2">{apt.descripcion}</p>
                  </div>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onEdit?.(apt)}
                        size="icon"
                        variant="ghost"
                        className="text-cyan-200 hover:text-white hover:bg-cyan-700 p-2"
                      >
                        <Pencil size={20} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(apt.id!)}
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
