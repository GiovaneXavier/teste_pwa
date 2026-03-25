'use client'

import { Pergunta, ItemResposta } from '@/types'

interface Props {
  pergunta: Pergunta
  resposta?: ItemResposta
  onChange: (item: ItemResposta) => void
  numero: number
}

export default function PerguntaMultipla({ pergunta, resposta, onChange, numero }: Props) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-salus-700 mb-1">Pergunta {numero}</p>
      <p className="text-base font-semibold text-gray-900 mb-4">{pergunta.texto}</p>
      <div className="space-y-2">
        {pergunta.opcoes.map((opcao) => {
          const selecionado = resposta?.opcaoId === opcao.id
          return (
            <label
              key={opcao.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selecionado
                  ? 'border-salus-600 bg-salus-50 text-salus-800'
                  : 'border-gray-200 bg-white hover:border-salus-300 hover:bg-salus-50/50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selecionado ? 'border-salus-600 bg-salus-600' : 'border-gray-400'
                }`}
              >
                {selecionado && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <input
                type="radio"
                name={`pergunta_${pergunta.id}`}
                value={opcao.id}
                checked={selecionado}
                onChange={() => onChange({ perguntaId: pergunta.id, opcaoId: opcao.id })}
                className="sr-only"
              />
              <span className="text-sm font-medium">{opcao.texto}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
