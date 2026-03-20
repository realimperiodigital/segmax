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

export async function GET(req: NextRequest) {
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
          message: "Sem permissão para visualizar histórico de exclusões.",
        },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const status = String(searchParams.get("status") ?? "todos").trim();

    let query = supabaseAdmin
      .from("clientes_exclusoes_solicitadas")
      .select(`
        id,
        cliente_id,
        corretora_id,
        solicitado_por,
        aprovado_por,
        cliente_nome,
        corretora_nome,
        solicitado_por_nome,
        aprovado_por_nome,
        motivo,
        observacao_aprovacao,
        tipo_exclusao,
        status,
        solicitado_em,
        aprovado_em,
        criado_em,
        atualizado_em
      `)
      .order("solicitado_em", { ascending: false });

    if (profile.role === "master") {
      query = query.eq("corretora_id", profile.corretora_id);
    }

    if (
      status === "pendente" ||
      status === "aprovado" ||
      status === "reprovado" ||
      status === "cancelado"
    ) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao carregar histórico de exclusões.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      historico: data ?? [],
    });
  } catch (error) {
    console.error("Erro interno ao carregar histórico de exclusões:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao carregar histórico.",
      },
      { status: 500 }
    );
  }
}