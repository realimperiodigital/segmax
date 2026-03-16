"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FinanceStats = {
  corretoras: number;
  usuarios: number;
  clientes: number;
  cotacoes: number;
  analises: number;
};

export default function FinanceiroPage() {
  const [stats, setStats] = useState<FinanceStats>({
    corretoras: 0,
    usuarios: 0,
    clientes: 0,
    cotacoes: 0,
    analises: 0,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function contarTabela(
    tabela: string,
    filtros?: { coluna: string; valor: any }[]
  ) {
    let query = supabase
      .from(tabela)
      .select("*", { count: "exact", head: true });

    if (filtros?.length) {
      filtros.forEach((filtro) => {
        query = query.eq(filtro.coluna, filtro.valor);
      });
    }

    const { count, error } = await query;

    if (error) {
      console.error(`Erro ao contar ${tabela}:`, error.message);
      return 0;
    }

    return count || 0;
  }

  async function carregar() {
    const [
      corretoras,
      usuarios,
      clientes,
      cotacoes,
      analises,
    ] = await Promise.all([
      contarTabela("corretoras"),
      contarTabela("usuarios"),
      contarTabela("clientes", [{ coluna: "excluido", valor: false }]),
      contarTabela("cotacoes"),
      contarTabela("risk_analyses"),
    ]);

    setStats({
      corretoras,
      usuarios,
      clientes,
      cotacoes,
      analises,
    });
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="rounded-[30px] border border-yellow-500/15 bg-[#050505] p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
                SegMax • Financeiro
              </div>

              <h1 className="text-5xl font-black tracking-[-0.04em] text-white md:text-6xl">
                Visão financeira da operação.
              </h1>

              <p className="mt-5 text-lg leading-8 text-zinc-300">
                Área financeira inicial para o pré-lançamento. Aqui você já
                centraliza o que impacta o negócio e prepara a evolução para
                comissões, repasses, inadimplência, receitas, despesas e fluxo
                operacional.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-zinc-800 bg-[#111111] px-6 py-4 text-base font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Voltar ao dashboard
              </Link>

              <Link
                href="/cotacoes"
                className="rounded-2xl border border-yellow-500 bg-yellow-500 px-6 py-4 text-base font-semibold text-black transition hover:bg-yellow-400"
              >
                Ir para cotações
              </Link>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card
            titulo="Corretoras"
            valor={stats.corretoras}
            descricao="Empresas operando dentro do sistema."
          />
          <Card
            titulo="Usuários"
            valor={stats.usuarios}
            descricao="Equipe com impacto direto na operação."
          />
          <Card
            titulo="Clientes"
            valor={stats.clientes}
            descricao="Base comercial que gera receita."
          />
          <Card
            titulo="Cotações"
            valor={stats.cotacoes}
            descricao="Produção que pode virar faturamento."
          />
          <Card
            titulo="Análises"
            valor={stats.analises}
            descricao="Volume técnico agregado ao negócio."
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[30px] border border-yellow-500/12 bg-[#050505] p-6">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
              O que já está sob seu controle
            </h2>

            <div className="mt-6 space-y-4">
              <BlocoTexto texto="Acompanhar toda a base empresarial, operacional e técnica do SegMax." />
              <BlocoTexto texto="Ter visão do volume de clientes, usuários, cotações e análises já inseridos na plataforma." />
              <BlocoTexto texto="Preparar a estrutura para o financeiro real entrar sem quebrar o que já foi construído." />
            </div>
          </div>

          <div className="rounded-[30px] border border-yellow-500/12 bg-[#050505] p-6">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
              Próximas camadas do financeiro
            </h2>

            <div className="mt-6 space-y-4">
              <BlocoTexto texto="Receitas por corretora e por período." />
              <BlocoTexto texto="Comissões, repasses e conciliação financeira." />
              <BlocoTexto texto="Despesas, inadimplência e previsibilidade de caixa." />
              <BlocoTexto texto="Painel executivo de performance financeira do negócio." />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({
  titulo,
  valor,
  descricao,
}: {
  titulo: string;
  valor: number;
  descricao: string;
}) {
  return (
    <div className="rounded-[26px] border border-yellow-500/12 bg-[#050505] p-6">
      <p className="text-lg text-zinc-300">{titulo}</p>
      <div className="mt-4 text-5xl font-black tracking-[-0.04em] text-yellow-400">
        {valor}
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-400">{descricao}</p>
    </div>
  );
}

function BlocoTexto({ texto }: { texto: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#0b0b0b] px-5 py-5 text-sm leading-7 text-zinc-300">
      {texto}
    </div>
  );
}