"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard-header";
import { AppointmentsList } from "@/components/appointments-list";
import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Image from "next/image";
import type { Appointment } from "@/lib/appointments";

type View = "home" | "list" | "add" | "edit";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setView("edit");
  };

  const handleSuccess = () => {
    setView("list");
    setEditingAppointment(undefined);
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {view === "home" && (
          <>
            <DashboardHeader />

            <div className="flex justify-center py-12">
              <Image
                src="/altagama-logo.png"
                alt="AltaGama"
                width={320}
                height={320}
                priority
              />
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setView("list")}
                className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-6 text-lg"
              >
                VER TURNOS
              </Button>

              {user.role === "admin" && (
                <Button
                  onClick={() => setView("add")}
                  className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-6 text-lg"
                >
                  AÑADIR NUEVO TURNO
                </Button>
              )}
            </div>
          </>
        )}

        {view === "list" && (
          <>
            <Button
              onClick={() => setView("home")}
              variant="ghost"
              className="text-white hover:text-cyan-300 hover:bg-white/10 p-2"
            >
              <ArrowLeft size={24} />
            </Button>

            <DashboardHeader />

            <AppointmentsList
              onEdit={handleEdit}
              onAdd={user.role === "admin" ? () => setView("add") : undefined}
            />
          </>
        )}

        {(view === "add" || view === "edit") && (
          <AppointmentForm
            appointment={editingAppointment}
            onBack={() => {
              setView("list");
              setEditingAppointment(undefined);
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
