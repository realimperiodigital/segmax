"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type LinhaCobertura = {
  id: string;
  cobertura: string;
  descricao: string;
  limite: string;
  franquia: string;
  observacoes: string;
};

type StatusProposta =
  | "rascunho"
  | "em_analise"
  | "enviada"
  | "aprovada"
  | "recusada";

type DadosProposta = {
  id?: string;
  numeroProposta: string;
  dataEmissao: string;
  validade: string;
  status: StatusProposta;
  etapaAtual: string;

  clienteId: string;
  cotacaoId: string;
  corretoraId: string;

  origemClienteId: string;
  origemCotacaoId: string;
  origemCorretoraId: string;

  publicToken: string;
  publicSlug: string;
  linkPublicoAtivo: boolean;
  totalVisualizacoes: number;
  primeiraVisualizacaoEm: string;
  ultimaVisualizacaoEm: string;
  aceitePublicoEm: string;
  recusadaPublicoEm: string;
  enviadoCorretorEm: string;
  enviadoClienteEm: string;

  clienteNome: string;
  clienteDocumento: string;
  clienteEmpresa: string;
  clienteContato: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteEndereco: string;

  corretoraNome: string;
  corretoraResponsavel: string;
  corretoraEmail: string;
  corretoraTelefone: string;
  corretoraLogoUrl: string;

  seguradoraNome: string;
  ramoSeguro: string;
  objetoSegurado: string;
  importanciaSegurada: string;
  premioLiquido: string;
  premioTotal: string;
  formaPagamento: string;
  vigenciaInicio: string;
  vigenciaFim: string;

  tituloDocumento: string;
  subtituloDocumento: string;
  resumoExecutivo: string;
  analiseRisco: string;
  parecerTecnico: string;
  consideracoesGerais: string;
  clausulasImportantes: string;
  proximosPassos: string;

  coberturas: LinhaCobertura[];
};

type PropostaBanco = {
  id: string;
  numero_proposta: string;
  titulo_documento: string;
  subtitulo_documento: string | null;
  status: StatusProposta;
  etapa_atual: string | null;

  cliente_id: string | null;
  cotacao_id: string | null;
  corretora_id: string | null;

  origem_cliente_id: string | null;
  origem_cotacao_id: string | null;
  origem_corretora_id: string | null;

  public_token: string | null;
  public_slug: string | null;
  link_publico_ativo: boolean | null;
  total_visualizacoes: number | null;
  primeira_visualizacao_em: string | null;
  ultima_visualizacao_em: string | null;
  aceite_publico_em: string | null;
  recusada_publico_em: string | null;
  enviado_corretor_em: string | null;
  enviado_cliente_em: string | null;

  cliente_nome: string | null;
  cliente_documento: string | null;
  cliente_empresa: string | null;
  cliente_contato: string | null;
  cliente_email: string | null;
  cliente_telefone: string | null;
  cliente_endereco: string | null;

  corretora_nome: string | null;
  corretora_responsavel: string | null;
  corretora_email: string | null;
  corretora_telefone: string | null;
  corretora_logo_url: string | null;

  seguradora_nome: string | null;
  ramo_seguro: string | null;
  objeto_segurado: string | null;
  importancia_segurada: string | null;
  premio_liquido: string | null;
  premio_total: string | null;
  forma_pagamento: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;

  data_emissao: string | null;
  validade: string | null;

  resumo_executivo: string | null;
  analise_risco: string | null;
  parecer_tecnico: string | null;
  consideracoes_gerais: string | null;
  clausulas_importantes: string | null;
  proximos_passos: string | null;

  coberturas: LinhaCobertura[] | null;

  created_at: string;
  updated_at: string;
};

type HistoricoItem = {
  id: string;
  proposta_id: string;
  acao: string;
  descricao: string | null;
  status_anterior: string | null;
  status_novo: string | null;
  criado_por: string | null;
  criado_em: string;
};

type RegistroBase = {
  id: string;
  nome_exibicao: string;
  subtitulo?: string;
  raw: Record<string, unknown>;
};

const TABELAS_CLIENTE = ["clientes", "cliente", "segmax_clientes"];
const TABELAS_CORRETORA = ["corretoras", "corretora", "segmax_corretoras"];
const TABELAS_COTACAO = ["cotacoes", "cotacao", "segmax_cotacoes"];

const dadosIniciais = (): DadosProposta => ({
  numeroProposta: `SEGMAX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  dataEmissao: new Date().toLocaleDateString("pt-BR"),
  validade: "",
  status: "rascunho",
  etapaAtual: "estrutura_inicial",

  clienteId: "",
  cotacaoId: "",
  corretoraId: "",

  origemClienteId: "",
  origemCotacaoId: "",
  origemCorretoraId: "",

  publicToken: "",
  publicSlug: "",
  linkPublicoAtivo: false,
  totalVisualizacoes: 0,
  primeiraVisualizacaoEm: "",
  ultimaVisualizacaoEm: "",
  aceitePublicoEm: "",
  recusadaPublicoEm: "",
  enviadoCorretorEm: "",
  enviadoClienteEm: "",

  clienteNome: "",
  clienteDocumento: "",
  clienteEmpresa: "",
  clienteContato: "",
  clienteEmail: "",
  clienteTelefone: "",
  clienteEndereco: "",

  corretoraNome: "SegMax Consultoria",
  corretoraResponsavel: "",
  corretoraEmail: "corporativo@segmax.online",
  corretoraTelefone: "+55 (11) 93947-9749",
  corretoraLogoUrl: "",

  seguradoraNome: "",
  ramoSeguro: "Seguro Patrimonial",
  objetoSegurado: "",
  importanciaSegurada: "",
  premioLiquido: "",
  premioTotal: "",
  formaPagamento: "",
  vigenciaInicio: "",
  vigenciaFim: "",

  tituloDocumento: "Proposta Executiva",
  subtituloDocumento: "Apresentação técnica e comercial da solução securitária",
  resumoExecutivo: "",
  analiseRisco: "",
  parecerTecnico: "",
  consideracoesGerais: "",
  clausulasImportantes: "",
  proximosPassos: "",

  coberturas: [
    {
      id: crypto.randomUUID(),
      cobertura: "",
      descricao: "",
      limite: "",
      franquia: "",
      observacoes: "",
    },
  ],
});

function cls(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function formatarData(valor?: string | null) {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch {
    return valor;
  }
}

function CampoInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-200">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function CampoTextarea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-200">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/10"
      />
    </div>
  );
}

function CampoSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-200">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/10"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value} className="bg-zinc-900">
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Bloco({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">{titulo}</h2>
        {subtitulo ? <p className="mt-1 text-sm text-zinc-400">{subtitulo}</p> : null}
      </div>
      {children}
    </section>
  );
}

function badgeStatus(status: StatusProposta) {
  switch (status) {
    case "rascunho":
      return "bg-zinc-700/60 text-zinc-100";
    case "em_analise":
      return "bg-amber-500/20 text-amber-300";
    case "enviada":
      return "bg-blue-500/20 text-blue-300";
    case "aprovada":
      return "bg-emerald-500/20 text-emerald-300";
    case "recusada":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-zinc-700/60 text-zinc-100";
  }
}

function labelEtapa(etapa: string) {
  switch (etapa) {
    case "estrutura_inicial":
      return "Estrutura inicial";
    case "dados_preenchidos":
      return "Dados preenchidos";
    case "em_revisao":
      return "Em revisão";
    case "pronta_envio":
      return "Pronta para envio";
    case "enviada_cliente":
      return "Enviada ao cliente";
    case "fechada_aprovada":
      return "Fechada aprovada";
    case "fechada_recusada":
      return "Fechada recusada";
    default:
      return etapa || "-";
  }
}

function mapBancoParaTela(item: PropostaBanco): DadosProposta {
  return {
    id: item.id,
    numeroProposta: item.numero_proposta || "",
    dataEmissao: item.data_emissao || "",
    validade: item.validade || "",
    status: item.status || "rascunho",
    etapaAtual: item.etapa_atual || "estrutura_inicial",

    clienteId: item.cliente_id || "",
    cotacaoId: item.cotacao_id || "",
    corretoraId: item.corretora_id || "",

    origemClienteId: item.origem_cliente_id || "",
    origemCotacaoId: item.origem_cotacao_id || "",
    origemCorretoraId: item.origem_corretora_id || "",

    publicToken: item.public_token || "",
    publicSlug: item.public_slug || "",
    linkPublicoAtivo: Boolean(item.link_publico_ativo),
    totalVisualizacoes: Number(item.total_visualizacoes || 0),
    primeiraVisualizacaoEm: item.primeira_visualizacao_em || "",
    ultimaVisualizacaoEm: item.ultima_visualizacao_em || "",
    aceitePublicoEm: item.aceite_publico_em || "",
    recusadaPublicoEm: item.recusada_publico_em || "",
    enviadoCorretorEm: item.enviado_corretor_em || "",
    enviadoClienteEm: item.enviado_cliente_em || "",

    clienteNome: item.cliente_nome || "",
    clienteDocumento: item.cliente_documento || "",
    clienteEmpresa: item.cliente_empresa || "",
    clienteContato: item.cliente_contato || "",
    clienteEmail: item.cliente_email || "",
    clienteTelefone: item.cliente_telefone || "",
    clienteEndereco: item.cliente_endereco || "",

    corretoraNome: item.corretora_nome || "",
    corretoraResponsavel: item.corretora_responsavel || "",
    corretoraEmail: item.corretora_email || "",
    corretoraTelefone: item.corretora_telefone || "",
    corretoraLogoUrl: item.corretora_logo_url || "",

    seguradoraNome: item.seguradora_nome || "",
    ramoSeguro: item.ramo_seguro || "",
    objetoSegurado: item.objeto_segurado || "",
    importanciaSegurada: item.importancia_segurada || "",
    premioLiquido: item.premio_liquido || "",
    premioTotal: item.premio_total || "",
    formaPagamento: item.forma_pagamento || "",
    vigenciaInicio: item.vigencia_inicio || "",
    vigenciaFim: item.vigencia_fim || "",

    tituloDocumento: item.titulo_documento || "Proposta Executiva",
    subtituloDocumento: item.subtitulo_documento || "",
    resumoExecutivo: item.resumo_executivo || "",
    analiseRisco: item.analise_risco || "",
    parecerTecnico: item.parecer_tecnico || "",
    consideracoesGerais: item.consideracoes_gerais || "",
    clausulasImportantes: item.clausulas_importantes || "",
    proximosPassos: item.proximos_passos || "",

    coberturas:
      item.coberturas && item.coberturas.length > 0
        ? item.coberturas
        : [
            {
              id: crypto.randomUUID(),
              cobertura: "",
              descricao: "",
              limite: "",
              franquia: "",
              observacoes: "",
            },
          ],
  };
}

function mapTelaParaBanco(dados: DadosProposta, userId?: string) {
  return {
    numero_proposta: dados.numeroProposta,
    titulo_documento: dados.tituloDocumento,
    subtitulo_documento: dados.subtituloDocumento,
    status: dados.status,
    etapa_atual: dados.etapaAtual,

    cliente_id: dados.clienteId || null,
    cotacao_id: dados.cotacaoId || null,
    corretora_id: dados.corretoraId || null,

    origem_cliente_id: dados.origemClienteId || null,
    origem_cotacao_id: dados.origemCotacaoId || null,
    origem_corretora_id: dados.origemCorretoraId || null,

    public_token: dados.publicToken || null,
    public_slug: dados.publicSlug || null,
    link_publico_ativo: dados.linkPublicoAtivo,

    cliente_nome: dados.clienteNome || null,
    cliente_documento: dados.clienteDocumento || null,
    cliente_empresa: dados.clienteEmpresa || null,
    cliente_contato: dados.clienteContato || null,
    cliente_email: dados.clienteEmail || null,
    cliente_telefone: dados.clienteTelefone || null,
    cliente_endereco: dados.clienteEndereco || null,

    corretora_nome: dados.corretoraNome || null,
    corretora_responsavel: dados.corretoraResponsavel || null,
    corretora_email: dados.corretoraEmail || null,
    corretora_telefone: dados.corretoraTelefone || null,
    corretora_logo_url: dados.corretoraLogoUrl || null,

    seguradora_nome: dados.seguradoraNome || null,
    ramo_seguro: dados.ramoSeguro || null,
    objeto_segurado: dados.objetoSegurado || null,
    importancia_segurada: dados.importanciaSegurada || null,
    premio_liquido: dados.premioLiquido || null,
    premio_total: dados.premioTotal || null,
    forma_pagamento: dados.formaPagamento || null,
    vigencia_inicio: dados.vigenciaInicio || null,
    vigencia_fim: dados.vigenciaFim || null,

    data_emissao: dados.dataEmissao || null,
    validade: dados.validade || null,

    resumo_executivo: dados.resumoExecutivo || null,
    analise_risco: dados.analiseRisco || null,
    parecer_tecnico: dados.parecerTecnico || null,
    consideracoes_gerais: dados.consideracoesGerais || null,
    clausulas_importantes: dados.clausulasImportantes || null,
    proximos_passos: dados.proximosPassos || null,

    coberturas: dados.coberturas,
    updated_by: userId || null,
  };
}

function valorTexto(raw: Record<string, unknown>, campos: string[]) {
  for (const campo of campos) {
    const valor = raw[campo];
    if (typeof valor === "string" && valor.trim()) return valor;
  }
  return "";
}

function montarNomeExibicao(raw: Record<string, unknown>, tipo: "cliente" | "corretora" | "cotacao") {
  if (tipo === "cliente") {
    return (
      valorTexto(raw, ["nome", "nome_cliente", "razao_social", "empresa", "cliente_nome"]) ||
      `Cliente ${String(raw.id || "").slice(0, 8)}`
    );
  }

  if (tipo === "corretora") {
    return (
      valorTexto(raw, ["nome", "nome_fantasia", "razao_social", "corretora_nome"]) ||
      `Corretora ${String(raw.id || "").slice(0, 8)}`
    );
  }

  return (
    valorTexto(raw, ["numero", "codigo", "titulo", "nome", "descricao"]) ||
    `Cotação ${String(raw.id || "").slice(0, 8)}`
  );
}

function montarSubtitulo(raw: Record<string, unknown>, tipo: "cliente" | "corretora" | "cotacao") {
  if (tipo === "cliente") return valorTexto(raw, ["empresa", "razao_social", "email", "telefone"]);
  if (tipo === "corretora") return valorTexto(raw, ["responsavel", "email", "telefone"]);
  return valorTexto(raw, ["seguradora", "seguradora_nome", "ramo", "status"]);
}

async function buscarRegistros(tabelas: string[], tipo: "cliente" | "corretora" | "cotacao"): Promise<RegistroBase[]> {
  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase.from(tabela).select("*").limit(100);
      if (error) continue;
      if (!data || !Array.isArray(data)) continue;

      return data.map((item: Record<string, unknown>) => ({
        id: String(item.id || ""),
        nome_exibicao: montarNomeExibicao(item, tipo),
        subtitulo: montarSubtitulo(item, tipo),
        raw: item,
      }));
    } catch {
      continue;
    }
  }
  return [];
}

function aplicarClienteNaProposta(raw: Record<string, unknown>, atual: DadosProposta): DadosProposta {
  return {
    ...atual,
    origemClienteId: String(raw.id || ""),
    clienteId: String(raw.id || ""),
    clienteNome: valorTexto(raw, ["nome", "nome_cliente", "cliente_nome"]) || atual.clienteNome,
    clienteDocumento: valorTexto(raw, ["documento", "cpf_cnpj", "cnpj", "cpf"]) || atual.clienteDocumento,
    clienteEmpresa: valorTexto(raw, ["empresa", "razao_social", "nome_fantasia"]) || atual.clienteEmpresa,
    clienteContato: valorTexto(raw, ["contato", "responsavel", "nome_responsavel"]) || atual.clienteContato,
    clienteEmail: valorTexto(raw, ["email", "email_principal"]) || atual.clienteEmail,
    clienteTelefone: valorTexto(raw, ["telefone", "celular", "whatsapp"]) || atual.clienteTelefone,
    clienteEndereco: valorTexto(raw, ["endereco", "logradouro_completo", "endereco_completo"]) || atual.clienteEndereco,
    etapaAtual: "dados_preenchidos",
  };
}

function aplicarCorretoraNaProposta(raw: Record<string, unknown>, atual: DadosProposta): DadosProposta {
  return {
    ...atual,
    origemCorretoraId: String(raw.id || ""),
    corretoraId: String(raw.id || ""),
    corretoraNome: valorTexto(raw, ["nome", "nome_fantasia", "razao_social", "corretora_nome"]) || atual.corretoraNome,
    corretoraResponsavel: valorTexto(raw, ["responsavel", "nome_responsavel", "contato"]) || atual.corretoraResponsavel,
    corretoraEmail: valorTexto(raw, ["email", "email_principal"]) || atual.corretoraEmail,
    corretoraTelefone: valorTexto(raw, ["telefone", "celular", "whatsapp"]) || atual.corretoraTelefone,
    corretoraLogoUrl: valorTexto(raw, ["logo_url", "logo", "imagem_logo"]) || atual.corretoraLogoUrl,
    etapaAtual: "dados_preenchidos",
  };
}

function aplicarCotacaoNaProposta(raw: Record<string, unknown>, atual: DadosProposta): DadosProposta {
  return {
    ...atual,
    origemCotacaoId: String(raw.id || ""),
    cotacaoId: String(raw.id || ""),
    seguradoraNome: valorTexto(raw, ["seguradora", "seguradora_nome"]) || atual.seguradoraNome,
    ramoSeguro: valorTexto(raw, ["ramo", "ramo_seguro", "tipo_seguro"]) || atual.ramoSeguro,
    objetoSegurado: valorTexto(raw, ["objeto_segurado", "objeto", "descricao_risco", "descricao"]) || atual.objetoSegurado,
    premioTotal: valorTexto(raw, ["premio_total", "valor_total", "premio"]) || atual.premioTotal,
    premioLiquido: valorTexto(raw, ["premio_liquido", "valor_liquido"]) || atual.premioLiquido,
    formaPagamento: valorTexto(raw, ["forma_pagamento", "pagamento"]) || atual.formaPagamento,
    vigenciaInicio: valorTexto(raw, ["vigencia_inicio", "inicio_vigencia"]) || atual.vigenciaInicio,
    vigenciaFim: valorTexto(raw, ["vigencia_fim", "fim_vigencia"]) || atual.vigenciaFim,
    etapaAtual: "dados_preenchidos",
  };
}

export default function PropostaExecutivaPage() {
  const [dados, setDados] = useState<DadosProposta>(dadosIniciais());
  const [propostas, setPropostas] = useState<PropostaBanco[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [clientes, setClientes] = useState<RegistroBase[]>([]);
  const [corretoras, setCorretoras] = useState<RegistroBase[]>([]);
  const [cotacoes, setCotacoes] = useState<RegistroBase[]>([]);

  const [carregandoLista, setCarregandoLista] = useState(false);
  const [carregandoBases, setCarregandoBases] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [filtro, setFiltro] = useState("");
  const [userId, setUserId] = useState<string>("");

  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  const [corretoraSelecionadaId, setCorretoraSelecionadaId] = useState("");
  const [cotacaoSelecionadaId, setCotacaoSelecionadaId] = useState("");

  const totalCoberturas = useMemo(() => dados.coberturas.length, [dados.coberturas]);

  useEffect(() => {
    inicializar();
  }, []);

  async function inicializar() {
    await carregarUsuario();
    await Promise.all([carregarPropostas(), carregarBases()]);
  }

  async function carregarUsuario() {
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) setUserId(data.user.id);
  }

  async function carregarBases() {
    setCarregandoBases(true);

    const [listaClientes, listaCorretoras, listaCotacoes] = await Promise.all([
      buscarRegistros(TABELAS_CLIENTE, "cliente"),
      buscarRegistros(TABELAS_CORRETORA, "corretora"),
      buscarRegistros(TABELAS_COTACAO, "cotacao"),
    ]);

    setClientes(listaClientes);
    setCorretoras(listaCorretoras);
    setCotacoes(listaCotacoes);
    setCarregandoBases(false);
  }

  async function carregarPropostas() {
    setCarregandoLista(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("propostas_executivas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem(`Erro ao carregar propostas: ${error.message}`);
      setCarregandoLista(false);
      return;
    }

    setPropostas((data || []) as PropostaBanco[]);
    setCarregandoLista(false);
  }

  async function carregarHistorico(propostaId: string) {
    const { data, error } = await supabase
      .from("proposta_historico")
      .select("*")
      .eq("proposta_id", propostaId)
      .order("criado_em", { ascending: false });

    if (error) {
      setHistorico([]);
      return;
    }

    setHistorico((data || []) as HistoricoItem[]);
  }

  async function registrarHistorico({
    propostaId,
    acao,
    descricao,
    statusAnterior,
    statusNovo,
  }: {
    propostaId: string;
    acao: string;
    descricao?: string;
    statusAnterior?: string;
    statusNovo?: string;
  }) {
    await supabase.from("proposta_historico").insert({
      proposta_id: propostaId,
      acao,
      descricao: descricao || null,
      status_anterior: statusAnterior || null,
      status_novo: statusNovo || null,
      criado_por: userId || null,
    });
  }

  function atualizarCampo<K extends keyof DadosProposta>(campo: K, valor: DadosProposta[K]) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function atualizarCobertura(id: string, campo: keyof LinhaCobertura, valor: string) {
    setDados((prev) => ({
      ...prev,
      coberturas: prev.coberturas.map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item
      ),
    }));
  }

  function adicionarCobertura() {
    setDados((prev) => ({
      ...prev,
      coberturas: [
        ...prev.coberturas,
        {
          id: crypto.randomUUID(),
          cobertura: "",
          descricao: "",
          limite: "",
          franquia: "",
          observacoes: "",
        },
      ],
    }));
  }

  function removerCobertura(id: string) {
    setDados((prev) => ({
      ...prev,
      coberturas: prev.coberturas.filter((item) => item.id !== id),
    }));
  }

  function novaProposta() {
    setDados(dadosIniciais());
    setHistorico([]);
    setClienteSelecionadoId("");
    setCorretoraSelecionadaId("");
    setCotacaoSelecionadaId("");
    setMensagem("Novo formulário pronto.");
  }

  async function salvarProposta() {
    if (!dados.numeroProposta.trim()) {
      setMensagem("Informe o número da proposta.");
      return;
    }

    if (!dados.clienteNome.trim()) {
      setMensagem("Informe pelo menos o nome do cliente.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    if (dados.id) {
      const anterior = propostas.find((p) => p.id === dados.id);

      const { error } = await supabase
        .from("propostas_executivas")
        .update(mapTelaParaBanco(dados, userId))
        .eq("id", dados.id);

      if (error) {
        setMensagem(`Erro ao atualizar proposta: ${error.message}`);
        setSalvando(false);
        return;
      }

      await registrarHistorico({
        propostaId: dados.id,
        acao: "atualizacao",
        descricao: "Proposta atualizada manualmente.",
        statusAnterior: anterior?.status,
        statusNovo: dados.status,
      });

      setMensagem("Proposta atualizada com sucesso.");
      await carregarPropostas();
      await carregarHistorico(dados.id);
      setSalvando(false);
      return;
    }

    const payload = {
      ...mapTelaParaBanco(dados, userId),
      created_by: userId || null,
    };

    const { data, error } = await supabase
      .from("propostas_executivas")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      setMensagem(`Erro ao salvar proposta: ${error.message}`);
      setSalvando(false);
      return;
    }

    const propostaSalva = data as PropostaBanco;

    await registrarHistorico({
      propostaId: propostaSalva.id,
      acao: "criacao",
      descricao: "Proposta criada no CRM.",
      statusNovo: propostaSalva.status,
    });

    setDados(mapBancoParaTela(propostaSalva));
    setMensagem("Proposta salva com sucesso.");
    await carregarPropostas();
    await carregarHistorico(propostaSalva.id);
    setSalvando(false);
  }

  async function editarProposta(id: string) {
    setMensagem("");

    const { data, error } = await supabase
      .from("propostas_executivas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setMensagem(`Erro ao abrir proposta: ${error.message}`);
      return;
    }

    const proposta = mapBancoParaTela(data as PropostaBanco);
    setDados(proposta);

    setClienteSelecionadoId(proposta.origemClienteId || proposta.clienteId || "");
    setCorretoraSelecionadaId(proposta.origemCorretoraId || proposta.corretoraId || "");
    setCotacaoSelecionadaId(proposta.origemCotacaoId || proposta.cotacaoId || "");

    await carregarHistorico(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluirProposta(id: string) {
    const confirmou = window.confirm("Deseja realmente excluir esta proposta?");
    if (!confirmou) return;

    const { error } = await supabase.from("propostas_executivas").delete().eq("id", id);

    if (error) {
      setMensagem(`Erro ao excluir proposta: ${error.message}`);
      return;
    }

    if (dados.id === id) novaProposta();

    setMensagem("Proposta excluída com sucesso.");
    await carregarPropostas();
  }

  async function duplicarProposta(item: PropostaBanco) {
    const base = mapBancoParaTela(item);

    const nova: DadosProposta = {
      ...base,
      id: undefined,
      numeroProposta: `SEGMAX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      status: "rascunho",
      etapaAtual: "estrutura_inicial",
      dataEmissao: new Date().toLocaleDateString("pt-BR"),
      publicToken: "",
      publicSlug: "",
      linkPublicoAtivo: false,
      totalVisualizacoes: 0,
      primeiraVisualizacaoEm: "",
      ultimaVisualizacaoEm: "",
      aceitePublicoEm: "",
      recusadaPublicoEm: "",
      enviadoCorretorEm: "",
      enviadoClienteEm: "",
    };

    const { data, error } = await supabase
      .from("propostas_executivas")
      .insert({
        ...mapTelaParaBanco(nova, userId),
        created_by: userId || null,
      })
      .select("*")
      .single();

    if (error) {
      setMensagem(`Erro ao duplicar proposta: ${error.message}`);
      return;
    }

    const novaPropostaSalva = data as PropostaBanco;

    await registrarHistorico({
      propostaId: novaPropostaSalva.id,
      acao: "duplicacao",
      descricao: `Proposta criada a partir da duplicação de ${item.numero_proposta}.`,
      statusNovo: "rascunho",
    });

    setMensagem("Proposta duplicada com sucesso.");
    await carregarPropostas();
  }

  function aplicarClienteSelecionado() {
    const encontrado = clientes.find((item) => item.id === clienteSelecionadoId);
    if (!encontrado) return;
    setDados((prev) => aplicarClienteNaProposta(encontrado.raw, prev));
    setMensagem("Cliente real aplicado na proposta.");
  }

  function aplicarCorretoraSelecionada() {
    const encontrada = corretoras.find((item) => item.id === corretoraSelecionadaId);
    if (!encontrada) return;
    setDados((prev) => aplicarCorretoraNaProposta(encontrada.raw, prev));
    setMensagem("Corretora real aplicada na proposta.");
  }

  function aplicarCotacaoSelecionada() {
    const encontrada = cotacoes.find((item) => item.id === cotacaoSelecionadaId);
    if (!encontrada) return;
    setDados((prev) => aplicarCotacaoNaProposta(encontrada.raw, prev));
    setMensagem("Cotação real aplicada na proposta.");
  }

  function gerarPropostaAPartirDaCotacao() {
    const cotacao = cotacoes.find((item) => item.id === cotacaoSelecionadaId);
    if (!cotacao) {
      setMensagem("Selecione uma cotação real antes de gerar.");
      return;
    }

    setDados((prev) => {
      let novo = { ...prev };
      novo = aplicarCotacaoNaProposta(cotacao.raw, novo);

      if (clienteSelecionadoId) {
        const cliente = clientes.find((item) => item.id === clienteSelecionadoId);
        if (cliente) novo = aplicarClienteNaProposta(cliente.raw, novo);
      }

      if (corretoraSelecionadaId) {
        const corretora = corretoras.find((item) => item.id === corretoraSelecionadaId);
        if (corretora) novo = aplicarCorretoraNaProposta(corretora.raw, novo);
      }

      return {
        ...novo,
        etapaAtual: "em_revisao",
        resumoExecutivo:
          novo.resumoExecutivo ||
          "Proposta gerada a partir da cotação registrada no CRM, consolidando dados comerciais e técnicos para validação final antes do envio ao cliente.",
        analiseRisco:
          novo.analiseRisco ||
          "Com base nas informações da cotação e no enquadramento operacional identificado, a proposta foi estruturada para equilibrar proteção, custo e aderência ao risco apresentado.",
        parecerTecnico:
          novo.parecerTecnico ||
          "Entendemos que a presente solução atende ao cenário informado e está apta para revisão final e encaminhamento ao cliente, observadas as condições comerciais e técnicas aplicáveis.",
      };
    });

    setMensagem("Estrutura da proposta gerada a partir da cotação.");
  }

  async function mudarStatusRapido(novoStatus: StatusProposta) {
    if (!dados.id) {
      setMensagem("Salve a proposta primeiro para mudar o status com histórico.");
      return;
    }

    const statusAnterior = dados.status;

    let novaEtapa = dados.etapaAtual;
    if (novoStatus === "em_analise") novaEtapa = "em_revisao";
    if (novoStatus === "enviada") novaEtapa = "enviada_cliente";
    if (novoStatus === "aprovada") novaEtapa = "fechada_aprovada";
    if (novoStatus === "recusada") novaEtapa = "fechada_recusada";

    const { error } = await supabase
      .from("propostas_executivas")
      .update({
        status: novoStatus,
        etapa_atual: novaEtapa,
      })
      .eq("id", dados.id);

    if (error) {
      setMensagem(`Erro ao alterar status: ${error.message}`);
      return;
    }

    await registrarHistorico({
      propostaId: dados.id,
      acao: "mudanca_status",
      descricao: `Status alterado para ${novoStatus.replace("_", " ")}.`,
      statusAnterior,
      statusNovo: novoStatus,
    });

    setDados((prev) => ({
      ...prev,
      status: novoStatus,
      etapaAtual: novaEtapa,
    }));

    setMensagem("Status atualizado com sucesso.");
    await carregarPropostas();
    await carregarHistorico(dados.id);
  }

  async function gerarLinkPublico() {
    if (!dados.id) {
      setMensagem("Salve a proposta antes de gerar o link público.");
      return;
    }

    const token = crypto.randomUUID();
    const baseSlug = slugify(`${dados.numeroProposta}-${dados.clienteNome || "cliente"}`);
    const slugFinal = `${baseSlug}-${String(Date.now()).slice(-5)}`;

    const agora = new Date().toISOString();

    const { error } = await supabase
      .from("propostas_executivas")
      .update({
        public_token: token,
        public_slug: slugFinal,
        link_publico_ativo: true,
        link_publico_criado_em: agora,
        etapa_atual: "pronta_envio",
      })
      .eq("id", dados.id);

    if (error) {
      setMensagem(`Erro ao gerar link público: ${error.message}`);
      return;
    }

    await registrarHistorico({
      propostaId: dados.id,
      acao: "link_publico_gerado",
      descricao: "Link público da proposta foi gerado e ativado.",
      statusAnterior: dados.status,
      statusNovo: dados.status,
    });

    setDados((prev) => ({
      ...prev,
      publicToken: token,
      publicSlug: slugFinal,
      linkPublicoAtivo: true,
      etapaAtual: "pronta_envio",
    }));

    setMensagem("Link público gerado com sucesso.");
    await carregarPropostas();
    await carregarHistorico(dados.id);
  }

  async function alternarLinkPublico(ativo: boolean) {
    if (!dados.id) {
      setMensagem("Salve a proposta antes.");
      return;
    }

    const { error } = await supabase
      .from("propostas_executivas")
      .update({
        link_publico_ativo: ativo,
      })
      .eq("id", dados.id);

    if (error) {
      setMensagem(`Erro ao alterar link público: ${error.message}`);
      return;
    }

    await registrarHistorico({
      propostaId: dados.id,
      acao: ativo ? "link_publico_ativado" : "link_publico_desativado",
      descricao: ativo
        ? "Link público ativado manualmente."
        : "Link público desativado manualmente.",
      statusAnterior: dados.status,
      statusNovo: dados.status,
    });

    setDados((prev) => ({
      ...prev,
      linkPublicoAtivo: ativo,
    }));

    setMensagem(ativo ? "Link público ativado." : "Link público desativado.");
    await carregarPropostas();
    await carregarHistorico(dados.id);
  }

  function obterLinkPublico() {
    if (!dados.publicToken) return "";
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${base}/proposta-publica/${dados.publicToken}`;
  }

  async function copiarLinkPublico() {
    const link = obterLinkPublico();
    if (!link) {
      setMensagem("Gere o link público primeiro.");
      return;
    }

    await navigator.clipboard.writeText(link);
    setMensagem("Link público copiado.");
  }

  function abrirLinkPublico() {
    const link = obterLinkPublico();
    if (!link) {
      setMensagem("Gere o link público primeiro.");
      return;
    }

    window.open(link, "_blank");
  }

  async function registrarEnvio(tipo: "corretor" | "cliente") {
    if (!dados.id) {
      setMensagem("Salve a proposta antes.");
      return;
    }

    const agora = new Date().toISOString();

    const payload =
      tipo === "corretor"
        ? { enviado_corretor_em: agora, status: "enviada", etapa_atual: "enviada_cliente" }
        : { enviado_cliente_em: agora, status: "enviada", etapa_atual: "enviada_cliente" };

    const { error } = await supabase
      .from("propostas_executivas")
      .update(payload)
      .eq("id", dados.id);

    if (error) {
      setMensagem(`Erro ao registrar envio: ${error.message}`);
      return;
    }

    await registrarHistorico({
      propostaId: dados.id,
      acao: tipo === "corretor" ? "envio_corretor" : "envio_cliente",
      descricao:
        tipo === "corretor"
          ? "Envio da proposta registrado para o corretor."
          : "Envio da proposta registrado para o cliente.",
      statusAnterior: dados.status,
      statusNovo: "enviada",
    });

    setDados((prev) => ({
      ...prev,
      status: "enviada",
      etapaAtual: "enviada_cliente",
      enviadoCorretorEm: tipo === "corretor" ? agora : prev.enviadoCorretorEm,
      enviadoClienteEm: tipo === "cliente" ? agora : prev.enviadoClienteEm,
    }));

    setMensagem(tipo === "corretor" ? "Envio ao corretor registrado." : "Envio ao cliente registrado.");
    await carregarPropostas();
    await carregarHistorico(dados.id);
  }

  function imprimirProposta() {
    window.print();
  }

  const propostasFiltradas = propostas.filter((item) => {
    const termo = filtro.toLowerCase();
    return (
      item.numero_proposta?.toLowerCase().includes(termo) ||
      item.cliente_nome?.toLowerCase().includes(termo) ||
      item.cliente_empresa?.toLowerCase().includes(termo) ||
      item.seguradora_nome?.toLowerCase().includes(termo)
    );
  });

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
          }

          .nao-imprimir {
            display: none !important;
          }

          .area-impressao {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1900px] px-4 py-6 md:px-6 lg:px-8">
        <div className="nao-imprimir mb-6 rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
            SegMax CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            Proposta Executiva - Etapa 4
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Link público seguro, rastreio de visualização, aceite e recusa integrados ao CRM.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={salvarProposta}
              disabled={salvando}
              className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : dados.id ? "Atualizar proposta" : "Salvar proposta"}
            </button>

            <button
              onClick={novaProposta}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Nova proposta
            </button>

            <button
              onClick={imprimirProposta}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Imprimir / PDF
            </button>

            <button
              onClick={carregarPropostas}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Atualizar lista
            </button>

            <button
              onClick={carregarBases}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Recarregar bases
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => mudarStatusRapido("em_analise")}
              className="rounded-xl bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-300"
            >
              Marcar em análise
            </button>
            <button
              onClick={() => mudarStatusRapido("enviada")}
              className="rounded-xl bg-blue-500/15 px-4 py-2 text-xs font-semibold text-blue-300"
            >
              Marcar enviada
            </button>
            <button
              onClick={() => mudarStatusRapido("aprovada")}
              className="rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300"
            >
              Marcar aprovada
            </button>
            <button
              onClick={() => mudarStatusRapido("recusada")}
              className="rounded-xl bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-300"
            >
              Marcar recusada
            </button>
          </div>

          {mensagem ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
              {mensagem}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr_1fr_360px]">
          <aside className="nao-imprimir rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Propostas salvas</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Abra, duplique ou exclua qualquer proposta.
              </p>
            </div>

            <CampoInput
              label="Buscar proposta"
              value={filtro}
              onChange={setFiltro}
              placeholder="Número, cliente, empresa ou seguradora"
            />

            <div className="mt-4 space-y-3">
              {carregandoLista ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  Carregando propostas...
                </div>
              ) : propostasFiltradas.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  Nenhuma proposta encontrada.
                </div>
              ) : (
                propostasFiltradas.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{item.numero_proposta}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {item.cliente_nome || "Sem cliente"} {item.cliente_empresa ? `• ${item.cliente_empresa}` : ""}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          Etapa: {labelEtapa(item.etapa_atual || "")}
                        </p>
                      </div>

                      <span className={cls("rounded-full px-3 py-1 text-[11px] font-semibold capitalize", badgeStatus(item.status))}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => editarProposta(item.id)}
                        className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-zinc-950"
                      >
                        Abrir
                      </button>
                      <button
                        onClick={() => duplicarProposta(item)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => excluirProposta(item.id)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="nao-imprimir space-y-6">
            <Bloco
              titulo="1. Integração com a base real"
              subtitulo="Selecione cliente, corretora e cotação da operação."
            >
              <div className="grid gap-4">
                <CampoSelect
                  label={`Cliente real ${carregandoBases ? "(carregando...)" : ""}`}
                  value={clienteSelecionadoId}
                  onChange={setClienteSelecionadoId}
                  options={[
                    { label: "Selecione um cliente", value: "" },
                    ...clientes.map((item) => ({
                      label: item.subtitulo ? `${item.nome_exibicao} - ${item.subtitulo}` : item.nome_exibicao,
                      value: item.id,
                    })),
                  ]}
                />
                <button
                  onClick={aplicarClienteSelecionado}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  Aplicar cliente na proposta
                </button>

                <CampoSelect
                  label={`Corretora real ${carregandoBases ? "(carregando...)" : ""}`}
                  value={corretoraSelecionadaId}
                  onChange={setCorretoraSelecionadaId}
                  options={[
                    { label: "Selecione uma corretora", value: "" },
                    ...corretoras.map((item) => ({
                      label: item.subtitulo ? `${item.nome_exibicao} - ${item.subtitulo}` : item.nome_exibicao,
                      value: item.id,
                    })),
                  ]}
                />
                <button
                  onClick={aplicarCorretoraSelecionada}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  Aplicar corretora na proposta
                </button>

                <CampoSelect
                  label={`Cotação real ${carregandoBases ? "(carregando...)" : ""}`}
                  value={cotacaoSelecionadaId}
                  onChange={setCotacaoSelecionadaId}
                  options={[
                    { label: "Selecione uma cotação", value: "" },
                    ...cotacoes.map((item) => ({
                      label: item.subtitulo ? `${item.nome_exibicao} - ${item.subtitulo}` : item.nome_exibicao,
                      value: item.id,
                    })),
                  ]}
                />
                <button
                  onClick={aplicarCotacaoSelecionada}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  Aplicar cotação na proposta
                </button>

                <button
                  onClick={gerarPropostaAPartirDaCotacao}
                  className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950"
                >
                  Gerar proposta a partir da cotação
                </button>
              </div>
            </Bloco>

            <Bloco
              titulo="2. Link público e envio"
              subtitulo="Aqui nasce o fluxo comercial real da proposta."
            >
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <CampoInput
                    label="Token público"
                    value={dados.publicToken}
                    onChange={(v) => atualizarCampo("publicToken", v)}
                    disabled
                  />
                  <CampoInput
                    label="Slug público"
                    value={dados.publicSlug}
                    onChange={(v) => atualizarCampo("publicSlug", v)}
                    disabled
                  />
                </div>

                <CampoInput
                  label="Link público"
                  value={obterLinkPublico()}
                  onChange={() => {}}
                  disabled
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={gerarLinkPublico}
                    className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950"
                  >
                    Gerar link público
                  </button>

                  <button
                    onClick={copiarLinkPublico}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Copiar link
                  </button>

                  <button
                    onClick={abrirLinkPublico}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Abrir página pública
                  </button>

                  <button
                    onClick={() => alternarLinkPublico(true)}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300"
                  >
                    Ativar link
                  </button>

                  <button
                    onClick={() => alternarLinkPublico(false)}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
                  >
                    Desativar link
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => registrarEnvio("corretor")}
                    className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300"
                  >
                    Registrar envio ao corretor
                  </button>

                  <button
                    onClick={() => registrarEnvio("cliente")}
                    className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300"
                  >
                    Registrar envio ao cliente
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <p><span className="font-semibold">Link ativo:</span> {dados.linkPublicoAtivo ? "Sim" : "Não"}</p>
                    <p className="mt-2"><span className="font-semibold">Visualizações:</span> {dados.totalVisualizacoes}</p>
                    <p className="mt-2"><span className="font-semibold">Primeira visualização:</span> {formatarData(dados.primeiraVisualizacaoEm)}</p>
                    <p className="mt-2"><span className="font-semibold">Última visualização:</span> {formatarData(dados.ultimaVisualizacaoEm)}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <p><span className="font-semibold">Aceite público:</span> {formatarData(dados.aceitePublicoEm)}</p>
                    <p className="mt-2"><span className="font-semibold">Recusa pública:</span> {formatarData(dados.recusadaPublicoEm)}</p>
                    <p className="mt-2"><span className="font-semibold">Enviado ao corretor:</span> {formatarData(dados.enviadoCorretorEm)}</p>
                    <p className="mt-2"><span className="font-semibold">Enviado ao cliente:</span> {formatarData(dados.enviadoClienteEm)}</p>
                  </div>
                </div>
              </div>
            </Bloco>

            <Bloco titulo="3. Controle da proposta" subtitulo="Identificação, vínculo e etapa operacional.">
              <div className="grid gap-4 md:grid-cols-2">
                <CampoInput label="ID da proposta" value={dados.id || "Será gerado ao salvar"} onChange={() => {}} disabled />
                <CampoSelect
                  label="Status"
                  value={dados.status}
                  onChange={(v) => atualizarCampo("status", v as StatusProposta)}
                  options={[
                    { label: "Rascunho", value: "rascunho" },
                    { label: "Em análise", value: "em_analise" },
                    { label: "Enviada", value: "enviada" },
                    { label: "Aprovada", value: "aprovada" },
                    { label: "Recusada", value: "recusada" },
                  ]}
                />
                <CampoSelect
                  label="Etapa atual"
                  value={dados.etapaAtual}
                  onChange={(v) => atualizarCampo("etapaAtual", v)}
                  options={[
                    { label: "Estrutura inicial", value: "estrutura_inicial" },
                    { label: "Dados preenchidos", value: "dados_preenchidos" },
                    { label: "Em revisão", value: "em_revisao" },
                    { label: "Pronta para envio", value: "pronta_envio" },
                    { label: "Enviada ao cliente", value: "enviada_cliente" },
                    { label: "Fechada aprovada", value: "fechada_aprovada" },
                    { label: "Fechada recusada", value: "fechada_recusada" },
                  ]}
                />
                <CampoInput label="Número da proposta" value={dados.numeroProposta} onChange={(v) => atualizarCampo("numeroProposta", v)} />
                <CampoInput label="Data de emissão" value={dados.dataEmissao} onChange={(v) => atualizarCampo("dataEmissao", v)} />
                <CampoInput label="Validade" value={dados.validade} onChange={(v) => atualizarCampo("validade", v)} />
                <CampoInput label="Cliente ID" value={dados.clienteId} onChange={(v) => atualizarCampo("clienteId", v)} />
                <CampoInput label="Cotação ID" value={dados.cotacaoId} onChange={(v) => atualizarCampo("cotacaoId", v)} />
                <CampoInput label="Corretora ID" value={dados.corretoraId} onChange={(v) => atualizarCampo("corretoraId", v)} />
                <CampoInput label="Origem Cliente ID" value={dados.origemClienteId} onChange={(v) => atualizarCampo("origemClienteId", v)} />
                <CampoInput label="Origem Cotação ID" value={dados.origemCotacaoId} onChange={(v) => atualizarCampo("origemCotacaoId", v)} />
                <CampoInput label="Origem Corretora ID" value={dados.origemCorretoraId} onChange={(v) => atualizarCampo("origemCorretoraId", v)} />
                <CampoInput label="Título" value={dados.tituloDocumento} onChange={(v) => atualizarCampo("tituloDocumento", v)} />
                <CampoInput label="Subtítulo" value={dados.subtituloDocumento} onChange={(v) => atualizarCampo("subtituloDocumento", v)} />
              </div>
            </Bloco>

            <Bloco titulo="4. Cliente">
              <div className="grid gap-4 md:grid-cols-2">
                <CampoInput label="Nome" value={dados.clienteNome} onChange={(v) => atualizarCampo("clienteNome", v)} />
                <CampoInput label="Documento" value={dados.clienteDocumento} onChange={(v) => atualizarCampo("clienteDocumento", v)} />
                <CampoInput label="Empresa" value={dados.clienteEmpresa} onChange={(v) => atualizarCampo("clienteEmpresa", v)} />
                <CampoInput label="Contato" value={dados.clienteContato} onChange={(v) => atualizarCampo("clienteContato", v)} />
                <CampoInput label="E-mail" value={dados.clienteEmail} onChange={(v) => atualizarCampo("clienteEmail", v)} />
                <CampoInput label="Telefone" value={dados.clienteTelefone} onChange={(v) => atualizarCampo("clienteTelefone", v)} />
              </div>

              <div className="mt-4">
                <CampoInput label="Endereço" value={dados.clienteEndereco} onChange={(v) => atualizarCampo("clienteEndereco", v)} />
              </div>
            </Bloco>

            <Bloco titulo="5. Corretora e seguradora">
              <div className="grid gap-4 md:grid-cols-2">
                <CampoInput label="Corretora" value={dados.corretoraNome} onChange={(v) => atualizarCampo("corretoraNome", v)} />
                <CampoInput label="Responsável" value={dados.corretoraResponsavel} onChange={(v) => atualizarCampo("corretoraResponsavel", v)} />
                <CampoInput label="E-mail corretora" value={dados.corretoraEmail} onChange={(v) => atualizarCampo("corretoraEmail", v)} />
                <CampoInput label="Telefone corretora" value={dados.corretoraTelefone} onChange={(v) => atualizarCampo("corretoraTelefone", v)} />
                <CampoInput label="Logo URL" value={dados.corretoraLogoUrl} onChange={(v) => atualizarCampo("corretoraLogoUrl", v)} />
                <CampoInput label="Seguradora" value={dados.seguradoraNome} onChange={(v) => atualizarCampo("seguradoraNome", v)} />
                <CampoInput label="Ramo do seguro" value={dados.ramoSeguro} onChange={(v) => atualizarCampo("ramoSeguro", v)} />
                <CampoInput label="Objeto segurado" value={dados.objetoSegurado} onChange={(v) => atualizarCampo("objetoSegurado", v)} />
                <CampoInput label="Importância segurada" value={dados.importanciaSegurada} onChange={(v) => atualizarCampo("importanciaSegurada", v)} />
                <CampoInput label="Prêmio líquido" value={dados.premioLiquido} onChange={(v) => atualizarCampo("premioLiquido", v)} />
                <CampoInput label="Prêmio total" value={dados.premioTotal} onChange={(v) => atualizarCampo("premioTotal", v)} />
                <CampoInput label="Forma de pagamento" value={dados.formaPagamento} onChange={(v) => atualizarCampo("formaPagamento", v)} />
                <CampoInput label="Vigência início" value={dados.vigenciaInicio} onChange={(v) => atualizarCampo("vigenciaInicio", v)} />
                <CampoInput label="Vigência fim" value={dados.vigenciaFim} onChange={(v) => atualizarCampo("vigenciaFim", v)} />
              </div>
            </Bloco>

            <Bloco titulo="6. Conteúdo técnico">
              <div className="space-y-4">
                <CampoTextarea label="Resumo executivo" value={dados.resumoExecutivo} onChange={(v) => atualizarCampo("resumoExecutivo", v)} rows={5} />
                <CampoTextarea label="Análise de risco" value={dados.analiseRisco} onChange={(v) => atualizarCampo("analiseRisco", v)} rows={5} />
                <CampoTextarea label="Parecer técnico" value={dados.parecerTecnico} onChange={(v) => atualizarCampo("parecerTecnico", v)} rows={5} />
                <CampoTextarea label="Considerações gerais" value={dados.consideracoesGerais} onChange={(v) => atualizarCampo("consideracoesGerais", v)} rows={5} />
                <CampoTextarea label="Cláusulas importantes" value={dados.clausulasImportantes} onChange={(v) => atualizarCampo("clausulasImportantes", v)} rows={6} />
                <CampoTextarea label="Próximos passos" value={dados.proximosPassos} onChange={(v) => atualizarCampo("proximosPassos", v)} rows={5} />
              </div>
            </Bloco>

            <Bloco titulo="7. Coberturas" subtitulo={`Hoje existem ${totalCoberturas} coberturas na proposta.`}>
              <div className="space-y-4">
                {dados.coberturas.map((item, index) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-amber-400">Cobertura {index + 1}</p>

                      <button
                        onClick={() => removerCobertura(item.id)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <CampoInput label="Cobertura" value={item.cobertura} onChange={(v) => atualizarCobertura(item.id, "cobertura", v)} />
                      <CampoInput label="Limite" value={item.limite} onChange={(v) => atualizarCobertura(item.id, "limite", v)} />
                      <CampoInput label="Franquia" value={item.franquia} onChange={(v) => atualizarCobertura(item.id, "franquia", v)} />
                      <CampoInput label="Observações" value={item.observacoes} onChange={(v) => atualizarCobertura(item.id, "observacoes", v)} />
                    </div>

                    <div className="mt-4">
                      <CampoTextarea label="Descrição" value={item.descricao} onChange={(v) => atualizarCobertura(item.id, "descricao", v)} rows={4} />
                    </div>
                  </div>
                ))}

                <button
                  onClick={adicionarCobertura}
                  className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300"
                >
                  Adicionar cobertura
                </button>
              </div>
            </Bloco>
          </div>

          <section className="area-impressao rounded-[32px] border border-white/10 bg-white text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="border-b border-zinc-200 px-8 py-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600">
                    {dados.corretoraNome || "SegMax Consultoria"}
                  </p>
                  <h1 className="mt-3 text-3xl font-bold leading-tight">{dados.tituloDocumento}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-600">{dados.subtituloDocumento}</p>
                </div>

                <div className="min-w-[240px] rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                  <p><span className="font-semibold">Proposta:</span> {dados.numeroProposta}</p>
                  <p className="mt-2"><span className="font-semibold">Emissão:</span> {dados.dataEmissao}</p>
                  <p className="mt-2"><span className="font-semibold">Validade:</span> {dados.validade || "-"}</p>
                  <p className="mt-2"><span className="font-semibold">Status:</span> {dados.status.replace("_", " ")}</p>
                  <p className="mt-2"><span className="font-semibold">Etapa:</span> {labelEtapa(dados.etapaAtual)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 px-8 py-8">
              <section>
                <h2 className="text-lg font-bold">1. Identificação</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-zinc-200 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Cliente</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><span className="font-semibold">Nome:</span> {dados.clienteNome || "-"}</p>
                      <p><span className="font-semibold">Documento:</span> {dados.clienteDocumento || "-"}</p>
                      <p><span className="font-semibold">Empresa:</span> {dados.clienteEmpresa || "-"}</p>
                      <p><span className="font-semibold">Contato:</span> {dados.clienteContato || "-"}</p>
                      <p><span className="font-semibold">E-mail:</span> {dados.clienteEmail || "-"}</p>
                      <p><span className="font-semibold">Telefone:</span> {dados.clienteTelefone || "-"}</p>
                      <p><span className="font-semibold">Endereço:</span> {dados.clienteEndereco || "-"}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Intermediação</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><span className="font-semibold">Corretora:</span> {dados.corretoraNome || "-"}</p>
                      <p><span className="font-semibold">Responsável:</span> {dados.corretoraResponsavel || "-"}</p>
                      <p><span className="font-semibold">E-mail:</span> {dados.corretoraEmail || "-"}</p>
                      <p><span className="font-semibold">Telefone:</span> {dados.corretoraTelefone || "-"}</p>
                      <p><span className="font-semibold">Seguradora:</span> {dados.seguradoraNome || "-"}</p>
                      <p><span className="font-semibold">Ramo:</span> {dados.ramoSeguro || "-"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold">2. Resumo Executivo</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{dados.resumoExecutivo || "-"}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold">3. Enquadramento da Operação</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-zinc-200 p-5 text-sm">
                    <p><span className="font-semibold">Objeto segurado:</span> {dados.objetoSegurado || "-"}</p>
                    <p className="mt-3"><span className="font-semibold">Importância segurada:</span> {dados.importanciaSegurada || "-"}</p>
                    <p className="mt-3"><span className="font-semibold">Vigência:</span> {dados.vigenciaInicio || "-"} até {dados.vigenciaFim || "-"}</p>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 p-5 text-sm">
                    <p><span className="font-semibold">Prêmio líquido:</span> {dados.premioLiquido || "-"}</p>
                    <p className="mt-3"><span className="font-semibold">Prêmio total:</span> {dados.premioTotal || "-"}</p>
                    <p className="mt-3"><span className="font-semibold">Pagamento:</span> {dados.formaPagamento || "-"}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold">4. Análise de Risco</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{dados.analiseRisco || "-"}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold">5. Coberturas Sugeridas</h2>
                <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200">
                  <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
                    <div className="col-span-3 px-4 py-3">Cobertura</div>
                    <div className="col-span-4 px-4 py-3">Descrição</div>
                    <div className="col-span-2 px-4 py-3">Limite</div>
                    <div className="col-span-1 px-4 py-3">Franquia</div>
                    <div className="col-span-2 px-4 py-3">Observações</div>
                  </div>

                  {dados.coberturas.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cls("grid grid-cols-12 text-sm", idx !== dados.coberturas.length - 1 && "border-b border-zinc-200")}
                    >
                      <div className="col-span-3 px-4 py-4 font-semibold">{item.cobertura || "-"}</div>
                      <div className="col-span-4 px-4 py-4 text-zinc-700">{item.descricao || "-"}</div>
                      <div className="col-span-2 px-4 py-4">{item.limite || "-"}</div>
                      <div className="col-span-1 px-4 py-4">{item.franquia || "-"}</div>
                      <div className="col-span-2 px-4 py-4 text-zinc-700">{item.observacoes || "-"}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold">6. Parecer Técnico</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{dados.parecerTecnico || "-"}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold">7. Considerações Gerais</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{dados.consideracoesGerais || "-"}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold">8. Cláusulas Importantes</h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{dados.clausulasImportantes || "-"}</div>
              </section>

              <section>
                <h2 className="text-lg font-bold">9. Próximos Passos</h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{dados.proximosPassos || "-"}</div>
              </section>
            </div>
          </section>

          <aside className="nao-imprimir rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Histórico da proposta</h2>
              <p className="mt-1 text-sm text-zinc-400">Tudo o que aconteceu com esta proposta.</p>
            </div>

            {!dados.id ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                Salve ou abra uma proposta para visualizar o histórico.
              </div>
            ) : historico.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                Ainda não há eventos registrados.
              </div>
            ) : (
              <div className="space-y-3">
                {historico.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{item.acao}</p>
                    <p className="mt-1 text-xs text-zinc-400">{new Date(item.criado_em).toLocaleString("pt-BR")}</p>
                    {item.descricao ? <p className="mt-3 text-sm text-zinc-300">{item.descricao}</p> : null}
                    {(item.status_anterior || item.status_novo) ? (
                      <p className="mt-2 text-xs text-zinc-500">
                        {item.status_anterior || "-"} → {item.status_novo || "-"}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}