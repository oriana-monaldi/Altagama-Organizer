"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { addAppointment, updateAppointment, type Appointment } from "@/lib/appointments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, Phone, Wrench, Calendar, Clock, Car, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AppointmentFormProps {
  appointment?: Appointment
  onBack: () => void
  onSuccess: () => void
}

function DatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (date: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [y, m] = value.split("-")
      return new Date(Number.parseInt(y), Number.parseInt(m) - 1, 1)
    }
    return new Date()
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const selectDate = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (selected >= today) {
      const yyyy = selected.getFullYear()
      const mm = String(selected.getMonth() + 1).padStart(2, "0")
      const dd = String(selected.getDate()).padStart(2, "0")
      onChange(`${yyyy}-${mm}-${dd}`)
      setOpen(false)
    }
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Seleccionar fecha"
    const [y, m, d] = dateStr.split("-")
    const date = new Date(Number.parseInt(y), Number.parseInt(m) - 1, Number.parseInt(d))
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const monthName = currentMonth.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 text-left flex items-center justify-between group"
        >
          <span className={value ? "" : "text-gray-500"}>{formatDisplayDate(value)}</span>
          <Calendar size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-black/60 border-2 border-cyan-600/40 backdrop-blur-xl shadow-2xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-2 hover:bg-cyan-600/20 rounded-lg transition-colors">
              <ChevronDown size={20} className="rotate-90 text-cyan-400" />
            </button>
            <span className="text-white font-semibold capitalize">{monthName}</span>
            <button type="button" onClick={nextMonth} className="p-2 hover:bg-cyan-600/20 rounded-lg transition-colors">
              <ChevronDown size={20} className="-rotate-90 text-cyan-400" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
              <div key={`day-${idx}`} className="text-center text-xs font-semibold text-cyan-400/80 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isPast = date < today
              const isSelected =
                value ===
                `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isPast && selectDate(day)}
                  disabled={isPast}
                  className={`
                    p-2 text-sm rounded-lg transition-all font-medium
                    ${isPast ? "text-gray-600 cursor-not-allowed opacity-40" : "text-white hover:bg-cyan-600/30 hover:scale-105"}
                    ${isSelected ? "bg-cyan-600 text-black font-bold shadow-lg scale-105" : ""}
                    ${isToday && !isSelected ? "ring-2 ring-cyan-400/60" : ""}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TimePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (time: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [tempHour, setTempHour] = useState<string>("09")
  const [tempMinute, setTempMinute] = useState<string>("00")

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  useEffect(() => {
    if (open && value) {
      const [h, m] = value.split(":")
      setTempHour(h)
      setTempMinute(m)
    } else if (open && !value) {
      setTempHour("09")
      setTempMinute("00")
    }
  }, [open, value])

  const handleHourSelect = (hour: string) => {
    setTempHour(hour)
  }

  const handleMinuteSelect = (minute: string) => {
    setTempMinute(minute)
  }

  const confirmTime = () => {
    onChange(`${tempHour}:${tempMinute}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 text-left flex items-center justify-between group"
        >
          <span className={value ? "" : "text-gray-500"}>{value || "Seleccionar hora"}</span>
          <Clock size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-black/60 border-2 border-cyan-600/40 backdrop-blur-xl shadow-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-cyan-400 font-semibold mb-2 text-center uppercase tracking-wider">Hora</p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-cyan-600/50 scrollbar-track-transparent hover:scrollbar-thumb-cyan-600/70">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={`
                      w-full p-2 text-sm rounded-lg transition-all font-medium
                      ${tempHour === hour ? "bg-cyan-600 text-black font-bold shadow-lg scale-105" : "text-white hover:bg-cyan-600/20 hover:scale-105"}
                    `}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-cyan-400 font-semibold mb-2 text-center uppercase tracking-wider">Minutos</p>
              <div className="space-y-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={`
                      w-full p-2 text-sm rounded-lg transition-all font-medium
                      ${tempMinute === minute ? "bg-cyan-600 text-black font-bold shadow-lg scale-105" : "text-white hover:bg-cyan-600/20 hover:scale-105"}
                    `}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={confirmTime}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Confirmar
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    
    if (appointment) {
      setFormData({
        nombreCompleto: appointment.nombreCompleto,
        telefono: appointment.telefono,
        descripcion: appointment.descripcion,
        fecha: appointment.fecha,
        hora: appointment.hora,
        patente: appointment.patente,
        modelo: appointment.modelo,
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      function toLocalISO(d: Date) {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        return `${yyyy}-${mm}-${dd}`
      }

      const todayISO = toLocalISO(new Date())
      const selectedISO = (formData.fecha || "").trim()
      const selectedTime = (formData.hora || "").trim()

      if (!selectedISO) {
        setError("Fecha de turno inválida")
        setLoading(false)
        return
      }

      if (selectedISO < todayISO) {
        setError("No puedes crear un turno para una fecha anterior a hoy")
        setLoading(false)
        return
      }

      if (selectedISO === todayISO) {
        if (!selectedTime) {
          setError("Hora de turno inválida")
          setLoading(false)
          return
        }

        const [hh, mm] = selectedTime.split(":").map((v) => Number.parseInt(v, 10))
        if (Number.isNaN(hh) || Number.isNaN(mm)) {
          setError("Hora de turno inválida")
          setLoading(false)
          return
        }

        const [y, m, d] = selectedISO.split("-").map((v) => Number.parseInt(v, 10))
        const selectedDateTime = new Date(y, m - 1, d, hh, mm, 0, 0)
        const now = new Date()

        if (selectedDateTime <= now) {
          setError("No puedes crear un turno para una hora anterior a la actual")
          setLoading(false)
          return
        }
      }

      if (appointment?.id) {
        await updateAppointment(appointment.id, formData)
      } else {
        await addAppointment(formData)
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving appointment:", error)
      setError("Error al guardar el turno")
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-3xl font-bold text-white">{appointment ? "Editar Turno" : "Nuevo Turno"}</h1>
            <p className="text-gray-400">
              {appointment ? "Modifica los detalles de tu turno" : "Completa el formulario para agendar tu turno"}
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
                <h3 className="text-lg font-semibold text-white">Información Personal</h3>
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
                    className="h-12 px-4 bg-black/30 border-2 border-cyan-600/30 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 outline-none transition-all duration-300 group-hover:border-cyan-500/50"
                  />
                </div>
              </div>

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
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                <h3 className="text-lg font-semibold text-white">Detalles del Servicio</h3>
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
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                  <DatePicker value={formData.fecha} onChange={(fecha) => setFormData({ ...formData, fecha })} />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                    <Clock size={16} />
                    Hora
                  </label>
                  <TimePicker value={formData.hora} onChange={(hora) => setFormData({ ...formData, hora })} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                <Car size={20} className="text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Información del Vehículo</h3>
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
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
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
  )
}
