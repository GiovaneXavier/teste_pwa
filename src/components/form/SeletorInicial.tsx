'use client'

import { Setor, FaixaEtaria } from '@/types'

interface Props {
  setores: Setor[]
  faixas: FaixaEtaria[]
  setorId: number | null
  faixaEtariaId: number | null
  onSetorChange: (id: number) => void
  onFaixaChange: (id: number) => void
  onIniciar: () => void
}

export default function SeletorInicial({
  setores,
  faixas,
  setorId,
  faixaEtariaId,
  onSetorChange,
  onFaixaChange,
  onIniciar,
}: Props) {
  const podeIniciar = setorId !== null && faixaEtariaId !== null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-salus-50 to-white p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-salus-600 rounded-3xl mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-salus-800">Salus</h1>
          <p className="text-gray-500 mt-1">Pesquisa de Segurança — EHS</p>
        </div>

        {/* Seletor Setor */}
        <div className="card space-y-6">
          <div>
            <label className="label">Seu setor</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {setores.map((setor) => (
                <button
                  key={setor.id}
                  type="button"
                  onClick={() => onSetorChange(setor.id)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    setorId === setor.id
                      ? 'border-salus-600 bg-salus-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-salus-400'
                  }`}
                >
                  {setor.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor Faixa Etária */}
          <div>
            <label className="label">Faixa etária</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {faixas.map((faixa) => (
                <button
                  key={faixa.id}
                  type="button"
                  onClick={() => onFaixaChange(faixa.id)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    faixaEtariaId === faixa.id
                      ? 'border-salus-600 bg-salus-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-salus-400'
                  }`}
                >
                  {faixa.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onIniciar}
            disabled={!podeIniciar}
            className="btn-primary w-full text-lg"
          >
            Iniciar pesquisa →
          </button>
        </div>
      </div>
    </div>
  )
}
