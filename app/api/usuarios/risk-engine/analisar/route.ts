import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const analysisId = body?.analysisId as string | undefined;

    if (!analysisId) {
      return NextResponse.json(
        { ok: false, error: "analysisId é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "segmax_calcular_risco_automatico",
      {
        p_analysis_id: analysisId,
      }
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      resultado: data,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno no motor automático.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}