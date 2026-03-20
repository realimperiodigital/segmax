export type PropostaExecutivaPayload = {
  cliente_id?: string | null;
  cotacao_id?: string | null;
  corretora_id?: string | null;

  titulo_documento?: string | null;
  subtitulo_documento?: string | null;
  status?: string | null;

  cliente_nome?: string | null;
  cliente_documento?: string | null;
  cliente_empresa?: string | null;
  cliente_contato?: string | null;
  cliente_email?: string | null;
  cliente_telefone?: string | null;
  cliente_endereco?: string | null;

  corretora_nome?: string | null;
  corretora_responsavel?: string | null;
  corretora_email?: string | null;
  corretora_telefone?: string | null;
  corretora_logo_url?: string | null;

  seguradora_nome?: string | null;
  ramo_seguro?: string | null;
  objeto_segurado?: string | null;
  importancia_segurada?: string | number | null;
};

export type PropostaExecutivaRegistro = {
  id: string;
  numero_proposta: string | null;
  titulo_documento: string | null;
  subtitulo_documento: string | null;
  status: string | null;

  cliente_id: string | null;
  cotacao_id: string | null;
  corretora_id: string | null;

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
  importancia_segurada: string | number | null;

  token_publico: string | null;
  link_publico: string | null;

  observacoes_cliente: string | null;
  motivo_recusa: string | null;

  visualizada_em: string | null;
  aprovada_em: string | null;
  recusada_em: string | null;
  encerrada_em: string | null;

  pdf_gerado_em: string | null;
  enviado_whatsapp_em: string | null;
  enviado_email_em: string | null;

  created_at: string | null;
  updated_at: string | null;
};