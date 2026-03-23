"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Lock, User2 } from "lucide-react"
import { loginAction } from "./actions"

type LoginState = {
  error?: string
} | null

export default function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    async (_prevState, formData) => {
      return await loginAction(formData)
    },
    null
  )

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-[#3a2a00] bg-[#050505] p-8 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-center py-2">
          <img
            src="/logo.png"
            alt="SegMax"
            className="h-20 w-auto object-contain"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = "/favicon.ico"
            }}
          />
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold">Acesso ao sistema</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Entre com seu login e senha para acessar o sistema.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Login
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#090909] px-4 py-3 focus-within:border-[#4a3500]">
              <User2 size={18} className="text-zinc-500" />
              <input
                type="email"
                name="email"
                placeholder="Digite seu e-mail"
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Senha
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#090909] px-4 py-3 focus-within:border-[#4a3500]">
              <Lock size={18} className="text-zinc-500" />
              <input
                type={mostrarSenha ? "text" : "password"}
                name="password"
                placeholder="Digite sua senha"
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                className="text-zinc-500 transition hover:text-white"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {state?.error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {state.error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-[#d4a828] px-5 py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  )
}