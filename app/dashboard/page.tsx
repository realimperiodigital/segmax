export default function Dashboard() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 32,
            margin: 0,
            color: "#111827",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            marginTop: 8,
            color: "#6b7280",
            fontSize: 16,
          }}
        >
          Visão geral do CRM SEGMAX
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <Card titulo="Clientes Ativos" valor="0" />
        <Card titulo="Clientes Bloqueados" valor="0" />
        <Card titulo="Clientes Suspensos" valor="0" />
        <Card titulo="Cadastros no Mês" valor="0" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 18,
        }}
      >
        <section
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 22,
              color: "#111827",
            }}
          >
            Resumo Operacional
          </h2>

          <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
            O SEGMAX já está com a base principal rodando:
            login, dashboard, clientes, novo cadastro, edição,
            bloqueio, exclusão com motivo e status com seleção.
          </p>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <MiniBox titulo="Status do sistema" texto="Operando normalmente" />
            <MiniBox titulo="Módulo pronto" texto="Clientes" />
            <MiniBox titulo="Próximo módulo" texto="Corretoras / Usuários" />
            <MiniBox titulo="Etapa atual" texto="Layout profissional" />
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 22,
              color: "#111827",
            }}
          >
            Próximos Passos
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Step texto="Criar tela de clientes excluídos" />
            <Step texto="Restaurar clientes excluídos" />
            <Step texto="Criar módulo de corretoras" />
            <Step texto="Criar módulo de usuários" />
            <Step texto="Criar relatórios" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: "bold",
          color: "#07163a",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function MiniBox({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#111827",
        }}
      >
        {texto}
      </div>
    </div>
  );
}

function Step({ texto }: { texto: string }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "#f9fafb",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        color: "#111827",
        fontWeight: 600,
      }}
    >
      {texto}
    </div>
  );
}