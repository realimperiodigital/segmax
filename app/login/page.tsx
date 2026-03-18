export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          padding: 40,
          borderRadius: 16,
          border: "1px solid rgba(212,175,55,0.3)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <h1 style={{ color: "#d4af37" }}>SegMax CRM</h1>
        <p>Página de login funcionando</p>
      </div>
    </main>
  );
}