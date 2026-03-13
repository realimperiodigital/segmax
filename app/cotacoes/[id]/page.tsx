import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type PageProps = {
  params: {
    id: string
  }
}

type QuoteRow = {
  id: number
  client_id: number | null
  insurer_id: number | null
  status: string | null
  estimated_value: number | null
  notes: string | null
  technical_analysis: string | null
  created_at?: string | null
}

type ClientRow = {
  id: number
  name: string
  document?: string | null
}

type InsurerRow = {
  id: number
  name: string
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Não informado'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return 'Não informado'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function formatStatus(status?: string | null) {
  if (!status) return 'Não informado'

  const map: Record<string, string> = {
    nova: 'Nova',
    em_analise: 'Em análise',
    cotada: 'Cotada',
    fechada: 'Fechada',
    perdida: 'Perdida',
  }

  return map[status] || status
}

function statusClasses(status?: string | null) {
  switch (status) {
    case 'nova':
      return 'bg-blue-50 text-blue-700 ring-blue-200'
    case 'em_analise':
      return 'bg-yellow-50 text-yellow-700 ring-yellow-200'
    case 'cotada':
      return 'bg-purple-50 text-purple-700 ring-purple-200'
    case 'fechada':
      return 'bg-green-50 text-green-700 ring-green-200'
    case 'perdida':
      return 'bg-red-50 text-red-700 ring-red-200'
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-200'
  }
}

export default async function CotacaoDetalhePage({ params }: PageProps) {
  const quoteId = Number(params.id)

  if (!quoteId || Number.isNaN(quoteId)) {
    notFound()
  }

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, client_id, insurer_id, status, estimated_value, notes, technical_analysis, created_at')
    .eq('id', quoteId)
    .single()

  if (quoteError || !quote) {
    notFound()
  }

  const quoteRow = quote as QuoteRow

  let client: ClientRow | null = null
  let insurer: InsurerRow | null = null

  if (quoteRow.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name, document')
      .eq('id', quoteRow.client_id)
      .single()

    client = (clientData as ClientRow) || null
  }

  if (quoteRow.insurer_id) {
    const { data: insurerData } = await supabase
      .from('insurers')
      .select('id, name')
      .eq('id', quoteRow.insurer_id)
      .single()

    insurer = (insurerData as InsurerRow) || null
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Cotação #{quoteRow.id}</p>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes da Cotação</h1>
            <p className="mt-2 text-sm text-gray-600">
              Visualize os dados principais e a análise técnica automática.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/cotacoes"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Voltar
            </Link>
            <Link
              href={`/cotacoes/${quoteRow.id}/editar`}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Editar cotação
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Resumo</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${statusClasses(quoteRow.status)}`}>
                      {formatStatus(quoteRow.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Valor estimado</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {formatMoney(quoteRow.estimated_value)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Criada em</p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(quoteRow.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Cliente</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nome</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {client?.name || 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Documento</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {client?.document || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Seguradora</h2>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nome</p>
                <p className="mt-1 text-sm text-gray-900">
                  {insurer?.name || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Observações</h2>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                  {quoteRow.notes?.trim() || 'Nenhuma observação informada.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Análise Técnica</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Texto gerado automaticamente com base no questionário da cotação.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                  {quoteRow.technical_analysis?.trim() || 'Nenhuma análise técnica gerada para esta cotação.'}
                </pre>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Próximo passo ideal</h2>

              <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <p className="text-sm leading-6 text-amber-900">
                  Agora o SegMax já consegue salvar e exibir a análise. O próximo passo forte é criar o
                  motor que transforma respostas do questionário em sugestão de coberturas, limites,
                  observações comerciais e aumento de ticket médio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}