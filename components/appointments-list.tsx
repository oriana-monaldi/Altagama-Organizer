"use client";

import { useEffect, useState } from "react";
import {
  getAppointments,
  deleteAppointment,
  type Appointment,
} from "@/lib/appointments";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Trash2,
  Pencil,
  Calendar as CalendarIcon,
  Plus,
  AlertTriangle,
  X,
  Clock,
  Car,
  User,
  Phone,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentsListProps {
  onEdit?: (appointment: Appointment) => void;
  onAdd?: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentInfo,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  appointmentInfo: {
    nombreCompleto?: string;
    fecha?: string;
    hora?: string;
    patente?: string;
  } | null;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-red-500/30 overflow-hidden animate-scaleIn">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 blur-xl"></div>
        
        <div className="relative p-6 border-b border-red-500/20">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 disabled:opacity-50 border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl"></div>
              <div className="relative p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30">
                <AlertTriangle className="text-red-400" size={28} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Eliminar Turno</h3>
              <p className="text-sm text-gray-400 mt-1">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </div>

        <div className="relative p-6">
          <p className="text-gray-300 mb-6 text-base">
            ¿Estás seguro de que deseas eliminar este turno?
          </p>
          
          {appointmentInfo && (
            <div className="bg-slate-950/50 rounded-2xl p-5 space-y-3 border border-red-500/20 backdrop-blur-sm">
              {appointmentInfo.nombreCompleto && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-red-300 uppercase tracking-wide">
                    Paciente
                  </span>
                  <span className="text-base font-bold text-white">
                    {appointmentInfo.nombreCompleto}
                  </span>
                </div>
              )}
              {appointmentInfo.patente && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-red-300 uppercase tracking-wide">
                    Patente
                  </span>
                  <span className="text-base font-bold text-white font-mono bg-white/5 px-3 py-1 rounded-lg">
                    {appointmentInfo.patente}
                  </span>
                </div>
              )}
              {appointmentInfo.fecha && (
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-red-300 uppercase tracking-wide">
                    Fecha
                  </span>
                  <span className="text-base font-bold text-white">
                    {format(parseISO(appointmentInfo.fecha), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              )}
              {appointmentInfo.hora && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-red-300 uppercase tracking-wide">
                    Hora
                  </span>
                  <span className="text-base font-bold text-white">
                    {appointmentInfo.hora}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative p-6 bg-slate-950/50 border-t border-red-500/10 flex gap-3">
          <Button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-12 bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Eliminar
              </>
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export function AppointmentsList({ onEdit, onAdd }: AppointmentsListProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<"today" | "all">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{
    id: string;
    nombreCompleto?: string;
    fecha?: string;
    hora?: string;
    patente?: string;
  } | null>(null);

  useEffect(() => {
    const todayISO = formatDateISO(new Date());
    console.log("[v0] Initial load - filterDate:", filterDate, "todayISO:", todayISO);
    if (filterDate === "today") loadAppointments(undefined, todayISO);
    else loadAppointments();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const todayISO = formatDateISO(new Date());
      const fechaFilter = filterDate === "today" ? todayISO : undefined;
      console.log("[v0] Debounced load - searchTerm:", searchTerm, "fechaFilter:", fechaFilter);
      loadAppointments(searchTerm, fechaFilter);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filterDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterDate, selectedDate]);

  const loadAppointments = async (patenteFilter?: string, fechaFilter?: string) => {
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
      filtered = filtered.filter((apt) => apt.patente.toLowerCase().includes(s));
    }
    
    if (filterDate === "today") {
      const todayISO = formatDateISO(new Date());
      filtered = filtered.filter((apt) => apt.fecha === todayISO);
    } else if (filterDate === "all" && selectedDate) {
      const iso = formatDateISO(selectedDate);
      filtered = filtered.filter((apt) => apt.fecha === iso);
    } else if (filterDate === "all" && !selectedDate) {
      const now = new Date();
      const todayISO = formatDateISO(now);

      filtered = filtered.filter((apt) => {
        if (apt.fecha > todayISO) {
          return true;
        }

        if (apt.fecha === todayISO) {
          const [hh, mm] = apt.hora.split(":").map((v) => parseInt(v, 10));
          const appointmentTime = new Date();
          appointmentTime.setHours(hh, mm, 0, 0);
          return appointmentTime > now;
        }
        return false;
      });
    }

    console.log("[v0] Filtered appointments:", filtered);
    setFilteredAppointments(filtered);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete({
      id: appointment.id!,
      nombreCompleto: appointment.nombreCompleto,
      fecha: appointment.fecha,
      hora: appointment.hora,
      patente: appointment.patente,
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointment(appointmentToDelete.id);
      const todayISO = formatDateISO(new Date());
      const fechaFilter =
        filterDate === "today"
          ? todayISO
          : filterDate === "all" && selectedDate
          ? formatDateISO(selectedDate)
          : undefined;
      await loadAppointments(searchTerm, fechaFilter);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const displayCount =
    filterDate === "today"
      ? filteredAppointments.filter((apt) => apt.fecha === formatDateISO(new Date())).length
      : filteredAppointments.length;

  return (
    <div className="space-y-6 flex flex-col">
      <p className="text-white text-sm font-semibold tracking-wide">
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
            className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-300 ${
              filterDate === "today"
                ? "bg-cyan-700 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30"
                : "bg-transparent border-2 border-white/30 hover:border-white/50 hover:bg-white/5"
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
            className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-300 ${
              filterDate === "all"
                ? "bg-cyan-700 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30"
                : "bg-transparent border-2 border-white/30 hover:border-white/50 hover:bg-white/5"
            } text-white`}
          >
            TODOS
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="w-full lg:flex-1">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 overflow-hidden">
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
              className="text-white w-full [&_table]:w-full [&_td]:text-center [&_th]:text-center [&_.rdp-day]:w-full [&_.rdp-day]:aspect-square [&_.rdp-day_today]:bg-transparent [&_.rdp-day_today]:text-white"
            />
          </div>
        </div>

        <div className="w-full lg:flex-1 min-w-0">
          <Card className="p-4 h-full bg-transparent">
            {loading ? (
              <div className="text-center p-8">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-medium">Cargando turnos...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center space-y-6 p-8">
                <div className="inline-flex items-center justify-center p-4  from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-400/20 mb-4">
                  <CalendarIcon className="text-cyan-400" size={48} />
                </div>
                <p className="text-white text-xl font-semibold">
                  No hay turnos registrados para{" "}
                  {filterDate === "today" ? "hoy" : "esta fecha"}
                </p>
                {user?.role === "admin" && onAdd && (
                  <Button
                    onClick={onAdd}
                    className=" from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black w-full py-4 text-base font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30"
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
                    className="group relative overflow-hidden flex flex-col  from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl w-full border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
                  >
                    <div className="absolute inset-0  from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {user?.role === "admin" && (
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <Button
                          onClick={() => onEdit?.(apt)}
                          size="icon"
                          variant="ghost"
                          title="Editar turno"
                          className="p-2.5 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(apt)}
                          size="icon"
                          variant="ghost"
                          title="Eliminar turno"
                          className="p-2.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}

                    <div className="relative flex-1 p-6 pt-16">
                      <div className="space-y-4 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2  from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
                            <User size={20} className="text-cyan-400" />
                          </div>
                          <h3 className="text-white font-bold text-2xl">
                            {apt.nombreCompleto}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold bg-cyan-500/5 px-3 py-2 rounded-lg border border-cyan-500/10">
                          <Clock size={16} />
                          {format(parseISO(apt.fecha), "EEEE, dd 'de' MMMM", { locale: es })} • {apt.hora}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                          <div className="bg-slate-950/30 rounded-xl p-4 border border-cyan-500/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Car size={14} className="text-cyan-400" />
                              <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                                Patente
                              </p>
                            </div>
                            <p className="text-white font-mono text-lg font-bold">
                              {apt.patente}
                            </p>
                          </div>

                          <div className="bg-slate-950/30 rounded-xl p-4 border border-cyan-500/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Car size={14} className="text-cyan-400" />
                              <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                                Modelo
                              </p>
                            </div>
                            <p className="text-white text-lg font-semibold">
                              {apt.modelo}
                            </p>
                          </div>

                          <div className="bg-slate-950/30 rounded-xl p-4 border border-cyan-500/10 backdrop-blur-sm sm:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Phone size={14} className="text-cyan-400" />
                              <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                                Teléfono
                              </p>
                            </div>
                            <p className="text-white text-base">{apt.telefono}</p>
                          </div>
                        </div>

                        <div className="bg-slate-950/30 rounded-xl p-4 border border-cyan-500/10 backdrop-blur-sm mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={14} className="text-cyan-400" />
                            <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                              Descripción
                            </p>
                          </div>
                          <p className="text-cyan-100 text-sm leading-relaxed italic">
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

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        appointmentInfo={appointmentToDelete}
      />
    </div>
  );
}