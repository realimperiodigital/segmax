import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL no .env.local");
  }

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY no .env.local");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
      .from("propostas_executivas")
      .select(
        `
id,
numero_proposta,
titulo_documento,
status,
cliente_nome,
corretora_nome,
seguradora_nome,
ramo_seguro,
importancia_segurada,
created_at,
updated_at
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          etapa: "lista_propostas_final",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const itens =
      data?.map((row) => ({
        id: row.id,
        numero: row.numero_proposta,
        titulo: row.titulo_documento,
        cliente: row.cliente_nome,
        corretora: row.corretora_nome,
        seguradora: row.seguradora_nome,
        ramo: row.ramo_seguro,
        status: row.status,
        valorSegurado: row.importancia_segurada,
        criadoEm: row.created_at,
        atualizadoEm: row.updated_at,
      })) ?? [];

    return NextResponse.json(
      {
        ok: true,
        etapa: "lista_propostas_final",
        total: count ?? itens.length,
        itens,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro interno desconhecido";

    return NextResponse.json(
      {
        ok: false,
        etapa: "lista_propostas_final",
        error: message,
      },
      { status: 500 }
    );
  }
}