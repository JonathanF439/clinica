"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password);
      window.location.href = "/dashboard";
    } catch {
      setError("Login ou senha inválidos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-end pb-12 px-12"
        style={{
          backgroundImage: "url('/Login.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-black/45 pointer-events-none" />
        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Clínica Olhos David Tayah"
            width={80}
            height={80}
            className="object-contain mb-5 drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold text-white text-center leading-snug drop-shadow">
            Clínica Olhos<br />David Tayah
          </h1>
          <p className="mt-2 text-white/70 text-sm text-center">
            Sistema de Gestão Oftalmológica
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Image
              src="/logo.png"
              alt="Clínica Olhos David Tayah"
              width={80}
              height={80}
              className="object-contain mb-3"
            />
            <h1 className="text-xl font-bold text-zinc-900 text-center">
              Clínica Olhos David Tayah
            </h1>
          </div>

          <div className="mb-7 lg:block hidden">
            <h2 className="text-2xl font-bold text-zinc-900">Bem-vindo</h2>
            <p className="text-sm text-zinc-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Login
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Digite seu login"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Digite sua senha"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition mt-2"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
