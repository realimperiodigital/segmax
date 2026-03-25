"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SegmaxShell from "@/components/segmaxshell";
import { ArrowLeft, FileText } from "lucide-react";

type Cotacao = {
  id: string;
  numero?: string | null;
  titulo?: string | null;
  cliente_nome?: string | null;
  corretora_nome?: string | null;
  status?:
    | "Nova"
    | "Em análise"
    | "Aguardando seguradora"
    | "Proposta pronta"
    | "Fechada"
    | "Recusada"
    | null;
  created_at?: string | null;
};

export default function CotacaoDetalhePage() {
  const params = useParams();
  const id = params?.id as string;

  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarCotacao() {
      try {
        const response = await fetch(`/api/cotacoes/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar cotação");
        }

        const data = await response.json();
        setCotacao(data ?? null);
      } catch (error) {
        console.error("Erro ao buscar cotação:", error);
        setCotacao(null);
      } finally {
        setCarregando(false);
      }
    }

    if (id) {
      carregarCotacao();
    }
  }, [id]);

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/cotacoes"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para cotações
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <FileText className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-semibold text-white">
              Detalhes da Cotação
            </h1>
          </div>

          {carregando ? (
            <p className="text-gray-400">Carregando...</p>
          ) : !cotacao ? (
            <p className="text-red-400">Cotação não encontrada.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  ID
                </p>
                <p className="text-sm text-white">{cotacao.id}</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Número
                </p>
                <p className="text-sm text-white">{cotacao.numero || "-"}</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Título
                </p>
                <p className="text-sm text-white">{cotacao.titulo || "-"}</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Status
                </p>
                <p className="text-sm text-white">{cotacao.status || "Nova"}</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Cliente
                </p>
                <p className="text-sm text-white">
                  {cotacao.cliente_nome || "-"}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Corretora
                </p>
                <p className="text-sm text-white">
                  {cotacao.corretora_nome || "-"}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 md:col-span-2">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Criada em
                </p>
                <p className="text-sm text-white">
                  {cotacao.created_at
                    ? new Date(cotacao.created_at).toLocaleString("pt-BR")
                    : "-"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SegmaxShell>
  );
}