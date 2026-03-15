"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Permissao =
  | "master"
  | "diretora_tecnica"
  | "diretora_financeira"
  | "admin_corretora"
  | "corretor"
  | "tecnico";

type UsuarioSistema = {
  id: string;
  nome: string | null;
  email: string | null;
  permissao: Permissao;
  status: string | null;
  ativo: boolean | null;
};

type MenuItem = {
  label: string;
  href: string;
};

type AcaoRapida = {
  label: string;
  href: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    try {
      setLoading(true);
      setErro("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, email, permissao, status, ativo")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setErro("Usuário não encontrado na tabela usuarios.");
        return;
      }

      if (data.status !== "ativo" || data.ativo !== true) {
        setErro("Seu acesso está inativo ou bloqueado.");
        return;
      }

      setUsuario(data as UsuarioSistema);
    } catch {
      setErro("Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const cargo = useMemo(() => {
    if (!usuario) return "";

    if (usuario.permissao === "master") return "SEGMAX MASTER";
    if (usuario.permissao === "diretora_tecnica") return "DIRETORA TÉCNICA";
    if (usuario.permissao === "diretora_financeira") return "DIRETORA FINANCEIRA";
    if (usuario.permissao === "admin_corretora") return "ADMIN CORRETORA";
    if (usuario.permissao === "corretor") return "CORRETOR";
    return "TÉCNICO";
  }, [usuario]);

  const seloAcesso = useMemo(() => {
    if (!usuario) return "Acesso liberado";

    if (usuario.permissao === "master") return "Acesso total liberado";
    if (usuario.permissao === "diretora_tecnica") return "Acesso técnico liberado";
    if (usuario.permissao === "diretora_financeira") return "Acesso financeiro liberado";

    return "Acesso liberado";
  }, [usuario]);

  const menu = useMemo<MenuItem[]>(() => {
    if (!usuario) return [];

    if (usuario.permissao === "master") {
      return [
        { label: "Visão geral", href: "/dashboard" },
        { label: "Corretoras", href: "/corretoras" },
        { label: "Usuários", href: "/usuarios" },
        { label: "Clientes", href: "/clientes" },
        { label: "Cotações", href: "/cotacoes" },
        { label: "Dashboard comercial", href: "/entrada" },
      ];
    }

    if (usuario.permissao === "diretora_tecnica") {
      return [
        { label: "Visão geral", href: "/dashboard" },
        { label: "Corretoras", href: "/corretoras" },
        { label: "Clientes", href: "/clientes" },
        { label: "Cotações", href: "/cotacoes" },
        { label: "Análise técnica", href: "/cotacoes" },
      ];
    }

    if (usuario.permissao === "diretora_financeira") {
      return [
        { label: "Visão geral", href: "/dashboard" },
        { label: "Corretoras", href: "/corretoras" },
        { label: "Dashboard financeiro", href: "/entrada" },
      ];
    }

    return [{ label: "Visão geral", href: "/dashboard" }];
  }, [usuario]);

  const acoesRapidas = useMemo<AcaoRapida[]>(() => {
    if (!usuario) return [];

    if (usuario.permissao === "master") {
      return [
        { label: "Nova corretora", href: "/corretoras/nova" },
        { label: "Novo usuário", href: "/usuarios/novo" },
        { label: "Nova cotação", href: "/cotacoes/nova" },
      ];
    }

    if (usuario.permissao === "diretora_tecnica") {
      return [
        { label: "Nova corretora", href: "/corretoras/nova" },
        { label: "Nova cotação", href: "/cotacoes/nova" },
        { label: "Análises", href: "/cotacoes" },
      ];
    }

    if (usuario.permissao === "diretora_financeira") {
      return [
        { label: "Nova corretora", href: "/corretoras/nova" },
        { label: "Financeiro", href: "/entrada" },
      ];
    }

    return [];
  }, [usuario]);

  const metricas = useMemo(() => {
    if (!usuario) return [];

    if (usuario.permissao === "master") {
      return [
        {
          titulo: "Corretoras ativas",
          valor: "12",
          subtitulo: "Base validada para pré-lançamento",
        },
        {
          titulo: "Usuários cadastrados",
          valor: "38",
          subtitulo: "Entre master, gestores e corretores",
        },
        {
          titulo: "Clientes no sistema",
          valor: "214",
          subtitulo: "Base comercial centralizada",
        },
        {
          titulo: "Cotações geradas",
          valor: "57",
          subtitulo: "Fluxo comercial ativo",
        },
      ];
    }

    if (usuario.permissao === "diretora_tecnica") {
      return [
        {
          titulo: "Corretoras monitoradas",
          valor: "12",
          subtitulo: "Estrutura técnica acompanhada",
        },
        {
          titulo: "Clientes analisáveis",
          valor: "214",
          subtitulo: "Base pronta para leitura de risco",
        },
        {
          titulo: "Cotações em foco",
          valor: "57",
          subtitulo: "Operação técnica em andamento",
        },
        {
          titulo: "Análises pendentes",
          valor: "09",
          subtitulo: "Itens para revisão técnica",
        },
      ];
    }

    return [
      {
        titulo: "Corretoras acompanhadas",
        valor: "12",
        subtitulo: "Operação sob gestão",
      },
      {
        titulo: "Entradas comerciais",
        valor: "57",
        subtitulo: "Volume monitorado",
      },
      {
        titulo: "Clientes ativos",
        valor: "214",
        subtitulo: "Base com potencial de faturamento",
      },
      {
        titulo: "Saúde financeira",
        valor: "82%",
        subtitulo: "Sistema pronto para escala",
      },
    ];
  }, [usuario]);

  const resumoTitulo = useMemo(() => {
    if (!usuario) return "Resumo executivo";

    if (usuario.permissao === "master") return "Resumo executivo";
    if (usuario.permissao === "diretora_tecnica") return "Resumo técnico";
    if (usuario.permissao === "diretora_financeira") return "Resumo financeiro";

    return "Resumo";
  }, [usuario]);

  const resumoTexto = useMemo(() => {
    if (!usuario) return "";

    if (usuario.permissao === "master") {
      return "O que a plataforma precisa transmitir ao abrir.";
    }

    if (usuario.permissao === "diretora_tecnica") {
      return "O que precisa de leitura técnica imediata.";
    }

    if (usuario.permissao === "diretora_financeira") {
      return "O que importa para gestão e resultado.";
    }

    return "";
  }, [usuario]);

  const resumoBloco = useMemo(() => {
    if (!usuario) {
      return { titulo: "", valor: "", texto: "" };
    }

    if (usuario.permissao === "master") {
      return {
        titulo: "Saúde da operação",
        valor: "82%",
        texto: "Sistema pronto para início de testes com corretoras piloto.",
      };
    }

    if (usuario.permissao === "diretora_tecnica") {
      return {
        titulo: "Leitura técnica",
        valor: "74%",
        texto: "Base consistente para análises, acompanhamento de risco e evolução do motor técnico.",
      };
    }

    return {
      titulo: "Força financeira",
      valor: "79%",
      texto: "Estrutura comercial pronta para organização de entrada, expansão e previsibilidade.",
    };
  }, [usuario]);

  const tituloHero = useMemo(() => {
    if (!usuario) return "Engenharia, inteligência e comando.";

    if (usuario.permissao === "master") {
      return "Engenharia, inteligência e comando.";
    }

    if (usuario.permissao === "diretora_tecnica") {
      return "Análise, leitura de risco e direção técnica.";
    }

    if (usuario.permissao === "diretora_financeira") {
      return "Controle financeiro, visão e gestão.";
    }

    return "Visão geral da operação.";
  }, [usuario]);

  const subtituloHero = useMemo(() => {
    if (!usuario) return "";

    if (usuario.permissao === "master") {
      return "Plataforma de engenharia para corretoras que operam com precisão.";
    }

    if (usuario.permissao === "diretora_tecnica") {
      return "Ambiente técnico para acompanhar corretoras, clientes, cotações e evolução analítica.";
    }

    if (usuario.permissao === "diretora_financeira") {
      return "Ambiente executivo para acompanhar corretoras, indicadores e estrutura financeira da operação.";
    }

    return "Ambiente central do SegMax CRM.";
  }, [usuario]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        Carregando dashboard...
      </div>
    );
  }

  if (erro) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            background: "rgba(10,10,10,0.96)",
            border: "1px solid rgba(212,175,55,0.18)",
            borderRadius: "24px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>
            Erro no acesso
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              marginBottom: "24px",
            }}
          >
            {erro}
          </p>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "14px 24px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(90deg,#d4af37,#f5d97a)",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "34px 24px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "18px",
        }}
      >
        <aside
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(14,14,14,0.96) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "28px",
            padding: "22px 18px",
            boxShadow: "0 0 30px rgba(212,175,55,0.05)",
            display: "flex",
            flexDirection: "column",
            minHeight: "780px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <img
              src="/segmax-logo.png"
              alt="SegMax"
              style={{
                width: "78px",
                height: "78px",
                objectFit: "contain",
                display: "block",
                margin: "0 auto 10px auto",
              }}
            />
          </div>

          <div
            style={{
              borderRadius: "24px",
              padding: "16px",
              background:
                "linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(13,13,13,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.05)",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(212,175,55,0.22)",
                background: "rgba(212,175,55,0.08)",
                color: "#d4af37",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              {seloAcesso}
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                marginBottom: "6px",
              }}
            >
              {usuario?.nome || "Usuário"}
            </div>

            <div
              style={{
                fontSize: "12px",
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.58)",
              }}
            >
              {cargo}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {menu.map((item, index) => {
              const ativo = index === 0;

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  style={{
                    textDecoration: "none",
                    padding: "16px 16px",
                    borderRadius: "18px",
                    fontWeight: 700,
                    fontSize: "14px",
                    background: ativo
                      ? "linear-gradient(135deg, #d4af37 0%, #f4da76 100%)"
                      : "linear-gradient(180deg, rgba(15,15,15,0.98) 0%, rgba(10,10,10,0.98) 100%)",
                    color: ativo ? "#111" : "rgba(255,255,255,0.88)",
                    border: ativo
                      ? "1px solid rgba(255,215,0,0.2)"
                      : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: ativo ? "0 0 18px rgba(212,175,55,0.18)" : "none",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "18px" }}>
            <button
              onClick={sair}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sair do sistema
            </button>
          </div>
        </aside>

        <main style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <section
            style={{
              minHeight: "350px",
              borderRadius: "34px",
              padding: "34px",
              border: "1px solid rgba(255,255,255,0.06)",
              background:
                "radial-gradient(circle at top center, rgba(212,175,55,0.10), transparent 35%), linear-gradient(180deg, rgba(8,8,8,0.98) 0%, rgba(4,4,4,0.98) 100%)",
              boxShadow: "0 0 40px rgba(212,175,55,0.06)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(212,175,55,0.2)",
                background: "rgba(212,175,55,0.08)",
                color: "#d4af37",
                fontWeight: 700,
                fontSize: "12px",
                marginBottom: "18px",
              }}
            >
              {usuario?.permissao === "master"
                ? "Master Admin"
                : usuario?.permissao === "diretora_tecnica"
                ? "Direção Técnica"
                : usuario?.permissao === "diretora_financeira"
                ? "Direção Financeira"
                : "Dashboard"}
            </div>

            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.40)",
                marginBottom: "12px",
                fontWeight: 700,
              }}
            >
              SEGMAX CONTROL
            </div>

            <h1
              style={{
                fontSize: "64px",
                lineHeight: 0.95,
                maxWidth: "760px",
                margin: 0,
                fontWeight: 900,
              }}
            >
              {tituloHero}
            </h1>

            <p
              style={{
                marginTop: "18px",
                fontSize: "16px",
                maxWidth: "620px",
                color: "rgba(255,255,255,0.58)",
                lineHeight: 1.7,
              }}
            >
              {subtituloHero}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "26px",
              }}
            >
              {acoesRapidas.map((acao, index) => (
                <Link
                  key={acao.label + acao.href}
                  href={acao.href}
                  style={{
                    textDecoration: "none",
                    padding: "14px 18px",
                    borderRadius: "18px",
                    fontWeight: 800,
                    fontSize: "14px",
                    background:
                      index === 0
                        ? "linear-gradient(135deg, #d4af37 0%, #f4da76 100%)"
                        : "linear-gradient(180deg, rgba(16,16,16,0.98) 0%, rgba(9,9,9,0.98) 100%)",
                    color: index === 0 ? "#111" : "#fff",
                    border:
                      index === 0
                        ? "1px solid rgba(255,215,0,0.22)"
                        : "1px solid rgba(255,255,255,0.06)",
                    boxShadow:
                      index === 0 ? "0 0 18px rgba(212,175,55,0.18)" : "none",
                  }}
                >
                  {acao.label}
                </Link>
              ))}
            </div>

            <img
              src="/segmax-logo.png"
              alt="Marca d'água SegMax"
              style={{
                position: "absolute",
                right: "40px",
                bottom: "-20px",
                width: "300px",
                opacity: 0.06,
                pointerEvents: "none",
              }}
            />
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "14px",
            }}
          >
            {metricas.map((item) => (
              <div
                key={item.titulo}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(12,12,12,0.98) 0%, rgba(8,8,8,0.98) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "24px",
                  padding: "22px",
                  minHeight: "140px",
                  boxShadow: "0 0 20px rgba(212,175,55,0.03)",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.40)",
                    marginBottom: "12px",
                  }}
                >
                  {item.titulo}
                </div>

                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 900,
                    marginBottom: "12px",
                  }}
                >
                  {item.valor}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.40)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.subtitulo}
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.7fr",
              gap: "18px",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,12,12,0.98) 0%, rgba(8,8,8,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "28px",
                padding: "26px",
                boxShadow: "0 0 20px rgba(212,175,55,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "24px",
                      fontWeight: 900,
                    }}
                  >
                    {usuario?.permissao === "diretora_tecnica"
                      ? "Cotações monitoradas"
                      : usuario?.permissao === "diretora_financeira"
                      ? "Corretoras monitoradas"
                      : "Corretoras monitoradas"}
                  </h2>

                  <p
                    style={{
                      marginTop: "8px",
                      marginBottom: 0,
                      color: "rgba(255,255,255,0.40)",
                      fontSize: "14px",
                    }}
                  >
                    {usuario?.permissao === "diretora_tecnica"
                      ? "Status técnico, fila de análise e andamento operacional."
                      : usuario?.permissao === "diretora_financeira"
                      ? "Status operacional, plano contratado e dimensão da base."
                      : "Status operacional, plano contratado e dimensão da base."}
                  </p>
                </div>

                <button
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Ver tudo
                </button>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "680px",
                  }}
                >
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th
                        style={{
                          padding: "14px 10px",
                          color: "rgba(255,255,255,0.38)",
                          fontSize: "13px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {usuario?.permissao === "diretora_tecnica"
                          ? "Cotação"
                          : "Corretora"}
                      </th>
                      <th
                        style={{
                          padding: "14px 10px",
                          color: "rgba(255,255,255,0.38)",
                          fontSize: "13px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {usuario?.permissao === "diretora_tecnica"
                          ? "Cliente"
                          : "Plano"}
                      </th>
                      <th
                        style={{
                          padding: "14px 10px",
                          color: "rgba(255,255,255,0.38)",
                          fontSize: "13px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "14px 10px",
                          color: "rgba(255,255,255,0.38)",
                          fontSize: "13px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {usuario?.permissao === "diretora_tecnica"
                          ? "Risco"
                          : "Usuários"}
                      </th>
                      <th
                        style={{
                          padding: "14px 10px",
                          color: "rgba(255,255,255,0.38)",
                          fontSize: "13px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {usuario?.permissao === "diretora_tecnica"
                          ? "Prazo"
                          : "Clientes"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuario?.permissao === "diretora_tecnica" ? (
                      <>
                        {[
                          {
                            coluna1: "Cot-001",
                            coluna2: "Indústria Alpha",
                            status: "Em análise",
                            coluna4: "Alto",
                            coluna5: "Hoje",
                          },
                          {
                            coluna1: "Cot-002",
                            coluna2: "Grupo Vértice",
                            status: "Pendente",
                            coluna4: "Médio",
                            coluna5: "Amanhã",
                          },
                          {
                            coluna1: "Cot-003",
                            coluna2: "Log Prime",
                            status: "Concluída",
                            coluna4: "Baixo",
                            coluna5: "Finalizada",
                          },
                        ].map((linha) => (
                          <tr key={linha.coluna1}>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                fontWeight: 700,
                              }}
                            >
                              {linha.coluna1}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                color: "rgba(255,255,255,0.82)",
                              }}
                            >
                              {linha.coluna2}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  padding: "7px 12px",
                                  borderRadius: "999px",
                                  background: "rgba(212,175,55,0.10)",
                                  border: "1px solid rgba(212,175,55,0.18)",
                                  color: "#d4af37",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                {linha.status}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              {linha.coluna4}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              {linha.coluna5}
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          {
                            coluna1: "SegMax Consultoria",
                            coluna2: "Full",
                            status: "Ativa",
                            coluna4: "8",
                            coluna5: "62",
                          },
                          {
                            coluna1: "Alpha Benefícios",
                            coluna2: "Executive",
                            status: "Ativa",
                            coluna4: "5",
                            coluna5: "41",
                          },
                          {
                            coluna1: "Prime Broker",
                            coluna2: "Elite",
                            status: "Implantação",
                            coluna4: "3",
                            coluna5: "24",
                          },
                        ].map((linha) => (
                          <tr key={linha.coluna1}>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                fontWeight: 700,
                              }}
                            >
                              {linha.coluna1}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                color: "rgba(255,255,255,0.82)",
                              }}
                            >
                              {linha.coluna2}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  padding: "7px 12px",
                                  borderRadius: "999px",
                                  background: "rgba(212,175,55,0.10)",
                                  border: "1px solid rgba(212,175,55,0.18)",
                                  color: "#d4af37",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                {linha.status}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              {linha.coluna4}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              {linha.coluna5}
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,12,12,0.98) 0%, rgba(8,8,8,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "28px",
                padding: "26px",
                boxShadow: "0 0 20px rgba(212,175,55,0.03)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 900,
                }}
              >
                {resumoTitulo}
              </h2>

              <p
                style={{
                  marginTop: "8px",
                  color: "rgba(255,255,255,0.40)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {resumoTexto}
              </p>

              <div
                style={{
                  marginTop: "18px",
                  borderRadius: "24px",
                  padding: "22px",
                  background:
                    "linear-gradient(180deg, rgba(16,16,16,0.98) 0%, rgba(10,10,10,0.98) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.40)",
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  {resumoBloco.titulo}
                </div>

                <div
                  style={{
                    fontSize: "44px",
                    fontWeight: 900,
                    marginBottom: "10px",
                  }}
                >
                  {resumoBloco.valor}
                </div>

                <div
                  style={{
                    color: "rgba(255,255,255,0.58)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  {resumoBloco.texto}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}