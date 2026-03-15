import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body?.nome || "").trim();
    const login = String(body?.login || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const senha = String(body?.senha || "").trim();
    const telefone = String(body?.telefone || "").trim();
    const permissao = String(body?.permissao || "corretor").trim();
    const status = String(body?.status || "ativo").trim();
    const corretora = String(body?.corretora || "Corretora SegMax").trim();

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    if (!login) {
      return NextResponse.json({ error: "Login é obrigatório." }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    if (!senha || senha.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const { data: loginExistente, error: erroLoginExistente } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("login", login)
      .maybeSingle();

    if (erroLoginExistente) {
      return NextResponse.json({ error: erroLoginExistente.message }, { status: 400 });
    }

    if (loginExistente) {
      return NextResponse.json({ error: "Este login já está em uso." }, { status: 400 });
    }

    const { data: emailExistente, error: erroEmailExistente } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (erroEmailExistente) {
      return NextResponse.json({ error: erroEmailExistente.message }, { status: 400 });
    }

    if (emailExistente) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 400 });
    }

    const { data: criadoAuth, error: erroAuth } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        login,
        permissao,
        corretora,
      },
    });

    if (erroAuth || !criadoAuth?.user) {
      return NextResponse.json(
        { error: erroAuth?.message || "Não foi possível criar o acesso no Auth." },
        { status: 400 }
      );
    }

    const authUserId = criadoAuth.user.id;

    const { error: erroUsuario } = await supabaseAdmin.from("usuarios").insert({
      id: authUserId,
      nome,
      login,
      email,
      telefone: telefone || null,
      permissao,
      status,
      corretora,
    });

    if (erroUsuario) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json({ error: erroUsuario.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Usuário criado com sucesso.",
      user_id: authUserId,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar usuário." },
      { status: 500 }
    );
  }
}