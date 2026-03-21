export type PropostaStatus =
  | "rascunho"
  | "em_analise"
  | "aguardando_aprovacao"
  | "aprovada"
  | "rejeitada"
  | "cancelada"
  | "emitida"
  | "pos_venda";

export type PropostaEtapa =
  | "criacao"
  | "analise"
  | "aprovacao"
  | "emissao"
  | "implantacao"
  | "pos_venda";

export type PropostaExecutiva = {
  id: string;
  codigo: string | null;
  titulo: string;

  cliente_id: string | null;
  cliente_nome: string;
  cliente_documento: string | null;

  corretora_id: string | null;
  corretora_nome: string | null;

  cotacao_id: string | null;
  seguradora_id: string | null;
  seguradora_nome: string | null;

  responsavel_id: string | null;
  responsavel_nome: string | null;

  tipo_seguro: string | null;
  categoria: string | null;

  status: PropostaStatus;
  etapa: PropostaEtapa;

  valor_premio: number | null;
  valor_franquia: number | null;
  valor_importancia_segurada: number | null;
  valor_comissao: number | null;

  vigencia_inicio: string | null;
  vigencia_fim: string | null;

  resumo_executivo: string | null;
  observacoes_internas: string | null;
  observacoes_cliente: string | null;
  parecer_tecnico: string | null;

  aprovado_por: string | null;
  aprovado_em: string | null;

  rejeitado_por: string | null;
  rejeitado_em: string | null;
  motivo_rejeicao: string | null;

  emitido_em: string | null;
  implantado_em: string | null;

  ativo: boolean;

  criado_por: string | null;
  criado_por_nome: string | null;
  atualizado_por: string | null;
  atualizado_por_nome: string | null;

  created_at: string;
  updated_at: string;

  total_movimentacoes?: number;
  ultima_movimentacao_em?: string | null;
};

export type PropostaExecutivaPayload = {
  titulo: string;

  cliente_id?: string | null;
  cliente_nome: string;
  cliente_documento?: string | null;

  corretora_id?: string | null;
  corretora_nome?: string | null;

  cotacao_id?: string | null;
  seguradora_id?: string | null;
  seguradora_nome?: string | null;

  responsavel_id?: string | null;
  responsavel_nome?: string | null;

  tipo_seguro?: string | null;
  categoria?: string | null;

  status?: PropostaStatus;
  etapa?: PropostaEtapa;

  valor_premio?: number | null;
  valor_franquia?: number | null;
  valor_importancia_segurada?: number | null;
  valor_comissao?: number | null;

  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;

  resumo_executivo?: string | null;
  observacoes_internas?: string | null;
  observacoes_cliente?: string | null;
  parecer_tecnico?: string | null;

  aprovado_por?: string | null;
  aprovado_em?: string | null;

  rejeitado_por?: string | null;
  rejeitado_em?: string | null;
  motivo_rejeicao?: string | null;

  emitido_em?: string | null;
  implantado_em?: string | null;

  ativo?: boolean;

  criado_por?: string | null;
  criado_por_nome?: string | null;
  atualizado_por?: string | null;
  atualizado_por_nome?: string | null;
};

export type PropostaHistorico = {
  id: string;
  proposta_id: string;
  acao: string;
  status_anterior: string | null;
  status_novo: string | null;
  etapa_anterior: string | null;
  etapa_nova: string | null;
  descricao: string | null;
  observacao: string | null;
  usuario_id: string | null;
  usuario_nome: string | null;
  created_at: string;
};

export type PropostaArquivo = {
  id: string;
  proposta_id: string;
  nome_arquivo: string;
  tipo_arquivo: string | null;
  url_arquivo: string | null;
  tamanho_bytes: number | null;
  enviado_por: string | null;
  enviado_por_nome: string | null;
  created_at: string;
};