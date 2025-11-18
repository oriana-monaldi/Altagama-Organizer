"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="bg-cyan-700 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Wrench className="text-white" size={18} />
        <h1 className="text-white font-bold text-lg">Turnos</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <div className="text-white text-sm w-full sm:w-auto mt-1 sm:mt-0">
          {user?.displayName} • {user?.role === "admin" ? "admin" : "viewer"}
        </div>
        <div className="w-full sm:w-auto">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-cyan-800 border border-cyan-600 text-white hover:bg-cyan-900 px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
