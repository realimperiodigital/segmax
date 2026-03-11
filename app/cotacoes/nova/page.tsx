'use client'

import { useState } from 'react'
import BuscaIsic from '../../../components/cotacoes/buscaisic'
import QuestionarioRiscos from '../../../components/cotacoes/questionarioriscos'

type AbaAtiva = 'dados' | 'isic' | 'questionario'

export default function NovaCotacaoPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('dados')

  const [form, setForm] = useState({
    empresa_nome: '',
    cnpj: '',
    isic_code: '',
    isic_name: '',
    observacoes: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    console.log('Nova cotação:', form)
    alert('Estrutura da cotação preenchida. O próximo passo é ligar o salvamento completo no banco.')
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Nova Cotação Empresarial
          </h1>
          <p className="mt-2 text-base text-zinc-500">
            Busca ISIC estável e questionário dentro da cotação.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-300 p-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setAbaAtiva('dados')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                abaAtiva === 'dados'
                  ? 'bg-black text-white'
                  : 'border border-zinc-300 bg-white text-zinc-800'
              }`}
            >
              Dados principais
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('isic')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                abaAtiva === 'isic'
                  ? 'bg-black text-white'
                  : 'border border-zinc-300 bg-white text-zinc-800'
              }`}
            >
              Busca ISIC
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('questionario')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                abaAtiva === 'questionario'
                  ? 'bg-black text-white'
                  : 'border border-zinc-300 bg-white text-zinc-800'
              }`}
            >
              Questionário empresarial
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {abaAtiva === 'dados' && (
            <div className="rounded-3xl border border-zinc-300 p-6">
              <h2 className="mb-6 text-2xl font-bold text-zinc-900">
                Dados da Empresa
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-900">
                    Nome da Empresa
                  </label>
                  <input
                    name="empresa_nome"
                    value={form.empresa_nome}
                    onChange={handleChange}
                    placeholder="Razão social"
                    className="w-full rounded-2xl border border-zinc-400 px-4 py-3 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-900">
                    CNPJ
                  </label>
                  <input
                    name="cnpj"
                    value={form.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full rounded-2xl border border-zinc-400 px-4 py-3 outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="block text-sm font-medium text-zinc-900">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Informações adicionais para análise de risco"
                  className="w-full rounded-2xl border border-zinc-400 px-4 py-3 outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}

          {abaAtiva === 'isic' && (
            <div className="rounded-3xl border border-zinc-300 p-6">
              <h2 className="mb-6 text-2xl font-bold text-zinc-900">
                Atividade da Empresa
              </h2>

              <BuscaIsic
                valueCode={form.isic_code}
                valueName={form.isic_name}
                onSelect={({ code, name }) =>
                  setForm((prev) => ({
                    ...prev,
                    isic_code: code,
                    isic_name: name,
                  }))
                }
              />
            </div>
          )}

          {abaAtiva === 'questionario' && (
            <div className="rounded-3xl border border-zinc-300 p-6">
              <QuestionarioRiscos initialSlug="middle-risks" />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-2xl bg-black px-6 py-3 text-base font-medium text-white transition hover:opacity-90"
            >
              Criar Cotação
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}