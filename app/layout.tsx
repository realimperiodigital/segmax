import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEGMAX CRM",
  description: "CRM profissional para corretoras de seguros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f3f4f6",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            minHeight: "100vh",
          }}
        >
          <aside
            style={{
              background: "#07163a",
              color: "#ffffff",
              padding: "24px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: "bold",
                marginBottom: 12,
              }}
            >
              SEGMAX
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 10,
              }}
            >
              CRM de Seguros
            </div>

            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Link href="/dashboard" style={linkStyle}>
                Dashboard
              </Link>

              <Link href="/clientes" style={linkStyle}>
                Clientes
              </Link>

              <Link href="/clientes/novo" style={linkStyle}>
                Novo Cliente
              </Link>

              <Link href="/clientes/excluidos" style={linkStyle}>
                Clientes Excluídos
              </Link>

              <Link href="/corretoras" style={linkStyle}>
                Corretoras
              </Link>

              <Link href="/corretoras/nova" style={linkStyle}>
                Nova Corretora
              </Link>

              <Link href="/usuarios" style={linkStyle}>
                Usuários
              </Link>

              <Link href="/usuarios/novo" style={linkStyle}>
                Novo Usuário
              </Link>

              <Link href="/cotacoes" style={linkStyle}>
                Cotações
              </Link>

              <Link href="/cotacoes/nova" style={linkStyle}>
                Nova Cotação
              </Link>

              <Link href="#" style={linkStyleDisabled}>
                Apólices
              </Link>

              <Link href="#" style={linkStyleDisabled}>
                Renovações
              </Link>

              <Link href="#" style={linkStyleDisabled}>
                Relatórios
              </Link>
            </nav>

            <div
              style={{
                marginTop: "auto",
                paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,0.15)",
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              Master
              <br />
              segmaxconsultoria10@gmail.com
            </div>
          </aside>

          <main
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <header
              style={{
                height: 72,
                background: "#ffffff",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  SEGMAX CRM
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  Gestão profissional para corretoras de seguros
                </div>
              </div>

              <div
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Ambiente Interno
              </div>
            </header>

            <div
              style={{
                padding: 24,
                flex: 1,
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#ffffff",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.08)",
  fontSize: 15,
  fontWeight: 600,
};

const linkStyleDisabled: React.CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  fontSize: 15,
  fontWeight: 600,
  pointerEvents: "none",
};