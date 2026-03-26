import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("corretoras")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const nome = String(
      body?.nome ?? ""
    ).trim();

    const nomeFantasia = String(
      body?.nome_fantasia ?? nome
    ).trim();

    const cnpj = String(
      body?.cnpj ?? ""
    ).trim();

    const email = String(
      body?.email ?? ""
    ).trim();

    const telefone = String(
      body?.telefone ?? ""
    ).trim();

    const responsavel = String(
      body?.responsavel ?? ""
    ).trim();

    /* 🔥 STATUS FIXO CORRETO */

    let status = String(
      body?.status ?? "ativo"
    )
      .trim()
      .toLowerCase();

    /* normalização segura */

    if (status === "ativa") status = "ativo";
    if (status === "inativa") status = "cancelado";

    const supabase = getSupabase();

    const { data, error } =
      await supabase
        .from("corretoras")
        .insert({
          nome,
          nome_fantasia: nomeFantasia || nome,
          cnpj: cnpj || null,
          email: email || null,
          telefone: telefone || null,
          responsavel: responsavel || null,
          status,
        })
        .select("*")
        .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      data,
      { status: 201 }
    );

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}