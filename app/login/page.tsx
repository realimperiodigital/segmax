"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setErro("Perfil não encontrado.");
      setLoading(false);
      return;
    }

    if (profile.status !== "ativo") {
      setErro("Usuário desativado.");
      setLoading(false);
      return;
    }

    if (profile.role === "super_master") {
      router.push("/master");
      return;
    }

    if (profile.role === "master_tecnico") {
      router.push("/master/tecnico");
      return;
    }

    if (profile.role === "master_financeiro") {
      router.push("/master/financeiro");
      return;
    }

    setErro("Permissão inválida.");
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06070a] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,166,58,0.16),transparent_35%),radial-gradient(circle_at_bottom,rgba(192,198,210,0.08),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-md rounded-[30px] border border-[#262a33] bg-[#101116]/95 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex justify-center">
            <Image
              src="/segmax-logo.png"
              alt="Logo SegMax"
              width={220}
              height={220}
              className="h-auto w-[170px] object-contain md:w-[200px]"
              priority
            />
          </div>

          <p className="mt-2 text-sm text-[#a9afba]">
            Acesso interno do sistema
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#d8dde6]">
              Email
            </label>
            <input
              type="email"
              placeholder="Digite seu email"
              className="w-full rounded-2xl border border-[#2a2d34] bg-[#181a20] px-4 py-3 text-white outline-none transition focus:border-[#d4a63a] focus:ring-2 focus:ring-[#d4a63a]/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d8dde6]">
              Senha
            </label>
            <input
              type="password"
              placeholder="Digite sua senha"
              className="w-full rounded-2xl border border-[#2a2d34] bg-[#181a20] px-4 py-3 text-white outline-none transition focus:border-[#d4a63a] focus:ring-2 focus:ring-[#d4a63a]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {erro ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#f3d36b] via-[#d4a63a] to-[#8f6a18] px-4 py-3 text-sm font-bold text-[#06070a] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar no SegMax"}
          </button>
        </form>
      </div>
    </main>
  );
}