'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'

type IsicOption = {
  id: number
  code: string
  name_en: string | null
  name_pt: string | null
  display_name: string | null
}

type Props = {
  valueCode?: string
  valueName?: string
  onSelect: (item: { code: string; name: string }) => void
}

export default function BuscaIsic({
  valueCode = '',
  valueName = '',
  onSelect,
}: Props) {
  const [search, setSearch] = useState(
    valueCode && valueName ? `${valueCode} - ${valueName}` : ''
  )
  const [results, setResults] = useState<IsicOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function buscarIsic(term: string) {
    const valor = term.trim()

    if (valor.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.rpc('search_isic_codes', {
        term: valor,
        max_results: 10,
      })

      if (error) {
        throw error
      }

      setResults((data || []) as IsicOption[])
    } catch (err: any) {
      console.error('Erro ao buscar ISIC:', err)
      setError(err?.message || 'Erro ao buscar ISIC')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarIsic(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  function handleSelect(item: IsicOption) {
    const nome = item.display_name || item.name_pt || item.name_en || ''
    setSearch(`${item.code} - ${nome}`)
    setResults([])
    onSelect({
      code: item.code,
      name: nome,
    })
  }

  function handleClear() {
    setSearch('')
    setResults([])
    setError('')
    onSelect({
      code: '',
      name: '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 relative">
        <label className="block text-sm font-medium text-zinc-900">
          Buscar ISIC
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Digite o código ou o nome em português ou inglês"
          className="w-full rounded-xl border border-zinc-300 px-3 py-3 outline-none focus:border-zinc-500"
        />

        {loading && (
          <p className="text-xs text-zinc-500">Buscando ISIC...</p>
        )}

        {!!error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        {results.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
            {results.map((item) => {
              const nome =
                item.display_name || item.name_pt || item.name_en || ''

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="block w-full border-b border-zinc-100 px-3 py-3 text-left text-sm hover:bg-zinc-50"
                >
                  <span className="font-semibold">{item.code}</span>
                  <span className="text-zinc-700"> - {nome}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Limpar ISIC
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900">
            Código ISIC
          </label>
          <input
            type="text"
            value={valueCode}
            readOnly
            placeholder="Código"
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 text-zinc-700"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-zinc-900">
            Atividade ISIC
          </label>
          <input
            type="text"
            value={valueName}
            readOnly
            placeholder="Atividade"
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 text-zinc-700"
          />
        </div>
      </div>
    </div>
  )
}