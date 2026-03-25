'use client'

import { useState } from 'react'
import { Pergunta, ItemResposta } from '@/types'
import PerguntaMultipla from './PerguntaMultipla'
import PerguntaTexto from './PerguntaTexto'

interface Props {
  perguntas: Pergunta[]
  setorId: number
  faixaEtariaId: number
  nomeSetor: string
  onEnviado: () => void
  onVoltar: () => void
}

export default function FormularioSalus({
  perguntas,
  setorId,
  faixaEtariaId,
  nomeSetor,
  onEnviado,
  onVoltar,
}: Props) {
  const [respostas, setRespostas] = useState<Map<number, ItemResposta>>(new Map())
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const obrigatorias = perguntas.filter((p) => p.tipo === 'multipla_escolha')
  const respondidas = obrigatorias.filter((p) => respostas.has(p.id)).length
  const progresso = obrigatorias.length > 0 ? (respondidas / obrigatorias.length) * 100 : 100
  const podeEnviar = respondidas === obrigatorias.length

  function handleResposta(item: ItemResposta) {
    setRespostas((prev) => new Map(prev).set(item.perguntaId, item))
  }

  async function handleSubmit() {
    setEnviando(true)
    setErro(null)
    try {
      const itens = Array.from(respostas.values())
      const response = await fetch('/api/respostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setorId, faixaEtariaId, itens }),
      })

      if (!response.ok) throw new Error('Erro ao enviar')
      onEnviado()
    } catch {
      setErro('Ocorreu um erro ao enviar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-salus-600 text-white px-4 py-4 sticky top-0 z-10 shadow">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={onVoltar} className="p-2 rounded-lg hover:bg-salus-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-sm opacity-80">Setor: {nomeSetor}</p>
            <div className="mt-1 h-2 bg-salus-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold whitespace-nowrap">
            {respondidas}/{obrigatorias.length}
          </span>
        </div>
      </div>

      {/* Perguntas */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {perguntas.map((pergunta, index) => (
          pergunta.tipo === 'multipla_escolha' ? (
            <PerguntaMultipla
              key={pergunta.id}
              pergunta={pergunta}
              resposta={respostas.get(pergunta.id)}
              onChange={handleResposta}
              numero={index + 1}
            />
          ) : (
            <PerguntaTexto
              key={pergunta.id}
              pergunta={pergunta}
              resposta={respostas.get(pergunta.id)}
              onChange={handleResposta}
              numero={index + 1}
            />
          )
        ))}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {erro}
          </div>
        )}

        {!podeEnviar && (
          <p className="text-center text-sm text-gray-500">
            Responda todas as perguntas obrigatórias para enviar.
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!podeEnviar || enviando}
          className="btn-primary w-full text-lg mt-4"
        >
          {enviando ? 'Enviando...' : 'Enviar respostas'}
        </button>
      </div>
    </div>
  )
}
