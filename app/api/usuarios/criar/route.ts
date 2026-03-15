import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Permissao =
  | "master"
  | "diretora_tecnica"
  | "diretora_financeira"
  | "admin_corretora"
  | "corretor"
  | "operacional";

const permissoesValidas: Permissao[] = [
  "master",
  "diretora_tecnica",
  "diretora_financeira",
  "admin_corretora",
  "corretor",
  "operacional",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const telefone = String(body.telefone || "").trim();
    const senha = String(body.senha || "").trim();
    const permissao = String(body.permissao || "").trim() as Permissao;
    const status = String(body.status || "ativo").trim();
    const corretora_id =
      body.corretora_id && String(body.corretora_id).trim() !== ""
        ? String(body.corretora_id).trim()
        : null;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    if (!senha || senha.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (!permissoesValidas.includes(permissao)) {
      return NextResponse.json(
        { error: "Permissão inválida." },
        { status: 400 }
      );
    }

    if (!["ativo", "suspenso", "bloqueado"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido." },
        { status: 400 }
      );
    }

    const { data: emailExistenteAuth } =
      await supabaseAdmin.auth.admin.listUsers();

    const jaExisteNoAuth = emailExistenteAuth.users.some(
      (u) => u.email?.toLowerCase() === email
    );

    if (jaExisteNoAuth) {
      return NextResponse.json(
        { error: "Já existe um usuário no Auth com este e-mail." },
        { status: 400 }
      );
    }

    const { data: usuarioExistenteTabela, error: erroUsuarioExistente } =
      await supabaseAdmin
        .from("usuarios")
        .select("id, email")
        .eq("email", email)
        .maybeSingle();

    if (erroUsuarioExistente) {
      return NextResponse.json(
        { error: erroUsuarioExistente.message },
        { status: 400 }
      );
    }

    if (usuarioExistenteTabela) {
      return NextResponse.json(
        { error: "Já existe um usuário na tabela usuarios com este e-mail." },
        { status: 400 }
      );
    }

    const { data: authCriado, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome,
          permissao,
        },
      });

    if (authError || !authCriado.user) {
      return NextResponse.json(
        { error: authError?.message || "Erro ao criar usuário no Auth." },
        { status: 400 }
      );
    }

    const authUserId = authCriado.user.id;

    const { data: usuarioCriado, error: insertError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        id: authUserId,
        nome,
        email,
        telefone: telefone || null,
        permissao,
        status,
        ativo: status === "ativo",
        corretora_id,
      })
      .select()
      .single();

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso.",
      usuario: usuarioCriado,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno ao criar usuário.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}