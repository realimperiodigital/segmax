import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("corretoras")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/corretoras error:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao buscar corretoras." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error("GET /api/corretoras fatal error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao buscar corretoras.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const nome = String(body?.nome ?? "").trim();
    const nomeFantasia = String(body?.nome_fantasia ?? nome).trim();
    const cnpj = String(body?.cnpj ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const telefone = String(body?.telefone ?? "").trim();
    const responsavel = String(body?.responsavel ?? "").trim();
    const status = String(body?.status ?? "ativa").trim().toLowerCase();

    if (!nome) {
      return NextResponse.json(
        { error: "Nome da corretora é obrigatório." },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      nome,
      nome_fantasia: nomeFantasia || nome,
      cnpj: cnpj || null,
      email: email || null,
      telefone: telefone || null,
      responsavel: responsavel || null,
      status,
    };

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("corretoras")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/corretoras error:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao criar corretora." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/corretoras fatal error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao criar corretora.",
      },
      { status: 500 }
    );
  }
}