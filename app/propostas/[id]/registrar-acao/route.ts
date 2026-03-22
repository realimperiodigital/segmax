import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type StatusProposta =
  | "rascunho"
  | "em_analise"
  | "pronta_para_envio"
  | "enviada"
  | "em_negociacao"
  | "aprovada"
  | "recusada"
  | "emitida"
  | "pos_venda";

type AcaoBody = {
  acao: "alterar_status" | "registrar_observacao";
  status?: StatusProposta;
  observacao?: string;
  usuario?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variáveis do Supabase não configuradas. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function agoraFormatado(dataIso?: string) {
  const data = dataIso ? new Date(dataIso) : new Date();

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function statusLabel(status: StatusProposta) {
  const mapa: Record<StatusProposta, string> = {
    rascunho: "Rascunho",
    em_analise: "Em análise",
    pronta_para_envio: "Pronta para envio",
    enviada: "Enviada",
    em_negociacao: "Em negociação",
    aprovada: "Aprovada",
    recusada: "Recusada",
    emitida: "Emitida",
    pos_venda: "Pós-venda",
  };

  return mapa[status];
}

function montarTituloStatus(status: StatusProposta) {
  return `Status alterado para ${statusLabel(status)}`;
}

function montarDescricaoStatus(status: StatusProposta) {
  return `A proposta foi atualizada para o status ${statusLabel(status)}.`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    if (!isUuid(id)) {
      return NextResponse.json({
        sucesso: true,
        propostaId: id,
        timeline: [],
      });
    }

    const { data, error } = await supabase
      .from("proposta_historico")
      .select("id, proposta_id, tipo, titulo, descricao, status, usuario, created_at")
      .eq("proposta_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: error.message,
        },
        { status: 500 }
      );
    }

    const timeline =
      data?.map((item) => ({
        id: item.id,
        propostaId: item.proposta_id,
        tipo: item.tipo,
        titulo: item.titulo,
        descricao: item.descricao,
        status: item.status,
        usuario: item.usuario,
        dataIso: item.created_at,
        data: agoraFormatado(item.created_at),
      })) || [];

    return NextResponse.json({
      sucesso: true,
      propostaId: id,
      timeline,
    });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao carregar histórico.";

    return NextResponse.json(
      {
        sucesso: false,
        erro: mensagem,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as AcaoBody;

    if (!body?.acao) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Ação não informada.",
        },
        { status: 400 }
      );
    }

    if (!isUuid(id)) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "O ID da proposta precisa ser um UUID válido para salvar histórico no banco.",
        },
        { status: 400 }
      );
    }

    const usuario = body.usuario?.trim() || "Sistema";
    const supabase = getSupabaseAdmin();

    if (body.acao === "alterar_status") {
      if (!body.status) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: "Status não informado.",
          },
          { status: 400 }
        );
      }

      const payload = {
        proposta_id: id,
        tipo: "STATUS_ALTERADO",
        titulo: montarTituloStatus(body.status),
        descricao: montarDescricaoStatus(body.status),
        status: body.status,
        usuario,
      };

      const { data, error } = await supabase
        .from("proposta_historico")
        .insert(payload)
        .select("id, proposta_id, tipo, titulo, descricao, status, usuario, created_at")
        .single();

      if (error) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sucesso: true,
        mensagem: "Status alterado com sucesso.",
        registro: {
          id: data.id,
          propostaId: data.proposta_id,
          tipo: data.tipo,
          titulo: data.titulo,
          descricao: data.descricao,
          status: data.status,
          usuario: data.usuario,
          dataIso: data.created_at,
          data: agoraFormatado(data.created_at),
        },
      });
    }

    if (body.acao === "registrar_observacao") {
      const observacao = body.observacao?.trim();

      if (!observacao) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: "Observação não informada.",
          },
          { status: 400 }
        );
      }

      const payload = {
        proposta_id: id,
        tipo: "OBSERVACAO",
        titulo: "Observação operacional registrada",
        descricao: observacao,
        status: null,
        usuario,
      };

      const { data, error } = await supabase
        .from("proposta_historico")
        .insert(payload)
        .select("id, proposta_id, tipo, titulo, descricao, status, usuario, created_at")
        .single();

      if (error) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sucesso: true,
        mensagem: "Observação registrada com sucesso.",
        registro: {
          id: data.id,
          propostaId: data.proposta_id,
          tipo: data.tipo,
          titulo: data.titulo,
          descricao: data.descricao,
          status: data.status,
          usuario: data.usuario,
          dataIso: data.created_at,
          data: agoraFormatado(data.created_at),
        },
      });
    }

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Ação inválida.",
      },
      { status: 400 }
    );
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro interno ao processar ação.";

    return NextResponse.json(
      {
        sucesso: false,
        erro: mensagem,
      },
      { status: 500 }
    );
  }
}