"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="bg-cyan-700 rounded-lg px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Wrench className="text-white" size={24} />
        <div>
          <h1 className="text-white font-semibold text-lg">Turnos de hoy</h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
        <span className="text-white text-sm truncate max-w-full md:max-w-xs">
          {user?.displayName} • {user?.role === "admin" ? "admin" : "viewer"}
        </span>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="bg-cyan-800 border-cyan-600 text-white hover:bg-cyan-900 w-full md:w-auto"
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
