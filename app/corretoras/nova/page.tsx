export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function NovaCorretoraPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#f5f5f5",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: "16px",
          padding: "24px",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "12px",
            color: "#d4af37",
          }}
        >
          Nova corretora
        </h1>

        <p style={{ fontSize: "16px", lineHeight: 1.6, marginBottom: "16px" }}>
          Esta tela foi isolada temporariamente para não derrubar o deploy da
          plataforma.
        </p>

        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          Depois que o CRM estiver online, retomamos esta página com calma.
        </p>
      </div>
    </main>
  );
}