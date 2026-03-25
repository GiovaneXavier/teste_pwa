'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Setor, FaixaEtaria } from '@/types'

interface Props {
  setores: Setor[]
  faixas: FaixaEtaria[]
}

export default function FiltrosRespostas({ setores, faixas }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const [setorId, setSetorId] = useState(sp.get('setorId') ?? '')
  const [faixaEtariaId, setFaixaEtariaId] = useState(sp.get('faixaEtariaId') ?? '')
  const [de, setDe] = useState(sp.get('de') ?? '')
  const [ate, setAte] = useState(sp.get('ate') ?? '')

  function aplicar() {
    const params = new URLSearchParams()
    if (setorId) params.set('setorId', setorId)
    if (faixaEtariaId) params.set('faixaEtariaId', faixaEtariaId)
    if (de) params.set('de', de)
    if (ate) params.set('ate', ate)
    params.set('pagina', '1')
    router.push(`/admin/respostas?${params.toString()}`)
  }

  function limpar() {
    setSetorId('')
    setFaixaEtariaId('')
    setDe('')
    setAte('')
    router.push('/admin/respostas')
  }

  function exportar() {
    const params = new URLSearchParams()
    if (setorId) params.set('setorId', setorId)
    if (faixaEtariaId) params.set('faixaEtariaId', faixaEtariaId)
    if (de) params.set('de', de)
    if (ate) params.set('ate', ate)
    window.open(`/api/export?${params.toString()}`, '_blank')
  }

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-gray-700 text-sm">Filtros</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="label">Setor</label>
          <select value={setorId} onChange={(e) => setSetorId(e.target.value)} className="input">
            <option value="">Todos</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Faixa etária</label>
          <select value={faixaEtariaId} onChange={(e) => setFaixaEtariaId(e.target.value)} className="input">
            <option value="">Todas</option>
            {faixas.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">De</label>
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Até</label>
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="input" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={aplicar} className="btn-primary py-2 px-4 text-sm">
          Filtrar
        </button>
        <button onClick={limpar} className="btn-secondary py-2 px-4 text-sm">
          Limpar
        </button>
        <button
          onClick={exportar}
          className="ml-auto flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Exportar Excel
        </button>
      </div>
    </div>
  )
}
