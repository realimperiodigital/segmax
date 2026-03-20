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
          message:
            "Usuário não autenticado. Faça login novamente antes de enviar a solicitação.",
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

    const clienteId = String(body?.cliente_id ?? "").trim();
    const clienteNome = String(body?.cliente_nome ?? "").trim();
    const corretoraNome = String(body?.corretora_nome ?? "").trim();
    const motivo = String(body?.motivo ?? "").trim();
    const tipoExclusao = String(body?.tipo_exclusao ?? "logica").trim();

    if (!clienteId) {
      return NextResponse.json(
        { success: false, message: "Cliente não informado." },
        { status: 400 }
      );
    }

    if (!motivo || motivo.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "O motivo precisa ter pelo menos 10 caracteres.",
        },
        { status: 400 }
      );
    }

    if (tipoExclusao !== "logica" && tipoExclusao !== "definitiva") {
      return NextResponse.json(
        { success: false, message: "Tipo de exclusão inválido." },
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

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from("clientes")
      .select("id, nome, corretora_id, excluido")
      .eq("id", clienteId)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        {
          success: false,
          message: "Cliente não encontrado.",
          details: clienteError?.message ?? null,
        },
        { status: 404 }
      );
    }

    if (cliente.excluido === true) {
      return NextResponse.json(
        {
          success: false,
          message: "Esse cliente já está marcado como excluído.",
        },
        { status: 400 }
      );
    }

    if (
      profile.role !== "super_master" &&
      profile.corretora_id &&
      cliente.corretora_id &&
      profile.corretora_id !== cliente.corretora_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Você não pode solicitar exclusão para cliente de outra corretora.",
        },
        { status: 403 }
      );
    }

    const { data: jaExiste, error: jaExisteError } = await supabaseAdmin
      .from("clientes_exclusoes_solicitadas")
      .select("id, status")
      .eq("cliente_id", clienteId)
      .eq("status", "pendente")
      .maybeSingle();

    if (jaExisteError) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao validar solicitação pendente existente.",
          details: jaExisteError.message,
        },
        { status: 500 }
      );
    }

    if (jaExiste) {
      return NextResponse.json(
        {
          success: false,
          message: "Já existe uma solicitação pendente para este cliente.",
        },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("clientes_exclusoes_solicitadas")
      .insert({
        cliente_id: clienteId,
        corretora_id: cliente.corretora_id ?? profile.corretora_id ?? null,
        solicitado_por: user.id,
        cliente_nome: clienteNome || cliente.nome || null,
        corretora_nome: corretoraNome || null,
        solicitado_por_nome: profile.nome || profile.email || "Usuário",
        motivo,
        tipo_exclusao: tipoExclusao,
        status: "pendente",
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao salvar solicitação no banco.",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Solicitação registrada com sucesso.",
      solicitacao_id: inserted?.id ?? null,
    });
  } catch (error) {
    console.error("Erro interno ao solicitar exclusão:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao registrar solicitação de exclusão.",
      },
      { status: 500 }
    );
  }
}