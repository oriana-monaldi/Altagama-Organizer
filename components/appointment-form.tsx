"use client";

import { useState, useEffect } from "react";
import { addAppointment, updateAppointment, type Appointment } from "@/lib/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Phone, Wrench, CalendarIcon, Clock, Car } from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment;
  onBack: () => void;
  onSuccess: () => void;
}

export function AppointmentForm({ appointment, onBack, onSuccess }: AppointmentFormProps) {
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
    setLoading(true);

    try {
      if (appointment?.id) {
        await updateAppointment(appointment.id, formData);
      } else {
        await addAppointment(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Error al guardar el turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto px-4 sm:px-0">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-white hover:text-cyan-300 hover:bg-white/10 p-2"
      >
        <ArrowLeft size={24} />
      </Button>

      <h2 className="text-2xl font-bold text-white text-center">
        {appointment ? "EDITAR TURNO" : "NUEVO TURNO"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm sm:text-base text-white flex items-center gap-2">
            <User size={18} />
            Nombre Completo
          </label>
          <Input
            type="text"
            placeholder="Nombre completo"
            value={formData.nombreCompleto}
            onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
            required
            className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500 py-3 sm:py-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm sm:text-base text-white flex items-center gap-2">
            <Phone size={18} />
            Teléfono
          </label>
          <Input
            type="tel"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            required
            className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500 py-3 sm:py-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm sm:text-base text-white flex items-center gap-2">
            <Wrench size={18} />
            Descripción del trabajo
          </label>
          <Textarea
            placeholder="Descripción del trabajo"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            required
            className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500 min-h-[100px] py-3 sm:py-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white flex items-center gap-2">
            <CalendarIcon size={16} />
            Fecha
          </label>
          <div className="relative">
            <Input
              id="fecha-input"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
              className="bg-black border-cyan-600 text-white focus:border-cyan-500 pr-12 py-3 sm:py-4"
            />
            <button
              type="button"
              aria-label="Abrir selector de fecha"
              onClick={() => {
                const el = document.getElementById('fecha-input') as HTMLInputElement | null;
                if (!el) return;
                // showPicker está disponible en algunos navegadores; si no, focus()
                // @ts-ignore
                if (typeof el.showPicker === 'function') el.showPicker();
                else el.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2 hover:text-cyan-200"
            >
              <CalendarIcon size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white flex items-center gap-2">
            <Clock size={16} />
            Hora
          </label>
          <div className="relative">
            <Input
              id="hora-input"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              required
              className="bg-black border-cyan-600 text-white focus:border-cyan-500 pr-12 py-3 sm:py-4"
            />
            <button
              type="button"
              aria-label="Abrir selector de hora"
              onClick={() => {
                const el = document.getElementById('hora-input') as HTMLInputElement | null;
                if (!el) return;
                // @ts-ignore
                if (typeof el.showPicker === 'function') el.showPicker();
                else el.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2 hover:text-cyan-200"
            >
              <Clock size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white flex items-center gap-2">
            <Car size={16} />
            Patente
          </label>
          <Input
            type="text"
            placeholder="Patente del vehículo"
            value={formData.patente}
            onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
            required
            className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white flex items-center gap-2">
            <Car size={16} />
            Modelo
          </label>
          <Input
            type="text"
            placeholder="Modelo del vehículo"
            value={formData.modelo}
            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
            required
            className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-4 sm:py-6 text-lg"
        >
          {loading ? "Guardando..." : appointment ? "Actualizar Turno" : "Registrar Turno"}
        </Button>
      </form>
    </div>
  );
}
