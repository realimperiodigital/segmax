import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  role: string | null;
  corretora_id: string | null;
  nome: string | null;
  email: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não definida.");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não definida.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    const token = authorization?.replace("Bearer ", "")?.trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário não autenticado. Faça login novamente.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível validar o usuário autenticado.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const solicitacaoId = String(body?.solicitacao_id ?? "").trim();
    const acao = String(body?.acao ?? "").trim();
    const observacao = String(body?.observacao ?? "").trim();

    if (!solicitacaoId) {
      return NextResponse.json(
        {
          success: false,
          message: "Solicitação não informada.",
        },
        { status: 400 }
      );
    }

    if (acao !== "aprovar" && acao !== "reprovar") {
      return NextResponse.json(
        {
          success: false,
          message: "Ação inválida.",
        },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, corretora_id, nome, email")
      .eq("id", user.id)
      .single<ProfileRow>();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Perfil do usuário não encontrado.",
          details: profileError?.message ?? null,
        },
        { status: 404 }
      );
    }

    if (profile.role !== "super_master" && profile.role !== "master") {
      return NextResponse.json(
        {
          success: false,
          message: "Sem permissão para decidir solicitações.",
        },
        { status: 403 }
      );
    }

    const { data: solicitacao, error: solicitacaoError } = await supabaseAdmin
      .from("clientes_exclusoes_solicitadas")
      .select("id, corretora_id, status")
      .eq("id", solicitacaoId)
      .single();

    if (solicitacaoError || !solicitacao) {
      return NextResponse.json(
        {
          success: false,
          message: "Solicitação não encontrada.",
          details: solicitacaoError?.message ?? null,
        },
        { status: 404 }
      );
    }

    if (solicitacao.status !== "pendente") {
      return NextResponse.json(
        {
          success: false,
          message: "Essa solicitação não está mais pendente.",
        },
        { status: 400 }
      );
    }

    if (
      profile.role === "master" &&
      profile.corretora_id !== solicitacao.corretora_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Você não pode decidir solicitações de outra corretora.",
        },
        { status: 403 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (acao === "aprovar") {
      const { data, error } = await supabaseAdmin.rpc("aprovar_exclusao_cliente", {
        p_solicitacao_id: solicitacaoId,
        p_observacao: observacao || null,
      });

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao aprovar solicitação.",
            details: error.message,
          },
          { status: 500 }
        );
      }

      const resultado = Array.isArray(data) ? data[0] : data;

      if (resultado?.success === false) {
        return NextResponse.json(
          {
            success: false,
            message: resultado?.message || "Não foi possível aprovar a solicitação.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          resultado?.message || "Solicitação aprovada e cliente marcado como excluído.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc("reprovar_exclusao_cliente", {
      p_solicitacao_id: solicitacaoId,
      p_observacao: observacao || null,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao reprovar solicitação.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    const resultado = Array.isArray(data) ? data[0] : data;

    if (resultado?.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: resultado?.message || "Não foi possível reprovar a solicitação.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado?.message || "Solicitação reprovada com sucesso.",
    });
  } catch (error) {
    console.error("Erro interno ao decidir exclusão:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao concluir a decisão.",
      },
      { status: 500 }
    );
  }
}