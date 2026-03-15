export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}