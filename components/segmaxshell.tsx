"use client";

import SegmaxSidebar from "./segmaxsidebar";

type SegmaxRole =
  | "master"
  | "tecnico"
  | "financeiro"
  | "corretora"
  | "usuario";

type SegmaxShellProps = {
  role: SegmaxRole;
  children: React.ReactNode;
};

export default function SegmaxShell({
  role,
  children,
}: SegmaxShellProps) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <SegmaxSidebar role={role} />

      {/* Conteúdo */}
      <main className="flex-1 bg-black">
        {children}
      </main>
    </div>
  );
}