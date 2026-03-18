import SegmaxShell from "@/components/segmaxshell";

type PageProps = {
  params: {
    id: string;
  };
};

export default function ParecerTecnicoPage({ params }: PageProps) {
  const cotacaoId = params?.id || "—";

  return (
    <SegmaxShell
      nome="Ana Paula"
      perfilLabel="DIRETORA TÉCNICA"
      permissao="diretora_tecnica"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-yellow-700/20 bg-zinc-950 p-8">
          <div className="inline-flex rounded-full border border-yellow-700/30 bg-yellow-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-yellow-400">
            Parecer técnico SegMax
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
            Parecer técnico da demanda
          </h1>

          <p className="mt-3 max-w-4xl text-base leading-8 text-zinc-400">
            Análise técnica detalhada da operação, com foco em criticidade,
            exposição, consistência documental e recomendação objetiva para
            avanço comercial.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Identificação da análise
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    ID da cotação
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {cotacaoId}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Status técnico
                  </p>
                  <p className="mt-2 text-lg font-semibold text-yellow-400">
                    Em análise
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Analista responsável
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Ana Paula
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Prioridade
                  </p>
                  <p className="mt-2 text-lg font-semibold text-red-400">
                    Alta
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Diagnóstico técnico
              </h2>

              <div className="mt-6 space-y-4 text-zinc-300 leading-7">
                <p>
                  A operação apresenta perfil patrimonial relevante, com pontos
                  sensíveis de exposição e necessidade de validação fina das
                  informações prestadas antes do avanço definitivo.
                </p>

                <p>
                  Foram identificados elementos que exigem atenção especial na
                  etapa técnica, principalmente em relação à consistência dos
                  dados operacionais, enquadramento do risco e aderência entre a
                  documentação enviada e a realidade declarada pelo cliente.
                </p>

                <p>
                  Neste momento, a recomendação técnica é manter o processo em
                  análise controlada, com retorno consultivo para ajuste e
                  saneamento das pendências identificadas.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Pendências identificadas
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-red-700/30 bg-red-500/10 p-4">
                  <h3 className="text-lg font-semibold text-red-300">
                    Inconsistência documental
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Há divergência entre dados cadastrais e documentos anexados,
                    exigindo nova validação antes da continuidade.
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-700/30 bg-yellow-500/10 p-4">
                  <h3 className="text-lg font-semibold text-yellow-300">
                    Ajuste de enquadramento
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    O enquadramento técnico do risco precisa ser revisado para
                    refletir com precisão a atividade e a exposição real da
                    operação.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-700/30 bg-blue-500/10 p-4">
                  <h3 className="text-lg font-semibold text-blue-300">
                    Complemento de informações
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Ainda faltam dados operacionais essenciais para emissão de
                    parecer conclusivo com segurança técnica.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">
                Direcionamento técnico
              </h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Criticidade
                  </p>
                  <p className="mt-2 text-lg font-semibold text-red-400">
                    Alta
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Recomendação
                  </p>
                  <p className="mt-2 text-lg font-semibold text-yellow-400">
                    Ajustar antes de avançar
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Próxima ação
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Solicitar revisão documental
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">
                Parecer resumido
              </h2>

              <p className="mt-4 text-sm leading-7 text-zinc-300">
                A demanda possui potencial de continuidade, porém ainda não está
                madura para aprovação técnica final. O cenário recomenda
                correção orientada, validação documental e saneamento dos pontos
                críticos antes do envio comercial definitivo.
              </p>
            </section>
          </div>
        </section>
      </div>
    </SegmaxShell>
  );
}