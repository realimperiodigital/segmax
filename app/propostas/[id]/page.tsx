"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PropostaStatus =
  | "rascunho"
  | "em_analise"
  | "pronta_para_envio"
  | "enviada"
  | "em_negociacao"
  | "aprovada"
  | "recusada"
  | "emitida"
  | "pos_venda";

type TimelineItem = {
  id: string;
  data: string;
  titulo: string;
  descricao: string;
  usuario: string;
  status?: string | null;
};

type CoberturaItem = {
  nome: string;
  valor: string;
  observacao?: string;
};

type PropostaDetalhe = {
  id: string;
  numero: string;
  status: PropostaStatus;
  dataCriacao: string;
  ultimaAtualizacao: string;
  responsavel: string;
  analistaTecnico: string;

  corretora: {
    nome: string;
    cnpj: string;
    contato: string;
    email: string;
    telefone: string;
  };

  cliente: {
    nome: string;
    documento: string;
    tipoPessoa: string;
    telefone: string;
    email: string;
    cidade: string;
    uf: string;
  };

  risco: {
    tipoSeguro: string;
    atividade: string;
    localRisco: string;
    faturamento: string;
    limiteMaximoIndenizacao: string;
    observacoes: string;
  };

  seguradora: {
    nome: string;
    produto: string;
    vigenciaInicio: string;
    vigenciaFim: string;
    premioLiquido: string;
    premioTotal: string;
    franquia: string;
    formaPagamento: string;
  };

  coberturas: CoberturaItem[];

  parecerTecnico: string;
  observacoesComerciais: string;
  recomendacaoFinal: string;

  timeline: TimelineItem[];
};

const statusMap: Record<
  PropostaStatus,
  { label: string; classes: string }
> = {
  rascunho: {
    label: "Rascunho",
    classes: "bg-zinc-800 text-zinc-200 border border-zinc-700",
  },
  em_analise: {
    label: "Em análise",
    classes: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
  pronta_para_envio: {
    label: "Pronta para envio",
    classes: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  },
  enviada: {
    label: "Enviada",
    classes: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
  },
  em_negociacao: {
    label: "Em negociação",
    classes: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  },
  aprovada: {
    label: "Aprovada",
    classes: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  recusada: {
    label: "Recusada",
    classes: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  },
  emitida: {
    label: "Emitida",
    classes: "bg-green-500/15 text-green-300 border border-green-500/30",
  },
  pos_venda: {
    label: "Pós-venda",
    classes: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  },
};

const statusOptions: PropostaStatus[] = [
  "rascunho",
  "em_analise",
  "pronta_para_envio",
  "enviada",
  "em_negociacao",
  "aprovada",
  "recusada",
  "emitida",
  "pos_venda",
];

function formatarIdParaNumero(id: string) {
  const limpo = String(id || "")
    .replace(/\D/g, "")
    .slice(-6);

  const numero = limpo ? limpo.padStart(6, "0") : "000001";
  return `SEG-PROP-2026-${numero}`;
}

function agoraFormatado() {
  const agora = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(agora);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function montarPropostaMock(id: string): PropostaDetalhe {
  return {
    id,
    numero: formatarIdParaNumero(id),
    status: "pronta_para_envio",
    dataCriacao: "21/03/2026 09:10",
    ultimaAtualizacao: "21/03/2026 14:52",
    responsavel: "Renato Silva",
    analistaTecnico: "Ana Paula",

    corretora: {
      nome: "SegMax Consultoria",
      cnpj: "00.000.000/0001-00",
      contato: "Equipe Comercial",
      email: "corporativo@segmax.online",
      telefone: "+55 (11) 93947-9749",
    },

    cliente: {
      nome: "Indústria Exemplo Ltda",
      documento: "12.345.678/0001-90",
      tipoPessoa: "Pessoa Jurídica",
      telefone: "(11) 4000-1234",
      email: "financeiro@industriaexemplo.com.br",
      cidade: "Fortaleza",
      uf: "CE",
    },

    risco: {
      tipoSeguro: "Seguro Patrimonial Empresarial",
      atividade: "Indústria de médio porte",
      localRisco: "Fortaleza - CE",
      faturamento: "R$ 4.800.000,00 / ano",
      limiteMaximoIndenizacao: "R$ 2.000.000,00",
      observacoes:
        "Operação com equipamentos industriais, estoque relevante e necessidade de cobertura compatível com danos elétricos, incêndio, vendaval e lucros cessantes.",
    },

    seguradora: {
      nome: "Seguradora Alpha",
      produto: "Empresarial Plus",
      vigenciaInicio: "01/04/2026",
      vigenciaFim: "01/04/2027",
      premioLiquido: "R$ 14.870,00",
      premioTotal: "R$ 16.240,00",
      franquia: "R$ 12.500,00",
      formaPagamento: "10x sem juros",
    },

    coberturas: [
      {
        nome: "Incêndio, queda de raio e explosão",
        valor: "R$ 2.000.000,00",
      },
      {
        nome: "Danos elétricos",
        valor: "R$ 250.000,00",
      },
      {
        nome: "Vendaval, granizo e impacto de veículos",
        valor: "R$ 300.000,00",
      },
      {
        nome: "Lucros cessantes",
        valor: "R$ 400.000,00",
        observacao: "Período indenitário de 6 meses",
      },
      {
        nome: "Roubo de bens e mercadorias",
        valor: "R$ 180.000,00",
      },
    ],

    parecerTecnico:
      "Após análise técnica do risco apresentado, a proposta está aderente ao perfil operacional do cliente e contempla coberturas essenciais para proteção patrimonial, preservação de continuidade operacional e mitigação de perdas financeiras em cenário de sinistro relevante.",

    observacoesComerciais:
      "Condição comercial competitiva dentro do perfil apresentado. Recomendado envio imediato ao corretor com destaque para amplitude de coberturas, equilíbrio entre prêmio e proteção e possibilidade de evolução para programa mais robusto em renovação futura.",

    recomendacaoFinal:
      "Proposta recomendada para envio. Cenário considerado tecnicamente adequado e comercialmente competitivo para a operação atual do cliente.",

    timeline: [
      {
        id: "1",
        data: "21/03/2026 14:52",
        titulo: "Pronta para envio",
        descricao:
          "Layout final revisado e proposta marcada como pronta para encaminhamento ao corretor.",
        usuario: "Renato Silva",
      },
      {
        id: "2",
        data: "21/03/2026 10:26",
        titulo: "Análise técnica concluída",
        descricao:
          "Parecer técnico inserido e proposta liberada para revisão comercial.",
        usuario: "Ana Paula",
      },
      {
        id: "3",
        data: "21/03/2026 09:10",
        titulo: "Proposta criada",
        descricao:
          "A proposta executiva foi gerada a partir da cotação aprovada internamente.",
        usuario: "Renato Silva",
      },
    ],
  };
}

function criarTimelineLocal(
  titulo: string,
  descricao: string,
  usuario: string,
  status?: string | null
): TimelineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    data: agoraFormatado(),
    titulo,
    descricao,
    usuario,
    status: status || null,
  };
}

function traduzirStatusParaTitulo(status: PropostaStatus) {
  return `Status alterado para ${statusMap[status].label}`;
}

function traduzirStatusParaDescricao(status: PropostaStatus) {
  return `A proposta foi atualizada para o status ${statusMap[status].label}.`;
}

function InfoCard({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoGridItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  );
}

export default function PropostaDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const propostaInicial = useMemo(() => montarPropostaMock(params.id), [params.id]);
  const propostaTemUuidReal = useMemo(() => isUuid(params.id), [params.id]);

  const [statusAtual, setStatusAtual] = useState<PropostaStatus>(propostaInicial.status);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(propostaInicial.ultimaAtualizacao);
  const [timeline, setTimeline] = useState<TimelineItem[]>(propostaInicial.timeline);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [mensagemAcao, setMensagemAcao] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const proposta = {
    ...propostaInicial,
    status: statusAtual,
    ultimaAtualizacao,
    timeline,
  };

  const status = statusMap[proposta.status];

  const linkEditar = `/propostas/${proposta.id}/editar`;
  const linkImprimir = `/propostas/${proposta.id}/imprimir`;
  const linkPosVenda = `/propostas/${proposta.id}/pos-venda`;

  async function carregarHistoricoReal() {
    if (!propostaTemUuidReal) return;

    try {
      setCarregandoHistorico(true);

      const resposta = await fetch(`/api/propostas/${proposta.id}/registrar-acao`, {
        method: "GET",
        cache: "no-store",
      });

      const json = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(json?.erro || "Erro ao carregar histórico.");
      }

      if (Array.isArray(json?.timeline)) {
        if (json.timeline.length > 0) {
          setTimeline(
            json.timeline.map((item: TimelineItem) => ({
              id: item.id,
              data: item.data,
              titulo: item.titulo,
              descricao: item.descricao,
              usuario: item.usuario,
              status: item.status,
            }))
          );

          const primeiro = json.timeline[0];
          if (primeiro?.data) {
            setUltimaAtualizacao(primeiro.data);
          }

          const ultimoStatus = json.timeline.find(
            (item: TimelineItem) => item.status && statusMap[item.status as PropostaStatus]
          );

          if (ultimoStatus?.status && statusMap[ultimoStatus.status as PropostaStatus]) {
            setStatusAtual(ultimoStatus.status as PropostaStatus);
          }
        } else {
          setTimeline(propostaInicial.timeline);
        }
      }
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao carregar histórico real.";
      setErroAcao(mensagem);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  useEffect(() => {
    carregarHistoricoReal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposta.id, propostaTemUuidReal]);

  async function chamarApi(body: Record<string, string>) {
    const resposta = await fetch(`/api/propostas/${proposta.id}/registrar-acao`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      throw new Error(json?.erro || json?.message || "Erro ao processar ação.");
    }

    return json;
  }

  async function alterarStatusViaApi(novoStatus: PropostaStatus, usuario: string) {
    if (novoStatus === statusAtual) {
      setMensagemAcao("O status selecionado já é o atual.");
      setErroAcao("");
      return;
    }

    if (!propostaTemUuidReal) {
      setStatusAtual(novoStatus);

      const evento = criarTimelineLocal(
        traduzirStatusParaTitulo(novoStatus),
        traduzirStatusParaDescricao(novoStatus),
        usuario,
        novoStatus
      );

      setTimeline((anterior) => [evento, ...anterior]);
      setUltimaAtualizacao(evento.data);
      setMensagemAcao(
        `Status alterado localmente para ${statusMap[novoStatus].label}. Para salvar no banco, a proposta precisa abrir com UUID real.`
      );
      setErroAcao("");
      return;
    }

    try {
      setCarregando(true);
      setMensagemAcao("");
      setErroAcao("");

      const json = await chamarApi({
        acao: "alterar_status",
        status: novoStatus,
        usuario,
      });

      setStatusAtual(novoStatus);

      if (json?.registro) {
        setTimeline((anterior) => [
          {
            id: json.registro.id,
            data: json.registro.data,
            titulo: json.registro.titulo,
            descricao: json.registro.descricao,
            usuario: json.registro.usuario,
            status: json.registro.status,
          },
          ...anterior,
        ]);

        setUltimaAtualizacao(json.registro.data);
      }

      setMensagemAcao(`Status alterado para ${statusMap[novoStatus].label} com sucesso.`);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao alterar status.";
      setErroAcao(mensagem);
      setMensagemAcao("");
    } finally {
      setCarregando(false);
    }
  }

  async function registrarObservacaoViaApi() {
    const texto = novaObservacao.trim();

    if (!texto) {
      setErroAcao("Digite uma observação antes de registrar.");
      setMensagemAcao("");
      return;
    }

    if (!propostaTemUuidReal) {
      const evento = criarTimelineLocal(
        "Observação operacional registrada",
        texto,
        "Renato Silva"
      );

      setTimeline((anterior) => [evento, ...anterior]);
      setUltimaAtualizacao(evento.data);
      setNovaObservacao("");
      setMensagemAcao(
        "Observação registrada localmente. Para salvar no banco, a proposta precisa abrir com UUID real."
      );
      setErroAcao("");
      return;
    }

    try {
      setCarregando(true);
      setMensagemAcao("");
      setErroAcao("");

      const json = await chamarApi({
        acao: "registrar_observacao",
        observacao: texto,
        usuario: "Renato Silva",
      });

      if (json?.registro) {
        setTimeline((anterior) => [
          {
            id: json.registro.id,
            data: json.registro.data,
            titulo: json.registro.titulo,
            descricao: json.registro.descricao,
            usuario: json.registro.usuario,
            status: json.registro.status,
          },
          ...anterior,
        ]);

        setUltimaAtualizacao(json.registro.data);
      }

      setNovaObservacao("");
      setMensagemAcao("Observação registrada com sucesso.");
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao registrar observação.";
      setErroAcao(mensagem);
      setMensagemAcao("");
    } finally {
      setCarregando(false);
    }
  }

  async function acaoMarcarEnviada() {
    await alterarStatusViaApi("enviada", "Renato Silva");
  }

  async function acaoMarcarNegociacao() {
    await alterarStatusViaApi("em_negociacao", "Renato Silva");
  }

  async function acaoAprovar() {
    await alterarStatusViaApi("aprovada", "Ana Paula");
  }

  async function acaoRecusar() {
    await alterarStatusViaApi("recusada", "Ana Paula");
  }

  async function acaoEmitir() {
    await alterarStatusViaApi("emitida", "Equipe Operacional");
  }

  async function acaoPosVenda() {
    await alterarStatusViaApi("pos_venda", "Equipe Operacional");
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 xl:px-8">
        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_50%,#1e293b_100%)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                Proposta Executiva
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                {proposta.numero}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                Proposta comercial e técnica consolidada para apresentação ao corretor,
                com visão clara de coberturas, valores, parecer e evolução operacional.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}
                >
                  {status.label}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  ID interno: {proposta.id}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  Criada em {proposta.dataCriacao}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  Atualizada em {proposta.ultimaAtualizacao}
                </span>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <Link
                href="/propostas"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-zinc-100 transition hover:bg-white/10"
              >
                Voltar para propostas
              </Link>

              <Link
                href={linkEditar}
                className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Editar proposta
              </Link>

              <Link
                href={linkImprimir}
                className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-center text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
              >
                Gerar versão final
              </Link>

              <Link
                href={linkPosVenda}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                Ir para pós-venda
              </Link>
            </div>
          </div>
        </div>

        {!propostaTemUuidReal ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Esta proposta está aberta com um ID simples, não com UUID real do banco. O histórico funciona localmente nesta tela, mas ainda não será salvo no Supabase até a navegação usar o UUID verdadeiro.
          </div>
        ) : null}

        {mensagemAcao ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {mensagemAcao}
          </div>
        ) : null}

        {erroAcao ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {erroAcao}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <InfoCard titulo="Resumo estratégico da proposta">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoGridItem label="Cliente" value={proposta.cliente.nome} />
                <InfoGridItem label="Tipo de seguro" value={proposta.risco.tipoSeguro} />
                <InfoGridItem label="Seguradora" value={proposta.seguradora.nome} />
                <InfoGridItem label="Produto" value={proposta.seguradora.produto} />
                <InfoGridItem label="Prêmio total" value={proposta.seguradora.premioTotal} />
                <InfoGridItem label="Franquia" value={proposta.seguradora.franquia} />
                <InfoGridItem
                  label="Vigência"
                  value={`${proposta.seguradora.vigenciaInicio} até ${proposta.seguradora.vigenciaFim}`}
                />
                <InfoGridItem label="Responsável" value={proposta.responsavel} />
                <InfoGridItem label="Analista técnico" value={proposta.analistaTecnico} />
              </div>
            </InfoCard>

            <InfoCard titulo="Dados da corretora">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoGridItem label="Corretora" value={proposta.corretora.nome} />
                <InfoGridItem label="CNPJ" value={proposta.corretora.cnpj} />
                <InfoGridItem label="Contato" value={proposta.corretora.contato} />
                <InfoGridItem label="E-mail" value={proposta.corretora.email} />
                <InfoGridItem label="Telefone" value={proposta.corretora.telefone} />
              </div>
            </InfoCard>

            <InfoCard titulo="Dados do cliente">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoGridItem label="Nome / Razão social" value={proposta.cliente.nome} />
                <InfoGridItem label="Documento" value={proposta.cliente.documento} />
                <InfoGridItem label="Tipo" value={proposta.cliente.tipoPessoa} />
                <InfoGridItem label="Telefone" value={proposta.cliente.telefone} />
                <InfoGridItem label="E-mail" value={proposta.cliente.email} />
                <InfoGridItem
                  label="Localidade"
                  value={`${proposta.cliente.cidade} - ${proposta.cliente.uf}`}
                />
              </div>
            </InfoCard>

            <InfoCard titulo="Dados do risco">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoGridItem label="Atividade" value={proposta.risco.atividade} />
                <InfoGridItem label="Local do risco" value={proposta.risco.localRisco} />
                <InfoGridItem label="Faturamento" value={proposta.risco.faturamento} />
                <InfoGridItem
                  label="LMI"
                  value={proposta.risco.limiteMaximoIndenizacao}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Observações do risco
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-200">
                  {proposta.risco.observacoes}
                </p>
              </div>
            </InfoCard>

            <InfoCard titulo="Condições da seguradora">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoGridItem label="Seguradora" value={proposta.seguradora.nome} />
                <InfoGridItem label="Produto" value={proposta.seguradora.produto} />
                <InfoGridItem label="Prêmio líquido" value={proposta.seguradora.premioLiquido} />
                <InfoGridItem label="Prêmio total" value={proposta.seguradora.premioTotal} />
                <InfoGridItem label="Franquia" value={proposta.seguradora.franquia} />
                <InfoGridItem
                  label="Forma de pagamento"
                  value={proposta.seguradora.formaPagamento}
                />
                <InfoGridItem
                  label="Início da vigência"
                  value={proposta.seguradora.vigenciaInicio}
                />
                <InfoGridItem
                  label="Fim da vigência"
                  value={proposta.seguradora.vigenciaFim}
                />
              </div>
            </InfoCard>

            <InfoCard titulo="Coberturas da proposta">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  <div className="col-span-6">Cobertura</div>
                  <div className="col-span-3">Valor</div>
                  <div className="col-span-3">Observação</div>
                </div>

                <div className="divide-y divide-white/10">
                  {proposta.coberturas.map((item) => (
                    <div
                      key={item.nome}
                      className="grid grid-cols-12 px-4 py-4 text-sm text-zinc-200"
                    >
                      <div className="col-span-12 mb-2 font-medium md:col-span-6 md:mb-0">
                        {item.nome}
                      </div>
                      <div className="col-span-12 mb-2 text-zinc-300 md:col-span-3 md:mb-0">
                        {item.valor}
                      </div>
                      <div className="col-span-12 text-zinc-400 md:col-span-3">
                        {item.observacao || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>

            <InfoCard titulo="Parecer técnico">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <p className="text-sm leading-7 text-zinc-100">{proposta.parecerTecnico}</p>
              </div>
            </InfoCard>

            <InfoCard titulo="Observações comerciais">
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                <p className="text-sm leading-7 text-zinc-100">
                  {proposta.observacoesComerciais}
                </p>
              </div>
            </InfoCard>

            <InfoCard titulo="Recomendação final">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-sm leading-7 text-zinc-100">
                  {proposta.recomendacaoFinal}
                </p>
              </div>
            </InfoCard>
          </div>

          <aside className="flex flex-col gap-6">
            <InfoCard titulo="Painel operacional">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Status atual</p>
                  <p className="mt-2 text-lg font-semibold text-white">{status.label}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Alterar status manualmente
                  </label>

                  <select
                    value={statusAtual}
                    onChange={(event) =>
                      alterarStatusViaApi(event.target.value as PropostaStatus, "Renato Silva")
                    }
                    disabled={carregando}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statusOptions.map((item) => (
                      <option key={item} value={item} className="bg-slate-900 text-white">
                        {statusMap[item].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Número da proposta
                  </p>
                  <p className="mt-2 text-sm font-medium text-zinc-100">
                    {proposta.numero}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Responsável</p>
                  <p className="mt-2 text-sm font-medium text-zinc-100">
                    {proposta.responsavel}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Analista técnico
                  </p>
                  <p className="mt-2 text-sm font-medium text-zinc-100">
                    {proposta.analistaTecnico}
                  </p>
                </div>

                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={acaoMarcarEnviada}
                    disabled={carregando}
                    className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-center text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Marcar como enviada
                  </button>

                  <button
                    type="button"
                    onClick={acaoMarcarNegociacao}
                    disabled={carregando}
                    className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Marcar em negociação
                  </button>

                  <button
                    type="button"
                    onClick={acaoAprovar}
                    disabled={carregando}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Aprovar proposta
                  </button>

                  <button
                    type="button"
                    onClick={acaoRecusar}
                    disabled={carregando}
                    className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Recusar proposta
                  </button>

                  <button
                    type="button"
                    onClick={acaoEmitir}
                    disabled={carregando}
                    className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-semibold text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Marcar como emitida
                  </button>

                  <button
                    type="button"
                    onClick={acaoPosVenda}
                    disabled={carregando}
                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Enviar para pós-venda
                  </button>
                </div>

                <div className="grid gap-3">
                  <Link
                    href={linkEditar}
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:opacity-90"
                  >
                    Editar
                  </Link>

                  <Link
                    href={linkImprimir}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-zinc-100 transition hover:bg-white/10"
                  >
                    Imprimir / gerar PDF
                  </Link>

                  <Link
                    href={linkPosVenda}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-zinc-100 transition hover:bg-white/10"
                  >
                    Abrir tela de pós-venda
                  </Link>
                </div>
              </div>
            </InfoCard>

            <InfoCard titulo="Registrar observação operacional">
              <div className="space-y-4">
                <textarea
                  value={novaObservacao}
                  onChange={(event) => setNovaObservacao(event.target.value)}
                  rows={5}
                  placeholder="Exemplo: corretor pediu ajuste de condição comercial, retorno previsto para amanhã às 10h."
                  disabled={carregando}
                  className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={registrarObservacaoViaApi}
                  disabled={carregando}
                  className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {carregando ? "Processando..." : "Registrar observação no histórico"}
                </button>
              </div>
            </InfoCard>

            <InfoCard titulo="Histórico da proposta">
              <div className="space-y-4">
                {carregandoHistorico ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
                    Carregando histórico real...
                  </div>
                ) : proposta.timeline.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
                    Nenhum histórico encontrado para esta proposta.
                  </div>
                ) : (
                  proposta.timeline.map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                      {index !== proposta.timeline.length - 1 && (
                        <div className="absolute left-[7px] top-5 h-[calc(100%-8px)] w-px bg-white/10" />
                      )}

                      <div className="absolute left-0 top-2 h-4 w-4 rounded-full border border-cyan-400/40 bg-cyan-400/20" />

                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          {item.data}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">{item.titulo}</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                          {item.descricao}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">Por {item.usuario}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </InfoCard>

            <InfoCard titulo="Checklist de fechamento">
              <div className="space-y-3 text-sm text-zinc-200">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  ✅ Estrutura da proposta consolidada
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  ✅ Banco preparado para histórico real
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  ✅ Tela protegida para ID simples e UUID real
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  ✅ Fluxo local continua funcionando
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  🔜 Próximo passo: fazer a listagem abrir a proposta com UUID verdadeiro
                </div>
              </div>
            </InfoCard>
          </aside>
        </section>
      </div>
    </main>
  );
}