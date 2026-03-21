import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function nowIso() {
  return new Date().toISOString();
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const [{ data: proposta, error: propostaError }, { data: historico, error: historicoError }] =
      await Promise.all([
        supabase.from("vw_central_propostas").select("*").eq("id", id).single(),
        supabase
          .from("propostas_historico")
          .select("*")
          .eq("proposta_id", id)
          .order("created_at", { ascending: false }),
      ]);

    if (propostaError || !proposta) {
      return NextResponse.json(
        { error: "Proposta não encontrada." },
        { status: 404 }
      );
    }

    if (historicoError) {
      return NextResponse.json(
        { error: "Erro ao carregar histórico." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: proposta,
        historico: historico || [],
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno inesperado.";

    return NextResponse.json(
      {
        error: "Falha ao carregar dados da proposta.",
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = await request.json();

    const acao = String(body?.acao || "").trim();
    const usuarioNome = String(body?.usuario_nome || "Sistema").trim();
    const motivoRejeicao =
      typeof body?.motivo_rejeicao === "string"
        ? body.motivo_rejeicao.trim()
        : null;

    if (!acao) {
      return NextResponse.json(
        { error: "A ação é obrigatória." },
        { status: 400 }
      );
    }

    const { data: propostaAtual, error: propostaError } = await supabase
      .from("propostas")
      .select("*")
      .eq("id", id)
      .single();

    if (propostaError || !propostaAtual) {
      return NextResponse.json(
        { error: "Proposta não encontrada." },
        { status: 404 }
      );
    }

    const agora = nowIso();

    let updatePayload: Record<string, unknown> = {
      atualizado_por_nome: usuarioNome,
    };

    let historicoAcao = "atualizada";
    let historicoDescricao = "Proposta atualizada manualmente.";

    if (acao === "aprovar") {
      updatePayload = {
        ...updatePayload,
        status: "aprovada",
        etapa: "emissao",
        aprovado_por: usuarioNome,
        aprovado_em: agora,
      };
      historicoAcao = "aprovada";
      historicoDescricao = "Proposta aprovada e enviada para emissão.";
    } else if (acao === "rejeitar") {
      if (!motivoRejeicao) {
        return NextResponse.json(
          { error: "O motivo da rejeição é obrigatório." },
          { status: 400 }
        );
      }

      updatePayload = {
        ...updatePayload,
        status: "rejeitada",
        etapa: "aprovacao",
        rejeitado_por: usuarioNome,
        rejeitado_em: agora,
        motivo_rejeicao: motivoRejeicao,
      };
      historicoAcao = "rejeitada";
      historicoDescricao = "Proposta rejeitada.";
    } else if (acao === "emitir") {
      updatePayload = {
        ...updatePayload,
        status: "emitida",
        etapa: "implantacao",
        emitido_em: agora,
      };
      historicoAcao = "emitida";
      historicoDescricao = "Proposta marcada como emitida.";
    } else if (acao === "pos_venda") {
      updatePayload = {
        ...updatePayload,
        status: "pos_venda",
        etapa: "pos_venda",
        implantado_em: agora,
      };
      historicoAcao = "pos_venda";
      historicoDescricao = "Proposta enviada para pós-venda.";
    } else if (acao === "cancelar") {
      updatePayload = {
        ...updatePayload,
        status: "cancelada",
      };
      historicoAcao = "cancelada";
      historicoDescricao = "Proposta cancelada.";
    } else {
      return NextResponse.json(
        { error: "Ação inválida." },
        { status: 400 }
      );
    }

    const { data: propostaAtualizada, error: updateError } = await supabase
      .from("propostas")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !propostaAtualizada) {
      return NextResponse.json(
        {
          error: "Erro ao atualizar proposta.",
          details: updateError?.message || "Falha desconhecida.",
        },
        { status: 500 }
      );
    }

    const { error: historicoInsertError } = await supabase
      .from("propostas_historico")
      .insert({
        proposta_id: id,
        acao: historicoAcao,
        status_anterior: propostaAtual.status,
        status_novo: propostaAtualizada.status,
        etapa_anterior: propostaAtual.etapa,
        etapa_nova: propostaAtualizada.etapa,
        descricao: historicoDescricao,
        observacao: acao === "rejeitar" ? motivoRejeicao : null,
        usuario_nome: usuarioNome,
      });

    if (historicoInsertError) {
      return NextResponse.json(
        {
          error: "A proposta foi atualizada, mas houve erro ao registrar histórico.",
          details: historicoInsertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ação executada com sucesso.",
        data: propostaAtualizada,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno inesperado.";

    return NextResponse.json(
      {
        error: "Falha ao executar ação da proposta.",
        details: message,
      },
      { status: 500 }
    );
  }
}