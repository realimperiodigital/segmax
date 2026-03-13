'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Client = {
  id: number
  name: string
  document?: string | null
}

type Insurer = {
  id: number
  name: string
}

type QuoteInsert = {
  client_id: number | null
  insurer_id: number | null
  status: string
  estimated_value: number | null
  notes: string | null
  technical_analysis?: string | null
}

export default function NovaCotacaoPage() {
  const router = useRouter()

  const [loadingPage, setLoadingPage] = useState(true)
  const [saving, setSaving] = useState(false)

  const [clients, setClients] = useState<Client[]>([])
  const [insurers, setInsurers] = useState<Insurer[]>([])

  const [clientId, setClientId] = useState<string>('')
  const [insurerId, setInsurerId] = useState<string>('')
  const [status, setStatus] = useState('nova')
  const [estimatedValue, setEstimatedValue] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [technicalPreview, setTechnicalPreview] = useState('')

  async function carregarDadosIniciais() {
    try {
      setLoadingPage(true)

      const [clientsResponse, insurersResponse] = await Promise.all([
        supabase.from('clients').select('id, name, document').order('name', { ascending: true }),
        supabase.from('insurers').select('id, name').order('name', { ascending: true }),
      ])

      if (clientsResponse.error) {
        throw new Error(`Erro ao carregar clientes: ${clientsResponse.error.message}`)
      }

      if (insurersResponse.error) {
        throw new Error(`Erro ao carregar seguradoras: ${insurersResponse.error.message}`)
      }

      setClients((clientsResponse.data || []) as Client[])
      setInsurers((insurersResponse.data || []) as Insurer[])
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Erro ao carregar dados iniciais.')
    } finally {
      setLoadingPage(false)
    }
  }

  useEffect(() => {
    carregarDadosIniciais()
  }, [])

  async function gerarAnaliseTecnica(quoteId: number): Promise<string> {
    const { data, error } = await supabase.rpc('generate_technical_analysis', {
      p_quote_id: quoteId,
    })

    if (error) {
      throw new Error(`Erro ao gerar análise técnica: ${error.message}`)
    }

    return typeof data === 'string' ? data : ''
  }

  async function salvarCotacao() {
    try {
      setSaving(true)

      if (!clientId) {
        alert('Selecione o cliente.')
        return
      }

      const payload: QuoteInsert = {
        client_id: Number(clientId),
        insurer_id: insurerId ? Number(insurerId) : null,
        status: status || 'nova',
        estimated_value: estimatedValue ? Number(estimatedValue.replace(',', '.')) : null,
        notes: notes.trim() ? notes.trim() : null,
        technical_analysis: null,
      }

      const { data: insertedQuote, error: insertError } = await supabase
        .from('quotes')
        .insert(payload)
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Erro ao salvar cotação: ${insertError.message}`)
      }

      const quoteId = insertedQuote.id as number

      let analysisText = ''

      try {
        analysisText = await gerarAnaliseTecnica(quoteId)
        setTechnicalPreview(analysisText)
      } catch (analysisError: any) {
        console.error(analysisError)
      }

      if (analysisText) {
        const { error: updateError } = await supabase
          .from('quotes')
          .update({ technical_analysis: analysisText })
          .eq('id', quoteId)

        if (updateError) {
          throw new Error(`Cotação salva, mas houve erro ao gravar a análise técnica: ${updateError.message}`)
        }
      }

      alert('Cotação salva com sucesso.')
      router.push(`/cotacoes/${quoteId}`)
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Erro inesperado ao salvar cotação.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Nova Cotação</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preencha os dados principais da cotação. Após salvar, a análise técnica será gerada automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {loadingPage ? (
              <div className="py-10 text-center text-gray-500">Carregando dados...</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Cliente *
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                        {client.document ? ` - ${client.document}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Seguradora
                  </label>
                  <select
                    value={insurerId}
                    onChange={(e) => setInsurerId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  >
                    <option value="">Selecione uma seguradora</option>
                    {insurers.map((insurer) => (
                      <option key={insurer.id} value={insurer.id}>
                        {insurer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                    >
                      <option value="nova">Nova</option>
                      <option value="em_analise">Em análise</option>
                      <option value="cotada">Cotada</option>
                      <option value="fechada">Fechada</option>
                      <option value="perdida">Perdida</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Valor estimado
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      placeholder="Ex.: 1500.00"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Digite observações importantes da cotação..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={salvarCotacao}
                    disabled={saving}
                    className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Salvando...' : 'Salvar cotação'}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/cotacoes')}
                    disabled={saving}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Análise técnica</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ela será gerada automaticamente após salvar a cotação.
            </p>

            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              {technicalPreview ? (
                <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                  {technicalPreview}
                </pre>
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhuma análise gerada ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}