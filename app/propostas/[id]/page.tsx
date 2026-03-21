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

  const total = propostas.length;
  const emAnalise = propostas.filter((item) => item.status === "em_analise").length;
  const aguardandoAprovacao = propostas.filter(
    (item) => item.status === "aguardando_aprovacao"
  ).length;
  const aprovadas = propostas.filter((item) => item.status === "aprovada").length;
  const emitidas = propostas.filter((item) => item.status === "emitida").length;

  const volumePremio = propostas.reduce(
    (acc, item) => acc + Number(item.valor_premio || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              SegMax CRM
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              Central de Propostas
            </h1>
            <p className="max-w-3xl text-sm text-zinc-300">
              Aqui fica o coração comercial da operação. É onde a equipe acompanha
              cada proposta, em que fase ela está, qual seguradora está envolvida,
              o valor do prêmio, a evolução da análise e o que já foi aprovado,
              emitido ou virou pós-venda.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Voltar ao dashboard
            </Link>

            <Link
              href="/propostas/nova"
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Nova proposta
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Total de propostas</p>
            <p className="mt-2 text-3xl font-bold">{total}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Em análise</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{emAnalise}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Aguardando aprovação</p>
            <p className="mt-2 text-3xl font-bold text-sky-300">
              {aguardandoAprovacao}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Aprovadas</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">
              {aprovadas}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Volume em prêmio</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">
              {formatMoney(volumePremio)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">Pipeline de propostas</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Visualização centralizada para Master, Ana Paula e equipe autorizada.
            </p>
          </div>

          {error ? (
            <div className="p-6 text-sm text-red-300">
              Erro ao carregar propostas: {error.message}
            </div>
          ) : propostas.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Nenhuma proposta encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.03] text-left text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Código</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Corretora</th>
                    <th className="px-6 py-4 font-medium">Seguradora</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Etapa</th>
                    <th className="px-6 py-4 font-medium">Prêmio</th>
                    <th className="px-6 py-4 font-medium">Responsável</th>
                    <th className="px-6 py-4 font-medium">Atualização</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {propostas.map((proposta) => (
                    <tr
                      key={proposta.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {proposta.codigo || "-"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {formatDate(proposta.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {proposta.cliente_nome}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {proposta.cliente_documento || "Documento não informado"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {proposta.corretora_nome || "-"}
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {proposta.seguradora_nome || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-white">{proposta.tipo_seguro || "-"}</div>
                        <div className="text-xs text-zinc-500">
                          {proposta.categoria || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            proposta.status
                          )}`}
                        >
                          {proposta.status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {getEtapaLabel(proposta.etapa)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-cyan-300">
                        {formatMoney(proposta.valor_premio)}
                      </td>

                      <td className="px-6 py-4 text-zinc-200">
                        {proposta.responsavel_nome || "-"}
                      </td>

                      <td className="px-6 py-4 text-zinc-400">
                        {formatDate(proposta.updated_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/propostas/${proposta.id}`}
                            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                          >
                            Abrir
                          </Link>

                          <Link
                            href={`/propostas/${proposta.id}/editar`}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">O que essa etapa já entrega</h3>
            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              <p>• Base estruturada de propostas</p>
              <p>• Histórico automático das movimentações</p>
              <p>• Pipeline centralizado com status e etapa</p>
              <p>• Volume comercial visível em prêmio</p>
              <p>• Fundação pronta para envio, aprovação e pós-venda</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Próximo bloco</h3>
            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              <p>• página individual da proposta</p>
              <p>• parecer técnico</p>
              <p>• timeline do histórico</p>
              <p>• mudança de status</p>
              <p>• aprovar, rejeitar, emitir e pós-venda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}