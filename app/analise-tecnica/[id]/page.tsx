"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  TriangleAlert,
  ClipboardList,
  CheckCircle2,
  FileText,
  Gauge,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type NivelRisco = "Baixo" | "Médio" | "Alto" | "Crítico";

type Analise = {
  id: string;
  cliente: string;
  ramo: string;
  seguradora: string;
  risco: NivelRisco;
  score: number;
  parecer: string;
  pontosCriticos: string;
  recomendacoes: string;
};

const menuItems: SegmaxMenuItem[] = [
  { label: "Centro de Controle", href: "/dashboard", exact: true },
  { label: "Corretoras", href: "/corretoras" },
  { label: "Usuários", href: "/usuarios" },
  { label: "Clientes", href: "/clientes" },
  { label: "Seguradoras", href: "/seguradoras" },
  { label: "Cotações", href: "/cotacoes" },
  { label: "Análise Técnica", href: "/analise-tecnica" },
  { label: "Financeiro", href: "/financeiro" },
];

const analisesMock: Analise[] = [
  {
    id: "1",
    cliente: "Grupo Alpha Logística",
    ramo: "Patrimonial Empresarial",
    seguradora: "Porto Seguro",
    risco: "Médio",
    score: 62,
    parecer:
      "Risco moderado, com exposição relevante ao estoque e movimentação operacional contínua. Recomendável validação documental das proteções contra incêndio.",
    pontosCriticos:
      "Concentração de estoque, ausência de laudo atualizado do sistema preventivo e dependência operacional logística.",
    recomendacoes:
      "Solicitar documentação técnica de prevenção, validar brigada de incêndio e revisar sistema de detecção.",
  },
  {
    id: "2",
    cliente: "Metalúrgica Horizonte",
    ramo: "Patrimonial Industrial",
    seguradora: "Tokio Marine",
    risco: "Alto",
    score: 38,
    parecer:
      "Risco elevado devido à concentração de equipamentos industriais e processos com potencial de impacto operacional.",
    pontosCriticos:
      "Máquinas industriais críticas, dependência produtiva e histórico de manutenção parcial.",
    recomendacoes:
      "Exigir laudos técnicos, revisão de manutenção preventiva e validação de sistema de combate a incêndio.",
  },
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[28px] border border-[#d4af37]/14 bg-black/45 p-6 backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function RiskBadge({ risk }: { risk: NivelRisco }) {
  const styles: Record<NivelRisco, string> = {
    Baixo: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Médio: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Alto: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    Crítico: "bg-red-500/15 text-red-300 border-red-500/30",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${styles[risk]}`}>
      {risk}
    </span>
  );
}

export default function AnaliseTecnicaPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const analise = analisesMock.find((a) => a.id === id);

  if (!analise) {
    return (
      <SegmaxShell
        title="Análise não encontrada"
        subtitle="Não foi possível localizar este registro."
        badge="Motor técnico SegMax"
        username="Renato"
        userrole="Super Master"
        menuitems={menuItems}
      >
        <SectionCard>
          <p className="text-zinc-300">
            Registro inexistente. Volte para as cotações.
          </p>
        </SectionCard>
      </SegmaxShell>
    );
  }

  return (
    <SegmaxShell
      title="Análise técnica"
      subtitle="Motor de leitura de risco SegMax"
      badge="Motor técnico"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <Link
          href="/cotacoes"
          className="flex items-center gap-2 rounded-xl border px-4 py-2"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Nível de risco</p>
            <RiskBadge risk={analise.risco} />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Gauge size={26} />
            <div>
              <p className="text-sm text-zinc-400">Score técnico</p>
              <h3 className="text-3xl font-semibold text-white">
                {analise.score}
              </h3>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <ClipboardList />
            <h2 className="font-semibold text-white">Cliente</h2>
          </div>

          <p className="mt-4 text-zinc-300">{analise.cliente}</p>
          <p className="text-sm text-zinc-400">{analise.ramo}</p>
          <p className="text-sm text-zinc-400">{analise.seguradora}</p>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <CheckCircle2 />
            <h2 className="font-semibold text-white">Parecer resumido</h2>
          </div>

          <p className="mt-4 leading-7 text-zinc-300">{analise.parecer}</p>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard>
          <div className="flex items-center gap-3">
            <TriangleAlert />
            <h2 className="font-semibold text-white">Pontos críticos</h2>
          </div>

          <p className="mt-4 leading-7 text-zinc-300">
            {analise.pontosCriticos}
          </p>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <ShieldCheck />
            <h2 className="font-semibold text-white">Recomendações</h2>
          </div>

          <p className="mt-4 leading-7 text-zinc-300">
            {analise.recomendacoes}
          </p>
        </SectionCard>
      </div>

      <SectionCard className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText />
            <h2 className="font-semibold text-white">
              Parecer técnico completo
            </h2>
          </div>

          <Link
            href={`/analise-tecnica/${analise.id}/parecer`}
            className="rounded-xl border border-[#d4af37] bg-[#d4af37] px-5 py-2 font-semibold text-black"
          >
            Emitir parecer
          </Link>
        </div>
      </SectionCard>
    </SegmaxShell>
  );
}