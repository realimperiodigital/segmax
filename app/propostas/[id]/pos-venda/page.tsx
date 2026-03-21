import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type PosVendaRow = {
  id: string;
  proposta_id: string;
  cliente_nome: string | null;
  corretora_nome: string | null;
  status_relacionamento: StatusRelacionamento;
  etapa_atual: EtapaPosVenda;
  responsavel_nome: string | null;
  responsavel_id: string | null;
  data_inicio: string | null;
  proximo_contato_em: string | null;
  renovacao_prevista_em: string | null;
  pendencias: string | null;
  observacoes: string | null;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

type PropostaBase = {
  id: string;
  titulo?: string | null;
  nome?: string | null;
  cliente_nome?: string | null;
  segurado_nome?: string | null;
  empresa?: string | null;
  corretora_nome?: string | null;
  premio_total?: number | null;
  valor_total?: number | null;
  status?: string | null;
  created_at?: string | null;
  criado_em?: string | null;
};

type StatusRelacionamento =
  | "ativo"
  | "em_risco"
  | "renovando"
  | "encerrado";

type EtapaPosVenda =
  | "onboarding"
  | "implantacao"
  | "acompanhamento"
  | "renovacao"
  | "retencao"
  | "encerrado";

const STATUS_RELACIONAMENTO_LABELS: Record<StatusRelacionamento, string> = {
  ativo: "Ativo",
  em_risco: "Em risco",
  renovando: "Renovando",
  encerrado: "Encerrado",
};

const STATUS_RELACIONAMENTO_STYLES: Record<StatusRelacionamento, string> = {
  ativo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  em_risco: "border-amber-200 bg-amber-50 text-amber-700",
  renovando: "border-blue-200 bg-blue-50 text-blue-700",
  encerrado: "border-rose-200 bg-rose-50 text-rose-700",
};

const ETAPA_LABELS: Record<EtapaPosVenda, string> = {
  onboarding: "Onboarding",
  implantacao: "Implantação",
  acompanhamento: "Acompanhamento",
  renovacao: "Renovação",
  retencao: "Retenção",
  encerrado: "Encerrado",
};

const ETAPA_FLOW: EtapaPosVenda[] = [
  "onboarding",
  "implantacao",
  "acompanhamento",
  "renovacao",
  "retencao",
  "encerrado",
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas."
    );
  }

  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function formatMoney(value?: number | null) {
  if (typeof value !== "number") return "Não informado";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatDateOnly(value?: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

function normalizeDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizeDateInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
}

function getEtapaProgress(etapa: EtapaPosVenda) {
  const index = ETAPA_FLOW.indexOf(etapa);
  if (index === -1) return 0;
  return Math.round(((index + 1) / ETAPA_FLOW.length) * 100);
}

function getEtapaDescription(etapa: EtapaPosVenda) {
  switch (etapa) {
    case "onboarding":
      return "Entrada inicial do cliente, alinhamento de operação e organização das informações.";
    case "implantacao":
      return "Fase de implantação do relacionamento e execução dos combinados iniciais.";
    case "acompanhamento":
      return "Cliente ativo com monitoramento recorrente, atendimento e controle de pendências.";
    case "renovacao":
      return "Momento de preparar a renovação e agir antes que o prazo aperte.";
    case "retencao":
      return "Fase de retenção, fortalecimento do vínculo e ampliação de oportunidades.";
    case "encerrado":
      return "Ciclo encerrado no pós-venda.";
    default:
      return "";
  }
}

function getRelationshipDescription(status: StatusRelacionamento) {
  switch (status) {
    case "ativo":
      return "Relacionamento saudável e com continuidade normal.";
    case "em_risco":
      return "Cliente exige atenção imediata para evitar perda ou desgaste.";
    case "renovando":
      return "Conta em fase de renovação e negociação de continuidade.";
    case "encerrado":
      return "Relacionamento encerrado.";
    default:
      return "";
  }
}

async function upsertPosVenda(formData: FormData) {
  "use server";

  const propostaId = String(formData.get("propostaId") || "");
  const clienteNome = String(formData.get("clienteNome") || "").trim();
  const corretoraNome = String(formData.get("corretoraNome") || "").trim();
  const statusRelacionamento = String(
    formData.get("statusRelacionamento") || "ativo"
  ) as StatusRelacionamento;
  const etapaAtual = String(
    formData.get("etapaAtual") || "onboarding"
  ) as EtapaPosVenda;
  const responsavelNome = String(formData.get("responsavelNome") || "").trim();
  const dataInicio = String(formData.get("dataInicio") || "").trim();
  const proximoContatoEm = String(formData.get("proximoContatoEm") || "").trim();
  const renovacaoPrevistaEm = String(
    formData.get("renovacaoPrevistaEm") || ""
  ).trim();
  const pendencias = String(formData.get("pendencias") || "").trim();
  const observacoes = String(formData.get("observacoes") || "").trim();

  if (!propostaId) {
    redirect(`/propostas/${propostaId}/pos-venda?erro=1`);
  }

  const supabase = getSupabase();

  const { error } = await supabase.rpc("upsert_proposta_pos_venda", {
    p_proposta_id: propostaId,
    p_cliente_nome: clienteNome || null,
    p_corretora_nome: corretoraNome || null,
    p_status_relacionamento: statusRelacionamento,
    p_etapa_atual: etapaAtual,
    p_responsavel_nome: responsavelNome || null,
    p_responsavel_id: null,
    p_data_inicio: dataInicio || null,
    p_proximo_contato_em: proximoContatoEm
      ? new Date(proximoContatoEm).toISOString()
      : null,
    p_renovacao_prevista_em: renovacaoPrevistaEm || null,
    p_pendencias: pendencias || null,
    p_observacoes: observacoes || null,
    p_criado_por: null,
  });

  if (error) {
    redirect(`/propostas/${propostaId}/pos-venda?erro=1`);
  }

  revalidatePath(`/propostas/${propostaId}/pos-venda`);
  redirect(`/propostas/${propostaId}/pos-venda?ok=1`);
}

async function moveToPosVenda(formData: FormData) {
  "use server";

  const propostaId = String(formData.get("propostaId") || "");

  if (!propostaId) {
    redirect(`/propostas/${propostaId}/pos-venda?erroStatus=1`);
  }

  const supabase = getSupabase();

  const { error } = await supabase.rpc("registrar_historico_proposta", {
    p_proposta_id: propostaId,
    p_status_anterior: "emitida",
    p_status_novo: "pos_venda",
    p_acao: "pos_venda",
    p_observacao: "Proposta movida para pós-venda pela tela operacional.",
    p_detalhes: {
      origem: "tela_pos_venda",
      atualizado_em: new Date().toISOString(),
    },
    p_criado_por: null,
  });

  if (error) {
    redirect(`/propostas/${propostaId}/pos-venda?erroStatus=1`);
  }

  revalidatePath(`/propostas/${propostaId}`);
  revalidatePath(`/propostas/${propostaId}/pos-venda`);
  redirect(`/propostas/${propostaId}/pos-venda?okStatus=1`);
}

async function getData(propostaId: string): Promise<{
  proposta: PropostaBase | null;
  posVenda: PosVendaRow | null;
}> {
  const supabase = getSupabase();

  const [{ data: propostaData }, { data: posVendaData }] = await Promise.all([
    supabase.from("propostas").select("*").eq("id", propostaId).maybeSingle(),
    supabase
      .from("vw_proposta_pos_venda")
      .select("*")
      .eq("proposta_id", propostaId)
      .maybeSingle(),
  ]);

  return {
    proposta: (propostaData ?? null) as PropostaBase | null,
    posVenda: (posVendaData ?? null) as PosVendaRow | null,
  };
}

export default async function PropostaPosVendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { proposta, posVenda } = await getData(id);

  const nomePrincipal =
    proposta?.titulo ||
    proposta?.nome ||
    proposta?.cliente_nome ||
    proposta?.segurado_nome ||
    proposta?.empresa ||
    posVenda?.cliente_nome ||
    "Cliente da Proposta";

  const corretoraNome =
    posVenda?.corretora_nome || proposta?.corretora_nome || "Não informado";

  const valorTotal = proposta?.valor_total ?? proposta?.premio_total ?? null;
  const statusRelacionamento = posVenda?.status_relacionamento ?? "ativo";
  const etapaAtual = posVenda?.etapa_atual ?? "onboarding";
  const progresso = getEtapaProgress(etapaAtual);

  const ok = resolvedSearchParams?.ok;
  const erro = resolvedSearchParams?.erro;
  const okStatus = resolvedSearchParams?.okStatus;
  const erroStatus = resolvedSearchParams?.erroStatus;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                SegMax CRM • Pós-venda
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                Gestão de Pós-venda da Proposta
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                Controle de relacionamento, renovação, próximo contato,
                pendências e retenção do cliente após o fechamento.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/propostas/${id}`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Voltar para proposta
              </Link>

              <form action={moveToPosVenda}>
                <input type="hidden" name="propostaId" value={id} />
                <button
                  type="submit"
                  className="rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Marcar proposta como pós-venda
                </button>
              </form>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${STATUS_RELACIONAMENTO_STYLES[statusRelacionamento]}`}
            >
              Relacionamento: {STATUS_RELACIONAMENTO_LABELS[statusRelacionamento]}
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Etapa: {ETAPA_LABELS[etapaAtual]}
            </div>
          </div>

          {ok ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Pós-venda salvo com sucesso.
            </div>
          ) : null}

          {erro ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Não foi possível salvar os dados do pós-venda.
            </div>
          ) : null}

          {okStatus ? (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              A proposta foi marcada no histórico como pós-venda.
            </div>
          ) : null}

          {erroStatus ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Não foi possível atualizar o status da proposta para pós-venda.
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  {nomePrincipal}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Proposta vinculada: {id}
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Corretora" value={corretoraNome} />
                <InfoCard label="Valor" value={formatMoney(valorTotal)} />
                <InfoCard
                  label="Próximo contato"
                  value={formatDate(posVenda?.proximo_contato_em)}
                />
                <InfoCard
                  label="Renovação"
                  value={formatDateOnly(posVenda?.renovacao_prevista_em)}
                />
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
                    Evolução do Pós-venda
                  </h3>
                  <span className="text-sm font-semibold text-slate-700">
                    {progresso}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{ width: `${progresso}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {getEtapaDescription(etapaAtual)}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {ETAPA_FLOW.map((etapa) => {
                    const active = etapa === etapaAtual;
                    const reached =
                      ETAPA_FLOW.indexOf(etapa) <= ETAPA_FLOW.indexOf(etapaAtual);

                    return (
                      <div
                        key={etapa}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : reached
                              ? "border-slate-300 bg-slate-100 text-slate-700"
                              : "border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {ETAPA_LABELS[etapa]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Formulário operacional de pós-venda
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Atualize o responsável, a etapa atual, próximos contatos,
                  renovação prevista e as pendências do cliente.
                </p>
              </div>

              <form action={upsertPosVenda} className="space-y-5">
                <input type="hidden" name="propostaId" value={id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Cliente">
                    <input
                      type="text"
                      name="clienteNome"
                      defaultValue={posVenda?.cliente_nome ?? nomePrincipal}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      placeholder="Nome do cliente"
                    />
                  </FieldBlock>

                  <FieldBlock label="Corretora">
                    <input
                      type="text"
                      name="corretoraNome"
                      defaultValue={corretoraNome === "Não informado" ? "" : corretoraNome}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      placeholder="Nome da corretora"
                    />
                  </FieldBlock>

                  <FieldBlock label="Status do relacionamento">
                    <select
                      name="statusRelacionamento"
                      defaultValue={statusRelacionamento}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="em_risco">Em risco</option>
                      <option value="renovando">Renovando</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </FieldBlock>

                  <FieldBlock label="Etapa atual">
                    <select
                      name="etapaAtual"
                      defaultValue={etapaAtual}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    >
                      <option value="onboarding">Onboarding</option>
                      <option value="implantacao">Implantação</option>
                      <option value="acompanhamento">Acompanhamento</option>
                      <option value="renovacao">Renovação</option>
                      <option value="retencao">Retenção</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </FieldBlock>

                  <FieldBlock label="Responsável">
                    <input
                      type="text"
                      name="responsavelNome"
                      defaultValue={posVenda?.responsavel_nome ?? ""}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      placeholder="Ex.: Ana Paula"
                    />
                  </FieldBlock>

                  <FieldBlock label="Data de início">
                    <input
                      type="date"
                      name="dataInicio"
                      defaultValue={normalizeDateInput(posVenda?.data_inicio)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </FieldBlock>

                  <FieldBlock label="Próximo contato">
                    <input
                      type="datetime-local"
                      name="proximoContatoEm"
                      defaultValue={normalizeDateTimeLocal(posVenda?.proximo_contato_em)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </FieldBlock>

                  <FieldBlock label="Renovação prevista">
                    <input
                      type="date"
                      name="renovacaoPrevistaEm"
                      defaultValue={normalizeDateInput(posVenda?.renovacao_prevista_em)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Pendências">
                  <textarea
                    name="pendencias"
                    rows={4}
                    defaultValue={posVenda?.pendencias ?? ""}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Ex.: envio de documentos, validação de dados, retorno da corretora..."
                  />
                </FieldBlock>

                <FieldBlock label="Observações">
                  <textarea
                    name="observacoes"
                    rows={5}
                    defaultValue={posVenda?.observacoes ?? ""}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Registre contexto do relacionamento, percepção do cliente, riscos e próximos passos."
                  />
                </FieldBlock>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Salvar pós-venda
                  </button>

                  <Link
                    href={`/propostas/${id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                  >
                    Voltar para acompanhamento
                  </Link>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Leitura do relacionamento
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-slate-900">
                    Situação atual
                  </strong>
                  <span className="mt-1 block">
                    {getRelationshipDescription(statusRelacionamento)}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-slate-900">
                    Etapa em andamento
                  </strong>
                  <span className="mt-1 block">
                    {getEtapaDescription(etapaAtual)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Recomendação prática
              </h3>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {statusRelacionamento === "ativo" &&
                  "Mantenha cadência de contato, registre tudo e prepare a renovação com antecedência."}
                {statusRelacionamento === "em_risco" &&
                  "Atue rápido. Descubra a objeção principal, remova atrito e registre o plano de recuperação."}
                {statusRelacionamento === "renovando" &&
                  "Conduza a renovação antes do prazo apertar. Antecipe proposta, valor percebido e follow-up."}
                {statusRelacionamento === "encerrado" &&
                  "Documente o motivo do encerramento para melhorar a retenção dos próximos clientes."}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Resumo operacional
              </h3>

              <div className="mt-4 space-y-3">
                <MiniInfo
                  label="Responsável"
                  value={posVenda?.responsavel_nome || "Não informado"}
                />
                <MiniInfo
                  label="Data de início"
                  value={formatDateOnly(posVenda?.data_inicio)}
                />
                <MiniInfo
                  label="Próximo contato"
                  value={formatDate(posVenda?.proximo_contato_em)}
                />
                <MiniInfo
                  label="Última atualização"
                  value={formatDate(posVenda?.atualizado_em)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900 md:text-base">
        {value}
      </p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}