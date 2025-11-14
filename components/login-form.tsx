"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(username, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center mb-12">
          <Image
            src="/altagama-logo.png"
            alt="AltaGama"
            width={280}
            height={280}
            priority
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Usuario</label>
              <Input
                type="text"
                placeholder="Ingrese el usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Contraseña</label>
              <Input
                type="password"
                placeholder="Ingrese la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border-cyan-600 text-white placeholder:text-gray-500 focus:border-cyan-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-cyan-700 hover:bg-cyan-600 text-white px-8 py-2"
              >
                Entrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
