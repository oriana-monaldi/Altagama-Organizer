"use client";

import { useState, useEffect } from "react";
import {
  addAppointment,
  updateAppointment,
  type Appointment,
} from "@/lib/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  User,
  Phone,
  Wrench,
  Calendar,
  Clock,
  Car,
  Sparkles,
} from "lucide-react";

interface AppointmentFormProps {
  appointment?: Appointment;
  onBack: () => void;
  onSuccess: () => void;
}

export function AppointmentForm({
  appointment,
  onBack,
  onSuccess,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    telefono: "",
    descripcion: "",
    fecha: "",
    hora: "",
    patente: "",
    modelo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (appointment) {
      setFormData({
        nombreCompleto: appointment.nombreCompleto,
        telefono: appointment.telefono,
        descripcion: appointment.descripcion,
        fecha: appointment.fecha,
        hora: appointment.hora,
        patente: appointment.patente,
        modelo: appointment.modelo,
      });
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      function toLocalISO(d: Date) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }

      const todayISO = toLocalISO(new Date());
      const selectedISO = (formData.fecha || "").trim();
      const selectedTime = (formData.hora || "").trim();

      if (!selectedISO) {
        setError("Fecha de turno inválida");
        setLoading(false);
        return;
      }

      if (selectedISO < todayISO) {
        setError("No puedes crear un turno para una fecha anterior a hoy");
        setLoading(false);
        return;
      }

      if (selectedISO === todayISO) {
        if (!selectedTime) {
          setError("Hora de turno inválida");
          setLoading(false);
          return;
        }

        const [hh, mm] = selectedTime.split(":").map((v) => parseInt(v, 10));
        if (Number.isNaN(hh) || Number.isNaN(mm)) {
          setError("Hora de turno inválida");
          setLoading(false);
          return;
        }

        const [y, m, d] = selectedISO.split("-").map((v) => parseInt(v, 10));
        const selectedDateTime = new Date(y, m - 1, d, hh, mm, 0, 0);
        const now = new Date();

        if (selectedDateTime <= now) {
          setError(
            "No puedes crear un turno para una hora anterior a la actual"
          );
          setLoading(false);
          return;
        }
      }

      if (appointment?.id) {
        await updateAppointment(appointment.id, formData);
      } else {
        await addAppointment(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving appointment:", error);
      setError("Error al guardar el turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="group flex items-center gap-2 text-cyan-300 hover:text-white transition-all duration-300 mb-6 p-0 h-auto"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 backdrop-blur-sm transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium">Volver</span>
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {appointment ? "Editar Turno" : "Nuevo Turno"}
            </h1>
            <p className="text-gray-400">
              {appointment
                ? "Modifica los detalles de tu turno"
                : "Completa el formulario para agendar tu turno"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/50 backdrop-blur-sm animate-pulse">
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                <User size={20} className="text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  Información Personal
                </h3>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                  <User size={16} />
                  Nombre Completo
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    value={formData.nombreCompleto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombreCompleto: e.target.value,
                      })
                    }
                    required
                    className="h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 group-hover:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                  <Phone size={16} />
                  Teléfono
                </label>
                <div className="relative group">
                  <Input
                    type="tel"
                    placeholder="Ej: +54 9 11 1234-5678"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    required
                    className="w-full h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 group-hover:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                <Wrench size={20} className="text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  Detalles del Servicio
                </h3>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                  <Wrench size={16} />
                  Descripción del Trabajo
                </label>
                <div className="relative group">
                  <Textarea
                    placeholder="Describe el trabajo a realizar (ej: Cambio de aceite, revisión general, reparación de frenos...)"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 resize-none group-hover:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                    <Calendar size={16} />
                    Fecha
                  </label>
                  <div className="relative group">
                    <Input
                      id="fecha-input"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      required
                      className="h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 group-hover:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                    <Clock size={16} />
                    Hora
                  </label>
                  <div className="relative group">
                    <Input
                      id="hora-input"
                      type="time"
                      value={formData.hora}
                      onChange={(e) =>
                        setFormData({ ...formData, hora: e.target.value })
                      }
                      required
                      className=" h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 group-hover:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                <Car size={20} className="text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  Información del Vehículo
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                    <Car size={16} />
                    Patente
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      placeholder="ABC 123"
                      value={formData.patente}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          patente: e.target.value.toUpperCase(),
                        })
                      }
                      required
                      className="w-full h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 uppercase group-hover:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                    <Car size={16} />
                    Modelo
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      placeholder="Ej: Toyota Corolla 2020"
                      value={formData.modelo}
                      onChange={(e) =>
                        setFormData({ ...formData, modelo: e.target.value })
                      }
                      required
                      className="w-full h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 group-hover:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 sm:h-16 bg-cyan-700 hover:bg-cyan-600 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>{appointment ? "Actualizar Turno" : "Registrar Turno"}</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
