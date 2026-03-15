import type { ReactNode } from "react";

export default function UsuariosLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {children}
    </div>
  );
}