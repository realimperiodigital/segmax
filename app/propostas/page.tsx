import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PropostaExecutiva } from "@/types/proposta-executiva";

function formatMoney(value: number | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(date: string | null | undefined) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "rascunho":
      return "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30";
    case "em_analise":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "aguardando_aprovacao":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
    case "aprovada":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "rejeitada":
      return "bg-red-500/15 text-red-300 border border-red-500/30";
    case "cancelada":
      return "bg-zinc-700/30 text-zinc-300 border border-zinc-700/40";
    case "emitida":
      return "bg-violet-500/15 text-violet-300 border border-violet-500/30";
    case "pos_venda":
      return "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30";
    default:
      return "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30";
  }
}

function getEtapaLabel(etapa: string) {
  switch (etapa) {
    case "criacao":
      return "Criação";
    case "analise":
      return "Análise";
    case "aprovacao":
      return "Aprovação";
    case "emissao":
      return "Emissão";
    case "implantacao":
      return "Implantação";
    case "pos_venda":
      return "Pós-venda";
    default:
      return etapa;
  }
}

export default async function PropostasPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vw_central_propostas")
    .select("*")
    .order("created_at", { ascending: false });

  const propostas = (data || []) as PropostaExecutiva[];

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Central de Propostas
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Controle completo do pipeline comercial.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            Voltar
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">

          {error ? (
            <div className="p-6 text-red-300">
              Erro ao carregar propostas: {error.message}
            </div>
          ) : propostas.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Nenhuma proposta encontrada.
            </div>
          ) : (

            <table className="min-w-full text-sm">

              <thead className="bg-white/[0.03] text-left text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Seguradora</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Etapa</th>
                  <th className="px-6 py-4">Prêmio</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>

              <tbody>

                {propostas.map((proposta) => (

                  <tr
                    key={proposta.id}
                    className="border-t border-white/5 hover:bg-white/[0.03]"
                  >

                    <td className="px-6 py-4 font-semibold">
                      {proposta.codigo}
                    </td>

                    <td className="px-6 py-4">
                      {proposta.cliente_nome}
                    </td>

                    <td className="px-6 py-4">
                      {proposta.seguradora_nome}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                          proposta.status
                        )}`}
                      >
                        {proposta.status}
                      </span>

                    </td>

                    <td className="px-6 py-4">
                      {getEtapaLabel(proposta.etapa)}
                    </td>

                    <td className="px-6 py-4 font-semibold text-cyan-300">
                      {formatMoney(proposta.valor_premio)}
                    </td>

                    <td className="px-6 py-4">

                      <Link
                        href={`/propostas/${proposta.id}`}
                        className="px-3 py-1 rounded-lg border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
                      >
                        Abrir
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>
    </div>
  );
}