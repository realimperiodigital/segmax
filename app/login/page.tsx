"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User2 } from "lucide-react"
import {
  getRedirectByRole,
  normalizarSegmaxRole,
  type SegmaxRole,
} from "@/lib/segmax-perfil"

type UsuarioSistema = {
  login: string
  senha: string
  nome: string
  role: SegmaxRole
}

const USUARIOS_SEGMAX: UsuarioSistema[] = [
  {
    login: "segmaxconsultoria10@gmail.com",
    senha: "Nr47444682@",
    nome: "Renato Silva",
    role: "master",
  },
  {
    login: "tecmastersegmax@gmail.com",
    senha: "Segmax@123",
    nome: "Ana Paula",
    role: "tecnico",
  },
  {
    login: "alessandra.myryam26@gmail.com",
    senha: "Am19039115@",
    nome: "Alessandra Mendes",
    role: "financeiro",
  },
]

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=/`
}

function salvarSessao(usuario: UsuarioSistema) {
  const role = normalizarSegmaxRole(usuario.role)

  setCookie("segmax_permissao", role)
  setCookie("segmax_role", role)
  setCookie("segmax_nome", usuario.nome)

  localStorage.setItem("segmax_permissao", role)
  localStorage.setItem("segmax_role", role)
  localStorage.setItem("segmax_nome", usuario.nome)
}

export default function LoginPage() {
  const router = useRouter()

  const [login, setLogin] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const usuarios = useMemo(() => USUARIOS_SEGMAX, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro("")
    setLoading(true)

    try {
      const loginNormalizado = login.trim().toLowerCase()
      const senhaNormalizada = senha.trim()

      const usuario = usuarios.find(
        (item) =>
          item.login.toLowerCase() === loginNormalizado &&
          item.senha === senhaNormalizada
      )

      if (!usuario) {
        setErro("Login ou senha inválidos.")
        setLoading(false)
        return
      }

      salvarSessao(usuario)

      const destino = getRedirectByRole(usuario.role)

      setTimeout(() => {
        router.replace(destino)
      }, 150)
    } catch {
      setErro("Não foi possível entrar no sistema.")
      setLoading(false)
    }
  }

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
            Entre com seu login e senha para acessar a área correta da operação.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Login
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#090909] px-4 py-3 focus-within:border-[#4a3500]">
              <User2 size={18} className="text-zinc-500" />
              <input
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                autoComplete="username"
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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                autoComplete="current-password"
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

          {erro ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#d4a828] px-5 py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  )
}